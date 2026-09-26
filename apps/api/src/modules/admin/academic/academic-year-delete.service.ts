import {
	BadRequestException,
	Injectable,
	InternalServerErrorException,
	Logger,
	NotFoundException,
	UnprocessableEntityException,
} from "@nestjs/common"
import { DataSource, type EntityManager } from "typeorm"

import type { AcademicYearDeleteTarget } from "@admin/academic/academic-year-admin.service"
import type { AdminRedirectResult } from "@admin/common/admin-response.dto"

export type AcademicYearDeleteStep = {
	id: number
	year: string | null
	step: AcademicYearDeleteTarget
	/**
	 * true => the "Ya, hapus" button renders at 0.2 opacity with pointer-events:none
	 * (`.tbr_bulk_action.opacity`). Legacy has no `disabled` attribute and does not
	 * re-check on submit; the port keeps the look and adds the server-side check.
	 */
	locked: boolean
	/** Set when the data changed underneath and this step no longer applies. */
	redirect: string | null
}

type YearSqlRow = {
	id: string
	year: string | null
	registrantCount: string
	studentGradeCount: string
	alumniCount: string
	registrantActive: boolean
	studentActive: boolean
}

const STEPS: readonly AcademicYearDeleteTarget[] = [
	"delete",
	"delegate-registrant",
	"delegate-student",
	"delegate-alumni",
]

const DELETE_SUCCESS = "Data berhasil dihapus dari basis data."
const DELETE_FAILED = "Data gagal dihapus dari basis data."
const delegateSuccess = (society: string): string => `Data ${society} berhasil didistribusikan ke tahun ajaran lain.`
const delegateFailed = (society: string): string => `Data ${society} gagal didistribusikan ke tahun ajaran lain.`

const YEARS_PATH = "/academic-years"
const stepPath = (id: number, step: AcademicYearDeleteTarget): string => `/academic-years/${id}/${step}`

/**
 * One row plus everything the four pages branch on.
 *
 * `current_academic_year` holds the year *string*, not an id, and `StudentGrade` and `Student`
 * both use `SoftDeletes` — so both counts and both "is anything still active" probes carry
 * `deleted_at IS NULL`, exactly as the Eloquent relations did. A NULL `year` matches nothing
 * (plain `=`), which is the safe reading: `IS NOT DISTINCT FROM` would sweep up every
 * student_grade whose `current_academic_year` is NULL.
 */
const YEAR_SQL = `SELECT y.id, y.year,
		(SELECT count(*) FROM tbr_registrants r WHERE r.academic_year_id = y.id) AS "registrantCount",
		(SELECT count(*) FROM tbr_student_grades sg
			WHERE sg.current_academic_year = y.year AND sg.deleted_at IS NULL) AS "studentGradeCount",
		(SELECT count(*) FROM tbr_alumnis a WHERE a.academic_year_id = y.id) AS "alumniCount",
		EXISTS (SELECT 1 FROM tbr_registrants r
			WHERE r.academic_year_id = y.id AND r.is_blocked IS DISTINCT FROM true) AS "registrantActive",
		EXISTS (SELECT 1 FROM tbr_students s
			WHERE s.deleted_at IS NULL
				AND (s.is_blocked IS DISTINCT FROM true OR s.student_status = 'active')
				AND EXISTS (SELECT 1 FROM tbr_student_grades sg
					WHERE sg.student_id = s.id AND sg.current_academic_year = y.year
						AND sg.deleted_at IS NULL)) AS "studentActive"
	FROM tbr_academic_years y
	WHERE y.id = $1`

/** Kept from legacy, but keyed on the name rather than `id = 1`; in this database they coincide. */
const ARCHIVE_SQL = `SELECT y.id FROM tbr_academic_years y WHERE y.year = 'Archive' ORDER BY y.id LIMIT 1`

const MOVE_REGISTRANTS_SQL = `UPDATE tbr_registrants SET academic_year_id = $2, updated_at = now()
	WHERE academic_year_id = $1`
const MOVE_STUDENTS_SQL = `UPDATE tbr_students SET academic_year_id = $2, updated_at = now()
	WHERE academic_year_id = $1 AND deleted_at IS NULL`
/**
 * The lowercase sentinel is deliberate: `'archive'` matches no `academic_years.year` value,
 * and consumers outside this port read it, so both it and `grade_status = 'inactive'` stay
 * byte-exact.
 */
const ARCHIVE_STUDENT_GRADES_SQL = `UPDATE tbr_student_grades
	SET current_academic_year = 'archive', grade_status = 'inactive', updated_at = now()
	WHERE current_academic_year = $1 AND deleted_at IS NULL`
const MOVE_ALUMNI_SQL = `UPDATE tbr_alumnis SET academic_year_id = $2, updated_at = now()
	WHERE academic_year_id = $1`

// `AcademicYear::delete()` is overridden: detach the level pivots, hard-delete the registrants,
// then delete the row. `Registrant` has no `deleted_at` column, so that really is a hard delete.
const DETACH_QUOTA_SQL = `DELETE FROM tbr_level_academic_years WHERE academic_year_id = $1`
const DELETE_REGISTRANTS_SQL = `DELETE FROM tbr_registrants WHERE academic_year_id = $1`
const DELETE_YEAR_SQL = `DELETE FROM tbr_academic_years WHERE id = $1`

const deleteTargetOf = (row: YearSqlRow): AcademicYearDeleteTarget => {
	if (Number(row.registrantCount) > 0) return "delegate-registrant"
	if (Number(row.studentGradeCount) > 0) return "delegate-student"
	if (Number(row.alumniCount) > 0) return "delegate-alumni"
	return "delete"
}

const lockedOn = (row: YearSqlRow, step: AcademicYearDeleteTarget): boolean => {
	if (step === "delegate-registrant") return row.registrantActive
	if (step === "delegate-student") return row.studentActive
	// The alumni page and the plain delete carry no `tbr_bulk_action` class at all
	return false
}

/**
 * Port of the legacy `AcademicYearController` delete half: `showDeleteForm`,
 * `showDelegateRegistrantForm` / `delegateRegistrant`, `showDelegateStudentForm` /
 * `delegateStudent`, `showDelegateAlumniForm` / `delegateAlumni` and `destroy`.
 *
 * The chain is verbatim legacy: each handler moves its rows to the Archive year, then
 * checks what is left and answers `{message, redirect}` pointing at the next step, or
 * at the list once nothing remains. Two fixes (plan decisions):
 *   * the whole chain runs in one transaction with set-based UPDATEs — legacy looped
 *     row by row with no transaction at all (B-8/B-9);
 *   * a failed delete answers 500. Legacy's catch block had a misplaced paren and
 *     returned HTTP 200 with `{"message": "...gagal...", "0": 500}`, so the UI showed a
 *     success toast after destroying the year's registrants (B-4).
 */
@Injectable()
export class AcademicYearDeleteService {
	private readonly logger = new Logger(AcademicYearDeleteService.name)

	constructor(private readonly dataSource: DataSource) {}

	/** Backs the four delete/delegate pages; `step` is the page the client is rendering. */
	async findStep(id: number, step: AcademicYearDeleteTarget): Promise<AcademicYearDeleteStep> {
		if (!STEPS.includes(step)) throw new BadRequestException("Langkah hapus tidak dikenal.")
		const row = await this.requireYear(id)
		const target = deleteTargetOf(row)
		return {
			id: Number(row.id),
			year: row.year,
			step,
			locked: lockedOn(row, step),
			// The destroy icon was chosen when the list rendered; the data may have moved since
			redirect: target === step ? null : stepPath(id, target),
		}
	}

	async remove(id: number): Promise<AdminRedirectResult> {
		await this.requireYear(id)
		try {
			await this.dataSource.transaction((manager) => this.deleteYear(manager, id))
		} catch (error) {
			this.logger.error(error instanceof Error ? error.message : String(error))
			throw new InternalServerErrorException(DELETE_FAILED)
		}
		return { message: DELETE_SUCCESS, redirect: YEARS_PATH }
	}

	async delegateRegistrant(id: number): Promise<AdminRedirectResult> {
		const row = await this.requireYear(id)
		// Legacy rendered the button unclickable and never re-checked; the port does
		if (row.registrantActive) throw new UnprocessableEntityException(delegateFailed("PSB"))
		return this.runStep(id, "PSB", async (manager, archiveId) => {
			await manager.query(MOVE_REGISTRANTS_SQL, [id, archiveId])
		})
	}

	async delegateStudent(id: number): Promise<AdminRedirectResult> {
		const row = await this.requireYear(id)
		if (row.studentActive) throw new UnprocessableEntityException(delegateFailed("Santri"))
		return this.runStep(id, "Santri", async (manager, archiveId) => {
			await manager.query(MOVE_STUDENTS_SQL, [id, archiveId])
			await manager.query(ARCHIVE_STUDENT_GRADES_SQL, [row.year])
		})
	}

	/** Terminal step — legacy runs no further checks here and never locks the button. */
	async delegateAlumni(id: number): Promise<AdminRedirectResult> {
		await this.requireYear(id)
		return this.runStep(id, "Alumni", async (manager, archiveId) => {
			await manager.query(MOVE_ALUMNI_SQL, [id, archiveId])
		})
	}

	/**
	 * One step of the chain: move this society's rows to Archive, then re-read what is left
	 * and either hand the client the next page or delete the year and send it to the list.
	 *
	 * Every branch answers the *moving* society's message, which is what legacy does — so the
	 * toast names the rows that just moved, not the page you land on.
	 */
	private async runStep(
		id: number,
		society: string,
		move: (manager: EntityManager, archiveId: number) => Promise<void>,
	): Promise<AdminRedirectResult> {
		try {
			return await this.dataSource.transaction(async (manager) => {
				const archiveId = await this.requireArchive(manager)
				await move(manager, archiveId)

				const [row] = await manager.query<YearSqlRow[]>(YEAR_SQL, [id])
				const target = row ? deleteTargetOf(row) : "delete"
				if (target !== "delete") {
					return { message: delegateSuccess(society), redirect: stepPath(id, target) }
				}

				await this.deleteYear(manager, id)
				return { message: delegateSuccess(society), redirect: YEARS_PATH }
			})
		} catch (error) {
			this.logger.error(error instanceof Error ? error.message : String(error))
			throw new InternalServerErrorException(delegateFailed(society))
		}
	}

	private async deleteYear(manager: EntityManager, id: number): Promise<void> {
		await manager.query(DETACH_QUOTA_SQL, [id])
		await manager.query(DELETE_REGISTRANTS_SQL, [id])
		await manager.query(DELETE_YEAR_SQL, [id])
	}

	private async requireArchive(manager: EntityManager): Promise<number> {
		const [row] = await manager.query<{ id: string }[]>(ARCHIVE_SQL)
		if (!row) throw new Error("Tahun ajaran 'Archive' tidak ada — tujuan delegasi tidak diketahui.")
		return Number(row.id)
	}

	private async requireYear(id: number): Promise<YearSqlRow> {
		const [row] = await this.dataSource.query<YearSqlRow[]>(YEAR_SQL, [id])
		// Legacy route-model binding: a missing year is a 404 before the handler runs
		if (!row) throw new NotFoundException("Tahun ajaran tidak ditemukan.")
		// Legacy renders no Actions cell for the Archive row, so none of this was reachable;
		// with no foreign keys, deleting the delegation target would orphan silently.
		if (row.year === "Archive") {
			throw new UnprocessableEntityException("Tahun ajaran Archive tidak dapat dihapus.")
		}
		return row
	}
}
