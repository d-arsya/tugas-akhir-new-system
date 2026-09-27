import { HttpException, Inject, Injectable, InternalServerErrorException, Logger, NotFoundException, UnprocessableEntityException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { DataSource, IsNull, Repository, type EntityManager } from "typeorm"

import type { AdminMessageResult } from "@roja/types"
import { SOCIETY_COLUMNS } from "@roja/utils/society-fields"

import { throwFieldErrors } from "../../../core/errors/field-errors"
import { copyDiseaseHistories } from "../../../shared/society/disease-history"
import { generateMasterId } from "../../../shared/society/master-id"
import { Registrant } from "@psb/entities/registrant.entity"
import { Student } from "@santri/entities/student.entity"
import { Grade } from "@shared/master/entities/grade.entity"
import { LevelAcademicYear } from "@shared/master/entities/level-academic-year.entity"

import { RegistrantMailService } from "./registrant-mail.service"

// Legacy `RegistrantController::updateStatusData` (`Register\StatusDataRequest`) — the validation modal,
// Tes Indent, Tes Reguler and the four "Pengumuman Hasil" confirms — with `checkQuotaFull` and
// `createStudent`. Owned by workstream AK-P. One transaction; the invalid-data mail goes out after it.

const UPDATE_SUCCESS = "Data berhasil diupdate."
const UPDATE_FAILED = "Data gagal diupdate."

type StatusKey = "data_validation" | "data_validation_note" | "indent_test" | "regular_test" | "approval_status"

// `rules()` order, `attributes()` and the `in:` lists
const RULES: ReadonlyArray<{ key: StatusKey; attribute: string; in?: readonly string[] }> = [
	{ key: "data_validation", attribute: "validasi data", in: ["valid", "invalid"] },
	{ key: "data_validation_note", attribute: "catatan validasi data" },
	{ key: "indent_test", attribute: "tes indent", in: ["success", "failed"] },
	{ key: "regular_test", attribute: "tes reguler", in: ["success", "failed"] },
	{ key: "approval_status", attribute: "status penerimaan", in: ["approve", "reject", "reserve", "wait"] },
]

const ucfirst = (value: string): string => value.charAt(0).toUpperCase() + value.slice(1)

/** `sometimes|required|in:…` and `sometimes|required_if:data_validation,invalid`, legacy messages. */
const validateStatus = (body: Record<string, unknown>): Partial<Record<StatusKey, string | null>> => {
	const posted: Partial<Record<StatusKey, string | null>> = {}
	for (const { key } of RULES) {
		if (!(key in body)) continue
		const raw = body[key]
		const text = typeof raw === "string" ? raw.trim() : raw === null || raw === undefined ? "" : String(raw)
		posted[key] = text === "" ? null : text
	}
	const errors: Record<string, string> = {}
	for (const rule of RULES) {
		if (!(rule.key in posted)) continue
		const value = posted[rule.key] ?? null
		if (rule.key === "data_validation_note") {
			if (value === null && posted.data_validation === "invalid") errors[rule.key] = `Kolom ${rule.attribute} wajib untuk diisi.`
			continue
		}
		if (value === null) errors[rule.key] = `Kolom ${rule.attribute} wajib untuk dipilih.`
		else if (rule.in && !rule.in.includes(value)) errors[rule.key] = `${ucfirst(rule.attribute)} yang dipilih tidak valid.`
	}
	if (Object.keys(errors).length > 0) throwFieldErrors(errors)
	return posted
}

type RegistrantRow = Pick<Registrant, "id" | "academicYearId" | "levelId" | "nis" | "email" | "fullname" | "dataValidation">

// The grade row copies every society column; `*_whatsapp` are bigint here and varchar there
const GRADE_COLUMNS = SOCIETY_COLUMNS.join(", ")
const GRADE_SOURCE = SOCIETY_COLUMNS.map((column) => (column.endsWith("_whatsapp") ? `r.${column}::text` : `r.${column}`)).join(", ")

@Injectable()
export class RegistrantStatusService {
	private readonly logger = new Logger(RegistrantStatusService.name)

	constructor(
		@Inject(DataSource) private readonly dataSource: DataSource,
		@InjectRepository(Registrant) private readonly registrants: Repository<Registrant>,
		@Inject(RegistrantMailService) private readonly mail: RegistrantMailService,
	) {}

	async updateStatus(registrantId: number, body: Record<string, unknown>): Promise<AdminMessageResult> {
		if (!(await this.registrants.existsBy({ id: registrantId }))) throw new NotFoundException("Pendaftar tidak ditemukan")
		const validated = validateStatus(body ?? {})

		try {
			const before = await this.dataSource.transaction(async (manager) => {
				const row = await manager.findOne(Registrant, {
					select: { id: true, academicYearId: true, levelId: true, nis: true, email: true, fullname: true, dataValidation: true },
					where: { id: registrantId },
					lock: { mode: "pessimistic_write" },
				})
				if (!row) throw new NotFoundException("Pendaftar tidak ditemukan")

				if (validated.approval_status === "approve") {
					await this.checkQuotaFull(manager, row)
					await this.createStudent(manager, row)
				}

				const keys = Object.keys(validated) as StatusKey[]
				await manager.query(
					`UPDATE tbr_registrants SET ${keys.map((key, index) => `${key} = $${index + 2}, `).join("")}updated_at = now() WHERE id = $1`,
					[registrantId, ...keys.map((key) => validated[key] ?? null)],
				)
				return row
			})

			// `sendEmailIfInvalid()`: only on the switch into "invalid"
			if (before.dataValidation !== "invalid" && validated.data_validation === "invalid") {
				this.mail.invalidData({ email: before.email, fullname: before.fullname })
			}
			return { message: UPDATE_SUCCESS }
		} catch (error) {
			if (error instanceof HttpException) throw error
			this.logger.error(`registrant ${registrantId} status update failed: ${error instanceof Error ? error.message : String(error)}`)
			throw new InternalServerErrorException(UPDATE_FAILED)
		}
	}

	/**
	 * `checkQuotaFull()` — with the approved fix: the "tinggal kelas" santri are counted on the
	 * pendaftar's **own** academic year (legacy handed `where()` an array and hit the oldest year).
	 * A level/year pair with no quota row crashed legacy (`$quota->quota` on null) into "Data gagal diupdate.".
	 */
	private async checkQuotaFull(manager: EntityManager, row: RegistrantRow): Promise<void> {
		if (row.levelId === null || row.academicYearId === null) throw new UnprocessableEntityException(UPDATE_FAILED)
		const quota = await manager.findOne(LevelAcademicYear, {
			select: { id: true, quota: true },
			where: { levelId: Number(row.levelId), academicYearId: Number(row.academicYearId) },
			order: { id: "ASC" },
		})
		if (!quota) throw new UnprocessableEntityException(UPDATE_FAILED)

		// Legacy builds the ids of every academic year before the pendaftar's and hands the array to
		// `where()`, which Laravel 8 reduces to the first (oldest) id. The user approved counting the
		// pendaftar's own year instead (2026-09-26). Counting all earlier years (the likely intent)
		// would take the 6 live level-2 "tinggal kelas" rows off the quota — recorded as a follow-up.
		const counts = (await manager.query(
			`SELECT
				(SELECT count(*) FROM tbr_registrants WHERE level_id = $1 AND academic_year_id = $2 AND approval_status = 'approve') AS registrants,
				(SELECT count(*) FROM tbr_student_grades sg
					JOIN tbr_students s ON s.id = sg.student_id AND s.deleted_at IS NULL
					WHERE sg.deleted_at IS NULL AND s.academic_year_id = $2 AND sg.level_id = $1 AND sg.grade_note = 'tinggal kelas') AS students`,
			[row.levelId, row.academicYearId],
		)) as Array<{ registrants: string; students: string }>
		const used = Number(counts[0]?.registrants ?? 0) + Number(counts[0]?.students ?? 0)
		if (Number(quota.quota ?? 0) - used <= 0) throw new UnprocessableEntityException("Kuota sudah penuh")
	}

	/**
	 * `createStudent()`: a new NIS, the santri account (password hash, verification, token copied) and its
	 * first grade row (the level's lowest grade, "pendaftaran"), plus the disease rows. Approved fix: a
	 * pendaftar whose NIS already belongs to a live santri (approved before, then moved back) reuses that
	 * santri instead of getting a second one.
	 */
	private async createStudent(manager: EntityManager, row: RegistrantRow): Promise<void> {
		if (row.nis && (await manager.existsBy(Student, { nis: row.nis, deletedAt: IsNull() }))) return

		if (row.email) {
			const taken = (await manager.query(
				"SELECT id FROM tbr_students WHERE lower(email) = lower($1) AND deleted_at IS NULL LIMIT 1",
				[row.email],
			)) as unknown[]
			if (taken.length > 0) throw new UnprocessableEntityException("Email sudah ada di data santri.")
		}

		const academicYearId = Number(row.academicYearId)
		const nis = await generateMasterId(manager, academicYearId)
		await manager.update(Registrant, { id: Number(row.id) }, { nis })

		const students = (await manager.query(
			`INSERT INTO tbr_students (email, password, is_blocked, blocked_at, enabled_2fa, academic_year_id, nis,
				email_verified_at, remember_token, student_status, source, created_at, updated_at)
			SELECT email, password, false, blocked_at, true, academic_year_id, $2, email_verified_at, remember_token,
				'active', 'pendaftaran', now(), now()
			FROM tbr_registrants WHERE id = $1 RETURNING id`,
			[row.id, nis],
		)) as Array<{ id: string }>
		const studentId = Number(students[0]?.id)

		const lowest =
			row.levelId === null
				? undefined
				: await manager
						.createQueryBuilder(Grade, "grade")
						.select("MIN(grade.label)", "label")
						.where("grade.levelId = :levelId", { levelId: row.levelId })
						.getRawOne<{ label: string | null }>()
		const grade = lowest?.label === null || lowest?.label === undefined ? 1 : Number(lowest.label)

		const inserted = (await manager.query(
			`INSERT INTO tbr_student_grades (student_id, level_id, grade, grade_status, grade_note, registered_by_admin,
				current_academic_year, created_at, updated_at, ${GRADE_COLUMNS})
			SELECT $2, r.level_id, $3, 'active', 'pendaftaran', false,
				(SELECT year FROM tbr_academic_years WHERE id = $4), now(), now(), ${GRADE_SOURCE}
			FROM tbr_registrants r WHERE r.id = $1 RETURNING id`,
			[row.id, studentId, grade, academicYearId],
		)) as Array<{ id: string }>

		await copyDiseaseHistories(manager, { society: "registrant", id: Number(row.id) }, { society: "student", id: Number(inserted[0]?.id) })
	}
}
