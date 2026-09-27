import type { EntityManager } from "typeorm"

import { copyDiseaseHistories } from "../../../shared/society/disease-history"
import { StudentGrade } from "@santri/entities/student-grade.entity"
import { Grade } from "@shared/master/entities/grade.entity"
import { Level } from "@shared/master/entities/level.entity"

import { createAlumni } from "./student-alumni"
import {
	ALL_FAILED,
	deleteUnpaidInvoices,
	fail,
	findGradeRow,
	hasNextAcademicYear,
	nextAcademicYear,
	NO_NEXT_YEAR,
	replicateGradeRow,
	UPDATE_FAILED,
	UPDATE_SUCCESS,
	updateStudentAccount,
	type GradeRow,
} from "./student-grade-ops"
import { toNumber } from "./student-format"

// The roster bulk actions and the edit page's summary buttons — `StudentController::nextGrades:562`,
// `stayGrades:643`, `graduate:715`, `dropout:797`, `updateMajor:887`, `updateStatus:927`. Each runs inside
// the caller's transaction, so a failure part-way leaves nothing behind (approved fix; legacy committed the
// rows it had already processed).
//
// Legacy's own quirks are kept: the "all failed" checks compare against the whole id list, so a mix of
// skipped rows (some without a next year, some inactive) answers success with nothing done; an empty list
// (`$request->id` null) dies in `foreach` and answers the generic failure.

/**
 * `foreach ($request->id as $id) { $row = StudentGrade::find($id); … }` — each row is read when its turn
 * comes (a repeated id sees the first pass's writes); a missing row dies on `null->…`.
 */
async function* eachRow(manager: EntityManager, ids: number[], failure: string): AsyncGenerator<GradeRow> {
	if (ids.length === 0) fail(failure)
	for (const id of ids) {
		const row = await findGradeRow(manager, id)
		if (!row) return fail(failure)
		yield row
	}
}

/** `Grade::orderBy('label')` — the first label above the row's (or its own at the top). */
const nextGradeOf = async (manager: EntityManager, grade: string | null): Promise<{ grade: string | null; levelId: string | null }> => {
	const grades = await manager.find(Grade, { select: { label: true }, order: { label: "ASC" } })
	let next = grade
	for (const { label } of grades) {
		if (label !== null && grade !== null && Number(label) > Number(grade)) {
			next = String(label)
			break
		}
	}
	// `Grade::with('level')->where('label', $next)->first()->level->id` — no grade or no level dies
	const level = await manager
		.createQueryBuilder(Grade, "g")
		.select("l.id", "id")
		.leftJoin(Level, "l", "l.id = g.levelId")
		.where("g.label = :label", { label: next })
		.orderBy("g.id")
		.limit(1)
		.getRawOne<{ id: string | null }>()
	const levelId = level?.id ?? null
	if (levelId === null) return fail(UPDATE_FAILED)
	return { grade: next, levelId }
}

/** `nextGrades:562-638` — Naik Kelas: a copy in the next year and grade, the source row closed. */
export const nextGrades = async (manager: EntityManager, ids: number[]): Promise<string> => {
	let failed = 0
	let noNextYear = 0
	for await (const row of eachRow(manager, ids, UPDATE_FAILED)) {
		if (!(await hasNextAcademicYear(manager, row.current_academic_year, UPDATE_FAILED))) {
			noNextYear++
			continue
		}
		if (row.grade_status === "inactive") {
			failed++
			continue
		}
		const next = await nextGradeOf(manager, row.grade)
		const copyId = await replicateGradeRow(manager, Number(row.id))
		await manager.update(
			StudentGrade,
			{ id: copyId },
			{
				gradeNote: "kenaikan kelas",
				grade: toNumber(next.grade),
				levelId: toNumber(next.levelId),
				currentAcademicYear: nextAcademicYear(row.current_academic_year, UPDATE_FAILED),
			},
		)
		await copyDiseaseHistories(manager, { society: "student", id: Number(row.id) }, { society: "student", id: copyId })
		await manager.update(
			StudentGrade,
			{ id: Number(row.id) },
			{ gradeStatus: "inactive", gradeNote: "naik kelas", prevGradeNote: row.grade_note },
		)
	}
	if (noNextYear === ids.length) fail(NO_NEXT_YEAR)
	if (failed === ids.length) fail(ALL_FAILED)
	return UPDATE_SUCCESS
}

/** `stayGrades:643-710` — Tinggal Kelas: a copy in the same grade next year, the source row closed. */
export const stayGrades = async (manager: EntityManager, ids: number[]): Promise<string> => {
	let failed = 0
	let noNextYear = 0
	for await (const row of eachRow(manager, ids, UPDATE_FAILED)) {
		if (!(await hasNextAcademicYear(manager, row.current_academic_year, UPDATE_FAILED))) {
			noNextYear++
			continue
		}
		if (row.grade_note === "tinggal kelas" || row.grade_status === "inactive") {
			failed++
			continue
		}
		const copyId = await replicateGradeRow(manager, Number(row.id))
		await manager.update(
			StudentGrade,
			{ id: copyId },
			{
				gradeStatus: "active",
				gradeNote: "tinggal kelas",
				prevGradeNote: row.grade_note,
				currentAcademicYear: nextAcademicYear(row.current_academic_year, UPDATE_FAILED),
			},
		)
		await copyDiseaseHistories(manager, { society: "student", id: Number(row.id) }, { society: "student", id: copyId })
		await manager.update(
			StudentGrade,
			{ id: Number(row.id) },
			{ gradeStatus: "inactive", gradeNote: "tinggal kelas", prevGradeNote: row.grade_note },
		)
	}
	if (noNextYear === ids.length) fail(NO_NEXT_YEAR)
	if (failed === ids.length) fail(ALL_FAILED)
	return UPDATE_SUCCESS
}

/** `graduate:715-758` — Lulus: the row closed, the account blocked (wallet off), an alumni row created. */
export const graduate = async (manager: EntityManager, ids: number[]): Promise<string> => {
	let failed = 0
	for await (const row of eachRow(manager, ids, UPDATE_FAILED)) {
		if (row.grade_note === "keluar" || row.grade_status === "inactive") {
			failed++
			continue
		}
		await manager.update(
			StudentGrade,
			{ id: Number(row.id) },
			{ gradeStatus: "inactive", gradeNote: "lulus", prevGradeNote: row.grade_note },
		)
		await updateStudentAccount(manager, row.student_id, { is_blocked: true, student_status: "inactive" })
		await createAlumni(manager, Number(row.id))
	}
	if (failed === ids.length) fail(ALL_FAILED)
	return UPDATE_SUCCESS
}

/**
 * `dropout:797-827` — Keluar: no status check, the note stored, the account blocked, and the grade row's
 * unpaid future invoices deleted (approved fix: legacy passed the student id).
 */
export const dropout = async (manager: EntityManager, ids: number[], note: string | null): Promise<string> => {
	for await (const row of eachRow(manager, ids, UPDATE_FAILED)) {
		await manager.update(
			StudentGrade,
			{ id: Number(row.id) },
			{ gradeStatus: "inactive", gradeNote: "keluar", dropoutNote: note },
		)
		await updateStudentAccount(manager, row.student_id, { student_status: "inactive", is_blocked: true })
		await deleteUnpaidInvoices(manager, Number(row.id))
	}
	return UPDATE_SUCCESS
}

/** `updateMajor:887-902` */
export const updateMajor = async (manager: EntityManager, ids: number[], major: string | null): Promise<string> => {
	for await (const row of eachRow(manager, ids, UPDATE_FAILED)) {
		await manager.update(StudentGrade, { id: Number(row.id) }, { majorName: major })
	}
	return UPDATE_SUCCESS
}

/**
 * `updateSubGrade:907-922` — Subkelas. Legacy never reached it (its modal's form shared the id
 * `stay-grades-form` with Tinggal Kelas and posted that one instead); fixed at the user's request
 * (2026-09-26), so the Subkelas button sets `sub_grade` on the ticked rows.
 */
export const updateSubGrade = async (manager: EntityManager, ids: number[], subGrade: string | null): Promise<string> => {
	for await (const row of eachRow(manager, ids, UPDATE_FAILED)) {
		await manager.update(StudentGrade, { id: Number(row.id) }, { subGrade })
	}
	return UPDATE_SUCCESS
}

/** `updateStatus:927-942` — Status Akun; the wallet follows (observer). */
export const updateStatus = async (manager: EntityManager, ids: number[], isBlocked: boolean): Promise<string> => {
	for await (const row of eachRow(manager, ids, UPDATE_FAILED)) {
		await updateStudentAccount(manager, row.student_id, { is_blocked: isBlocked })
	}
	return UPDATE_SUCCESS
}
