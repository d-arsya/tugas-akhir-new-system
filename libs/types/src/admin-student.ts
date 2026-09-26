// ── Akademik → Santri (legacy admin.pondokroja.com) ────────────────────────────────────────
//
// Owned by workstream AK-S. Prefix every exported name with `AdminStudent` so nothing clashes with
// the portal types in `santri.ts` / `psb.ts`. Shared society shapes live in `admin-society.ts`.
//
// Legacy `StudentController` builds every DataTables cell as HTML; the port sends the values and
// the admin renders the markup (`StudentService`, `AcademicYearService`, `UserService`).

import type { SocietyRecord } from "./admin-society"

/** `AcademicYearService::getStatusAkademik()` — green "Berjalan", red "Berakhir", the Archive "-", or nothing. */
export type AdminStudentYearStatus = "Berjalan" | "Berakhir" | "-" | null

/** `StudentController::academicYearList()` — one row per academic year (Archive included). */
export type AdminStudentYearRow = {
	id: number
	year: string | null
	levelCount: number
	gradeCount: number
	studentCount: number
	statusLabel: AdminStudentYearStatus
}

export type AdminStudentAcademicYear = { id: number; year: string | null }

/** `StudentController::gradeList()` — one row per (grade, level) of the year, grade descending. */
export type AdminStudentGradeRow = {
	grade: number | null
	levelId: number | null
	levelName: string | null
	total: number
	active: number
	naikKelas: number
	tinggalKelas: number
}

/** `StudentController::studentList()` — one row per live `tbr_student_grades` row of the class. */
export type AdminStudentRosterRow = {
	/** `tbr_student_grades.id` */
	id: number
	studentId: number | null
	nis: string | null
	fullname: string | null
	/** Display URL of `attach_photo`; null → `No-Photo.svg` */
	photoUrl: string | null
	/** `Y-m-d` */
	dateOfBirth: string | null
	/** `father_fullname ?? mother_fullname` */
	parentName: string | null
	majorName: string | null
	subGrade: string | null
	gradeStatus: string | null
	gradeNote: string | null
	dropoutNote: string | null
	/** `tbr_students.is_blocked`; null when the account row is missing (legacy renders "Active") */
	isBlocked: boolean | null
}

/** `StudentController::students()` — the roster page's own data (legacy redirects back when `exists` is false). */
export type AdminStudentRosterPage = {
	academicYear: AdminStudentAcademicYear
	grade: number
	levelId: number
	levelName: string | null
	exists: boolean
	/** `max(Grade::pluck('label'))` — Lulus replaces Naik Kelas at this grade */
	maxGrade: number
	/** `Major::where('level_id', …)` names */
	majors: string[]
	/** `SubGrade::all()` labels */
	subGrades: string[]
}

/** The select lists of the wizard step 1 and the edit page's right panel. */
export type AdminStudentOptions = {
	/** `AcademicYear::all()` (the wizard drops id 1 and sorts by year desc) */
	academicYears: AdminStudentAcademicYear[]
	/** `Level::latest()` */
	levels: Array<{ id: number; name: string | null }>
	/** `Grade::orderBy('label')`, with the level `get-level-by-grade` answers */
	grades: Array<{ id: number; label: number | null; levelId: number | null }>
	/** `SubGrade::latest()` labels */
	subGrades: string[]
	/** Every major with its level (`Level::find()->majors`) */
	majors: Array<{ name: string | null; levelId: number | null }>
}

/** `StudentController::edit()` — the detail page. */
export type AdminStudentDetail = {
	id: number
	studentId: number | null
	nis: string | null
	email: string | null
	/** `tbr_students.source` */
	source: string | null
	isBlocked: boolean | null
	fullname: string | null
	levelId: number | null
	levelName: string | null
	grade: number | null
	gradeStatus: string | null
	gradeNote: string | null
	dropoutNote: string | null
	subGrade: string | null
	majorName: string | null
	currentAcademicYear: string | null
	/** `getAcademicYearId($student_grade->current_academic_year)`; null when no year row carries that name */
	academicYearId: number | null
	photoUrl: string | null
	/** `formatDate($student_grade->created_at, 'd F Y \j\a\m H:i')` */
	createdAtDisplay: string | null
	maxGrade: number
	/** Majors of the row's level (`Level::find($level_id)->majors`) */
	majors: string[]
	record: SocietyRecord
}

/** Bulk bodies (legacy `id[]` + the action's own field). */
export type AdminStudentIdsDto = { ids: number[] }
export type AdminStudentMajorDto = { ids: number[]; major: string | null }
export type AdminStudentStatusDto = { ids: number[]; isBlocked: boolean }
/** `sub_grade` for the ticked rows (legacy `updateSubGrade`; made reachable at the user's request). */
export type AdminStudentSubGradeDto = { ids: number[]; subGrade: string | null }
/** `dropout_note` is `sometimes|required|string`: absent is fine, present-but-empty is refused. */
export type AdminStudentDropoutDto = { ids: number[]; dropoutNote?: string }

export type AdminStudentMessage = { message: string }

/** Final wizard save: the new `tbr_student_grades.id` (legacy redirects to its edit page). */
export type AdminStudentCreated = { message: string; studentGradeId: number }
