// Row shapes of `student-sql.ts` as node-postgres hands them back (bigint → string) and their mapping
// onto the `AdminStudent*` contract. Legacy renders these cells as HTML in `StudentService`,
// `AcademicYearService` and `UserService`; the admin renders the markup from the values.

import type {
	AdminStudentGradeRow,
	AdminStudentRosterRow,
	AdminStudentYearRow,
	AdminStudentYearStatus,
} from "@roja/types"

import { societyFileUrl } from "../../../shared/society/files"
import { MONTHS_ID } from "@admin/common/date-format"

export type YearSqlRow = {
	id: string
	year: string | null
	levelCount: number
	gradeCount: number
	studentCount: number
	statusLabel: AdminStudentYearStatus
}

export type GradeSqlRow = {
	grade: string | null
	levelId: string | null
	levelName: string | null
	total: number
	active: number
	naikKelas: number
	tinggalKelas: number
}

export type RosterSqlRow = {
	id: string
	studentId: string | null
	nis: string | null
	isBlocked: boolean | null
	fullname: string | null
	attachPhoto: string | null
	dateOfBirth: string | null
	parentName: string | null
	majorName: string | null
	subGrade: string | null
	gradeStatus: string | null
	gradeNote: string | null
	dropoutNote: string | null
}

export const toNumber = (value: string | number | null | undefined): number | null =>
	value === null || value === undefined || value === "" ? null : Number(value)

export const toYearRow = (row: YearSqlRow): AdminStudentYearRow => ({
	id: Number(row.id),
	year: row.year,
	levelCount: row.levelCount,
	gradeCount: row.gradeCount,
	studentCount: row.studentCount,
	statusLabel: row.statusLabel,
})

export const toGradeRow = (row: GradeSqlRow): AdminStudentGradeRow => ({
	grade: toNumber(row.grade),
	levelId: toNumber(row.levelId),
	levelName: row.levelName,
	total: row.total,
	active: row.active,
	naikKelas: row.naikKelas,
	tinggalKelas: row.tinggalKelas,
})

/** `StudentService::dbPhoto()` — `storage_url()` of the key, or nothing for the No-Photo placeholder. */
export const toRosterRow = (row: RosterSqlRow): AdminStudentRosterRow => ({
	id: Number(row.id),
	studentId: toNumber(row.studentId),
	nis: row.nis,
	fullname: row.fullname,
	photoUrl: societyFileUrl(row.attachPhoto),
	dateOfBirth: row.dateOfBirth,
	parentName: row.parentName,
	majorName: row.majorName,
	subGrade: row.subGrade,
	gradeStatus: row.gradeStatus,
	gradeNote: row.gradeNote,
	dropoutNote: row.dropoutNote,
	isBlocked: row.isBlocked,
})

/** `formatDate($date, 'd F Y \j\a\m H:i')` from parts already taken in Asia/Jakarta. */
export const indoDateTime = (day: string | null, month: string | null, year: string | null, time: string | null): string | null => {
	if (day === null || month === null || year === null || time === null) return null
	return `${day} ${MONTHS_ID[Number(month) - 1] ?? ""} ${year} jam ${time}`
}

/** `formatDate($date, 'd F Y')` of a `Y-m-d` string (the export's birth date). */
export const indoDate = (ymd: string | null): string => {
	if (!ymd) return ""
	const [year, month, day] = ymd.split("-")
	return `${day} ${MONTHS_ID[Number(month) - 1] ?? ""} ${year}`
}
