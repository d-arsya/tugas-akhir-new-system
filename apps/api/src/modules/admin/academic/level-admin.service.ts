import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { DataSource, IsNull, Not, Repository, type EntityManager } from "typeorm"

import { throwFieldErrors } from "@core/errors/field-errors"
import { indoDateTimeDot } from "@admin/common/date-format"
import {
	LEVEL_BY_ID_SQL,
	LEVEL_CREATE_QUOTA_SQL,
	LEVEL_LIST_SQL,
	UPDATE_QUOTA_SQL,
	type LevelSqlRow,
} from "@admin/academic/level-sql"
import type { LevelDelegateInput, LevelWriteInput } from "@admin/academic/dto/level-admin.dto"
import type { AdminRedirectResult } from "@admin/common/admin-response.dto"
import { Registrant } from "@psb/entities/registrant.entity"
import { StudentGrade } from "@santri/entities/student-grade.entity"
import { Grade } from "@shared/master/entities/grade.entity"
import { LevelAcademicYear } from "@shared/master/entities/level-academic-year.entity"
import { Level } from "@shared/master/entities/level.entity"
import { Major } from "@shared/master/entities/major.entity"

export type LevelDeleteTarget =
	| "delete"
	| "delegate-major"
	| "delegate-grade"
	| "delegate-registrant"
	| "delegate-student"

export type LevelRow = {
	id: number
	name: string | null
	status: "show" | "hide" | null
	createdAt: string
	createdAtTs: number
	deleteTarget: LevelDeleteTarget
}

export type LevelDetail = {
	id: number
	name: string | null
	status: "show" | "hide" | null
}

export type LevelOption = {
	id: number
	name: string | null
}

export type LevelDeleteStep = {
	id: number
	name: string | null
	step: LevelDeleteTarget
	/** Every other level, in database order — the destination picker. Empty for a plain delete. */
	levels: LevelOption[]
	redirect: string | null
}

const STEPS: readonly LevelDeleteTarget[] = [
	"delete",
	"delegate-major",
	"delegate-grade",
	"delegate-registrant",
	"delegate-student",
]

// `resources/lang/id/admin.php`, plus the two literals `LevelController` hard-codes.
const CREATE_SUCCESS = "Data berhasil disimpan ke dalam basis data."
const CREATE_FAILED = "Terjadi kesalahan. Data gagal disimpan ke dalam basis data."
const DELETE_SUCCESS = "Data berhasil dihapus dari basis data."
/** Verbatim: the Jenjang literal has no trailing full stop, unlike the lang file's. */
const DELETE_FAILED = "Data gagal dihapus dari basis data"
/** All four delegate handlers answer `admin.update-failed`, not `delegate-failed`. */
const UPDATE_FAILED = "Data gagal diupdate."
// ":society" reads "tahun ajaran lain" even here — the Jenjang pages reuse the Tahun Ajaran string.
const delegateSuccess = (society: string): string => `Data ${society} berhasil didistribusikan ke tahun ajaran lain.`

const LEVELS_PATH = "/levels"
const stepPath = (id: number, step: LevelDeleteTarget): string => `/levels/${id}/${step}`

const toOption = (level: Pick<Level, "id" | "name">): LevelOption => ({ id: Number(level.id), name: level.name })

type Move = (manager: EntityManager) => Promise<unknown>

/**
 * `LevelService::delegateAction` — the priority ladder that picks where a row's destroy icon
 * points: majors > grades > registrants > student_grades > plain delete.
 *
 * B-1: legacy sent the student_grades case to `route('level.showDelegateAlumniForm')`, a route
 * name that does not exist. That call sits inside the row loop of `GET /level/list`, so one
 * level in that state threw `RouteNotFoundException` and 500-ed the **whole Jenjang page** for
 * every user. Level 8 is one delegation away from it today.
 */
const deleteTargetOf = (row: LevelSqlRow): LevelDeleteTarget => {
	if (Number(row.majorCount) > 0) return "delegate-major"
	if (Number(row.gradeCount) > 0) return "delegate-grade"
	if (Number(row.registrantCount) > 0) return "delegate-registrant"
	if (Number(row.studentGradeCount) > 0) return "delegate-student"
	return "delete"
}

/**
 * Port of the legacy `LevelController` (Jenjang), including its delete/delegation chain:
 * majors → grades → registrants → student_grades → plain delete.
 *
 * Three legacy blockers are fixed here rather than replicated (plan decisions): B-1 above,
 * B-2 in `delegateStudent` and B-2b in `UPDATE_QUOTA_SQL`. `createQuota()` is kept
 * verbatim: creating a level attaches it to every academic year.
 */
@Injectable()
export class LevelAdminService {
	private readonly logger = new Logger(LevelAdminService.name)

	constructor(
		private readonly dataSource: DataSource,
		@InjectRepository(Level) private readonly levels: Repository<Level>,
	) {}

	async findAll(): Promise<LevelRow[]> {
		const rows = await this.dataSource.query<LevelSqlRow[]>(LEVEL_LIST_SQL)
		return rows.map((row) => ({
			id: Number(row.id),
			name: row.name,
			status: row.status,
			createdAt: indoDateTimeDot(row.localCreatedAt),
			createdAtTs: Number(row.createdAtTs ?? 0),
			deleteTarget: deleteTargetOf(row),
		}))
	}

	/** Destination picker for the delegate pages and the Jurusan/Kelas selects. */
	async findOptions(exclude?: number): Promise<LevelOption[]> {
		const levels = await this.levels.find({
			select: { id: true, name: true },
			where: exclude === undefined || Number.isNaN(exclude) ? {} : { id: Not(exclude) },
			order: { id: "ASC" },
		})
		return levels.map(toOption)
	}

	async findOne(id: number): Promise<LevelDetail> {
		const row = await this.requireLevel(id)
		return { id: Number(row.id), name: row.name, status: row.status }
	}

	async create(dto: LevelWriteInput): Promise<{ message: string }> {
		try {
			await this.dataSource.transaction(async (manager) => {
				const saved = await manager.save(manager.create(Level, { name: dto.name, status: dto.status }))
				const id = Number(saved.id)
				// `createQuota()`: one pivot row per academic year, quota at the column default of 0
				await manager.query(LEVEL_CREATE_QUOTA_SQL, [id])
			})
		} catch (error) {
			this.logger.error(error instanceof Error ? error.message : String(error))
			throw new InternalServerErrorException(CREATE_FAILED)
		}
		return { message: CREATE_SUCCESS }
	}

	/** Legacy's update answers the *create* wording, and never re-syncs the quota pivots. */
	async update(id: number, dto: LevelWriteInput): Promise<{ message: string }> {
		await this.requireLevel(id)
		try {
			await this.levels.update({ id }, { name: dto.name, status: dto.status })
		} catch (error) {
			this.logger.error(error instanceof Error ? error.message : String(error))
			throw new InternalServerErrorException(CREATE_FAILED)
		}
		return { message: CREATE_SUCCESS }
	}

	async findStep(id: number, step: LevelDeleteTarget): Promise<LevelDeleteStep> {
		if (!STEPS.includes(step)) throw new BadRequestException("Langkah hapus tidak dikenal.")
		const row = await this.requireLevel(id)
		const target = deleteTargetOf(row)
		return {
			id: Number(row.id),
			name: row.name,
			step,
			levels: step === "delete" ? [] : await this.findOptions(id),
			// The destroy icon was chosen when the list rendered; the data may have moved since
			redirect: target === step ? null : stepPath(id, target),
		}
	}

	/** Legacy `destroy`: detach the quota pivots, delete the level. No quota is moved anywhere. */
	async remove(id: number): Promise<AdminRedirectResult> {
		await this.requireLevel(id)
		try {
			await this.dataSource.transaction((manager) => this.detachAndDelete(manager, id))
		} catch (error) {
			this.logger.error(error instanceof Error ? error.message : String(error))
			throw new InternalServerErrorException(DELETE_FAILED)
		}
		return { message: DELETE_SUCCESS, redirect: LEVELS_PATH }
	}

	async delegateMajor(id: number, dto: LevelDelegateInput): Promise<AdminRedirectResult> {
		return this.delegate(id, dto, (manager) => manager.update(Major, { levelId: id }, { levelId: dto.levelId }), "jurusan")
	}

	async delegateGrade(id: number, dto: LevelDelegateInput): Promise<AdminRedirectResult> {
		return this.delegate(id, dto, (manager) => manager.update(Grade, { levelId: id }, { levelId: dto.levelId }), "kelas")
	}

	async delegateRegistrant(id: number, dto: LevelDelegateInput): Promise<AdminRedirectResult> {
		return this.delegate(id, dto, (manager) => manager.update(Registrant, { levelId: id }, { levelId: dto.levelId }), "PSB")
	}

	/** Terminal step — legacy's `:society` is lowercase "santri" here, capital "Santri" on Tahun Ajaran. */
	async delegateStudent(id: number, dto: LevelDelegateInput): Promise<AdminRedirectResult> {
		return this.delegate(
			id,
			dto,
			(manager) => manager.update(StudentGrade, { levelId: id, deletedAt: IsNull() }, { levelId: dto.levelId }),
			"santri",
		)
	}

	/**
	 * One delegation step: move this table's rows to the chosen level, then walk the rest of
	 * the ladder. Whatever is still there decides the next page; when nothing is, the level's
	 * quota is folded into the destination, its pivots are detached and it is deleted.
	 *
	 * All four steps answer their own society's success message, in every branch — legacy does
	 * the same, so the toast names the rows that just moved, not the step you land on.
	 */
	private async delegate(
		id: number,
		dto: LevelDelegateInput,
		move: Move,
		society: string,
	): Promise<AdminRedirectResult> {
		await this.requireLevel(id)
		// Legacy validated `required` only, so a stale or hand-written id reached `Level::find()`
		// as null and 500-ed *after* the rows had moved to a level that does not exist. With no
		// foreign keys, that orphaning is silent — so the destination is checked up front.
		const destinationExists = dto.levelId !== id && (await this.levels.existsBy({ id: dto.levelId }))
		if (!destinationExists) throwFieldErrors({ levelId: ["Kolom jenjang wajib untuk dipilih."] })

		try {
			return await this.dataSource.transaction(async (manager) => {
				await move(manager)

				const [row] = await manager.query<LevelSqlRow[]>(LEVEL_BY_ID_SQL, [id])
				const target = row ? deleteTargetOf(row) : "delete"
				if (target !== "delete") {
					return { message: delegateSuccess(society), redirect: stepPath(id, target) }
				}

				await this.finish(manager, id, dto.levelId)
				return { message: delegateSuccess(society), redirect: LEVELS_PATH }
			})
		} catch (error) {
			this.logger.error(error instanceof Error ? error.message : String(error))
			throw new InternalServerErrorException(UPDATE_FAILED)
		}
	}

	/** The terminal branch every delegate handler shares: `updateQuota` → `detach` → `delete`. */
	private async finish(manager: EntityManager, id: number, destinationId: number): Promise<void> {
		await manager.query(UPDATE_QUOTA_SQL, [id, destinationId])
		await this.detachAndDelete(manager, id)
	}

	/** `$level->academicYears()->detach()` then `$level->delete()`. */
	private async detachAndDelete(manager: EntityManager, id: number): Promise<void> {
		await manager.delete(LevelAcademicYear, { levelId: id })
		await manager.delete(Level, { id })
	}

	private async requireLevel(id: number): Promise<LevelSqlRow> {
		const [row] = await this.dataSource.query<LevelSqlRow[]>(LEVEL_BY_ID_SQL, [id])
		// Legacy route-model binding: a missing level is a 404 before the handler runs
		if (!row) throw new NotFoundException("Jenjang tidak ditemukan.")
		return row
	}
}
