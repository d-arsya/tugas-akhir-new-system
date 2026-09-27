import { NotFoundException } from "@nestjs/common"
import * as bcrypt from "bcrypt"
import { randomInt } from "crypto"
import type { EntityManager } from "typeorm"

import type { StorageService } from "../../../core/storage/storage.service"
import { renameStudentWallet, syncStudentWalletActive } from "../../../shared/ewallet/student-wallet"
import { replaceDiseaseHistories } from "../../../shared/society/disease-history"
import { storeSocietyUpload } from "../../../shared/society/files"
import { generateMasterId } from "../../../shared/society/master-id"
import type { SocietyRuleInput, SocietyValidated } from "../../../shared/society/society-rules"
import { Student } from "@santri/entities/student.entity"
import { StudentGrade } from "@santri/entities/student-grade.entity"
import { AcademicYear } from "@shared/master/entities/academic-year.entity"
import { Grade } from "@shared/master/entities/grade.entity"

import { fail, UPDATE_FAILED } from "./student-grade-ops"

// The two society saves of Santri: the wizard's final step (`Student\AttachmentController::validateAttachmentData:39-86`)
// and the edit page (`StudentController::update:425-461`). Validation is AK-A's `validateSocietyInput`; this
// file routes the validated columns to `tbr_students` / `tbr_student_grades`, as legacy did, in one transaction.

export const CREATE_FAILED = "Terjadi kesalahan. Data gagal disimpan ke dalam basis data."

/** The 7 `attach_*` columns legacy's `getAttachmentData()` fills. */
const ATTACHMENTS = [
	"attach_certificate",
	"attach_photo",
	"attach_family_card",
	"attach_ksp",
	"attach_kip",
	"attach_report_card",
	"attach_birth_certificate",
] as const

/** Account columns (`updateStudentAccount`: `Arr::only(..., ['nis', 'email', 'is_blocked', 'academic_year_id'])`). */
const ACCOUNT_KEYS = new Set(["nis", "email", "is_blocked", "academic_year_id", "password", "password_confirmation"])
/** Validated keys that are never a grade-row column. */
const NOT_GRADE_COLUMNS = new Set([...ACCOUNT_KEYS, "source", "registration_path"])

type Values = Record<string, string | number | boolean | null>

const pick = (columns: Values, keep: (key: string) => boolean): Values =>
	Object.fromEntries(Object.entries(columns).filter(([key]) => keep(key)))

/** `Str::upper(Str::random(8))` — never shown to anyone (kept legacy). */
const randomPassword = (): string => {
	const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	return Array.from({ length: 8 }, () => alphabet[randomInt(alphabet.length)]).join("")
}

/** `UploadTraits::uploadFile` per chosen file (array_filter keeps only those). */
const storeUploads = async (storage: StorageService, validated: SocietyValidated): Promise<Values> => {
	const out: Values = {}
	for (const column of ATTACHMENTS) {
		const upload = validated.uploads[column]
		if (upload) out[column] = await storeSocietyUpload(storage, upload)
	}
	return out
}

/**
 * `UPDATE … SET <cols>` that only moves `updated_at` when a value really changes — Eloquent saves dirty
 * attributes only (and fires the Student observer only then).
 */
const updateRow = async (manager: EntityManager, table: string, id: number, set: Values): Promise<void> => {
	const entries = Object.entries(set)
	if (entries.length === 0) return
	const current = ((await manager.query(`SELECT ${entries.map(([column]) => `"${column}"`).join(", ")} FROM ${table} WHERE id = $1`, [id])) as Array<
		Record<string, unknown>
	>)[0]
	if (!current) return
	// Eloquent's dirty check compares loosely: "8123" and 8123 are the same value
	const text = (value: unknown): string | null =>
		value === null || value === undefined
			? null
			: value instanceof Date
				? `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`
				: String(value)
	const changed = entries.some(([column, value]) => text(current[column]) !== text(value))
	const params: unknown[] = [id]
	const assignments = entries.map(([column, value]) => {
		params.push(value)
		return `"${column}" = $${params.length}`
	})
	await manager.query(
		`UPDATE ${table} SET ${assignments.join(", ")}${changed ? ", updated_at = now()" : ""} WHERE id = $1 AND deleted_at IS NULL`,
		params,
	)
}

const insertRow = async (manager: EntityManager, table: string, set: Values): Promise<number> => {
	const entries = Object.entries(set)
	const columns = entries.map(([column]) => `"${column}"`).join(", ")
	const placeholders = entries.map((_, index) => `$${index + 1}`).join(", ")
	const rows = (await manager.query(
		`INSERT INTO ${table} (${columns}, created_at, updated_at) VALUES (${placeholders}, now(), now()) RETURNING id`,
		entries.map(([, value]) => value),
	)) as Array<{ id: string }>
	return Number(rows[0]?.id)
}

type Validate = (input: SocietyRuleInput) => Promise<SocietyValidated>

/**
 * Final wizard save. The account gets the posted NISP or `generateMasterId`, a random password, the year
 * and `source`; the grade row every society column plus Kelas / Subkelas / Jenjang, `grade_note = source`,
 * `registered_by_admin`, the uploads and `current_academic_year`. Returns the new grade row id.
 */
export const createStudent = async (
	manager: EntityManager,
	storage: StorageService,
	validate: Validate,
	input: Pick<SocietyRuleInput, "values" | "diseases" | "files">,
): Promise<number> => {
	const validated = await validate({ variant: "student-create", ...input })
	const columns = validated.columns
	const academicYearId = Number(columns["academic_year_id"])

	const academicYear = await manager.findOne(AcademicYear, { select: { year: true }, where: { id: academicYearId } })
	if (!academicYear) return fail(CREATE_FAILED)

	const nis = typeof columns["nis"] === "string" && columns["nis"] !== "" ? columns["nis"] : await generateMasterId(manager, academicYearId)
	const studentId = await insertRow(manager, "tbr_students", {
		nis,
		password: await bcrypt.hash(randomPassword(), 10),
		academic_year_id: academicYearId,
		source: columns["source"] ?? null,
		student_status: "active",
	})
	await syncStudentWalletActive(manager, studentId)

	const gradeColumns = pick(columns, (key) => !NOT_GRADE_COLUMNS.has(key))
	const uploads = await storeUploads(storage, validated)
	const studentGradeId = await insertRow(manager, "tbr_student_grades", {
		...gradeColumns,
		grade_status: "active",
		grade_note: columns["source"] ?? null,
		registered_by_admin: true,
		...Object.fromEntries(ATTACHMENTS.map((column) => [column, uploads[column] ?? null])),
		current_academic_year: academicYear.year,
		student_id: studentId,
	})

	await replaceDiseaseHistories(manager, "student", studentGradeId, validated.diseases)
	return studentGradeId
}

type EditRow = { id: string; level_id: string | null; nis: string | null; live_student_id: string | null }

/**
 * Edit save. Order as legacy: registrant NISP, Jenjang change (→ lowest Kelas of the new level), the grade
 * row, the account (+ password), the disease histories, the wallet name (approved fix: only this santri's
 * wallet — `renameStudentWallet`).
 */
export const updateStudent = async (
	manager: EntityManager,
	storage: StorageService,
	validate: Validate,
	studentGradeId: number,
	input: Pick<SocietyRuleInput, "values" | "diseases" | "files">,
): Promise<void> => {
	const row = await manager
		.createQueryBuilder(StudentGrade, "sg")
		.select("sg.id", "id")
		.addSelect("sg.levelId", "level_id")
		.addSelect("s.nis", "nis")
		.addSelect("s.id", "live_student_id")
		.leftJoin(Student, "s", "s.id = sg.studentId AND s.deletedAt IS NULL")
		.where("sg.id = :id", { id: studentGradeId })
		.andWhere("sg.deletedAt IS NULL")
		.setLock("pessimistic_write", undefined, ["sg"])
		.getRawOne<EditRow>()
	if (!row) throw new NotFoundException("Santri tidak ditemukan")
	const studentId = row.live_student_id === null ? null : Number(row.live_student_id)

	const validated = await validate({ variant: "student-update", ...input, ...(studentId === null ? {} : { ignoreId: studentId }) })
	const columns = validated.columns
	// `$request_data['nis']` on a request without the input dies before anything is written
	if (!("nis" in columns)) return fail(UPDATE_FAILED)

	// `updateRegistrantNISP:466-474` — the registrant carrying the old NISP follows the new one
	const newNis = columns["nis"] === null ? null : String(columns["nis"])
	if (newNis !== row.nis) {
		await manager.query(
			`UPDATE tbr_registrants SET nis = $2, updated_at = now()
			WHERE id = (SELECT id FROM tbr_registrants WHERE nis IS NOT DISTINCT FROM $1 ORDER BY id LIMIT 1)`,
			[row.nis, newNis],
		)
	}

	// `'level_id' => $request->level_id` — always written, null when not posted
	const levelId = columns["level_id"] ?? null
	const gradeColumns: Values = { ...pick(columns, (key) => !NOT_GRADE_COLUMNS.has(key)), level_id: levelId }
	// `updateGrade:493-505`
	if (String(levelId ?? "") !== String(row.level_id ?? "")) {
		const lowest = await manager
			.createQueryBuilder(Grade, "g")
			.select("MIN(g.label)", "label")
			.where("g.levelId = :levelId", { levelId })
			.getRawOne<{ label: string | null }>()
		gradeColumns["grade"] = lowest?.label === null || lowest?.label === undefined ? 1 : Number(lowest.label)
	}
	await updateRow(manager, "tbr_student_grades", studentGradeId, { ...gradeColumns, ...(await storeUploads(storage, validated)) })

	if (studentId !== null) {
		const account = pick(columns, (key) => key === "nis" || key === "email" || key === "is_blocked" || key === "academic_year_id")
		const password = columns["password"]
		if (typeof password === "string" && password !== "") account["password"] = await bcrypt.hash(password, 10)
		await updateRow(manager, "tbr_students", studentId, account)
		await syncStudentWalletActive(manager, studentId)
	}

	await replaceDiseaseHistories(manager, "student", studentGradeId, validated.diseases)

	// Legacy reads `validated()['fullname']` unconditionally; with the field switched off it died after
	// saving everything. The port saves and skips the rename.
	if (studentId !== null && typeof columns["fullname"] === "string") await renameStudentWallet(manager, studentId, columns["fullname"])
}
