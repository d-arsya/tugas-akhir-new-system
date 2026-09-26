// ── Akademik → PSB (legacy admin.pondokroja.com) ────────────────────────────────────────
//
// Owned by workstream AK-P. Prefix every exported name with `AdminRegistrant` so nothing clashes with
// the portal types in `santri.ts` / `psb.ts`. Shared society shapes live in `admin-society.ts`.

import type { SocietyRecord } from "./admin-society"

/** `AcademicYearService::getStatus()`: the Archive row prints "-", otherwise Dibuka / Ditutup. */
export type AdminRegistrantYearStatus = "none" | "open" | "closed"

/** One row of `RegistrantController::academicYearList` (legacy `/registrant`). */
export type AdminRegistrantAcademicYearRow = {
	id: number
	year: string | null
	total: number
	reguler: number
	indent: number
	approve: number
	reject: number
	status: AdminRegistrantYearStatus
}

export type AdminRegistrantOption = { id: number; name: string }

/** `showAcademicYear`: the header and tab counts of `/registrant/academic-year/{id}`. */
export type AdminRegistrantAcademicYearPage = {
	id: number
	year: string | null
	/** `registrants->count()` — the header label */
	total: number
	/** approval_status null / wait / reserve */
	newCount: number
	approveCount: number
	rejectCount: number
	/** `Level::where('status', 'show')` — the Jenjang filters (legacy filters on the lower-cased name) */
	levels: AdminRegistrantOption[]
}

/** `RegistrantService::progressLabel()` */
export type AdminRegistrantProgress = "validation" | "indent" | "regular" | "announcement"

/** The three lists (`getNewRegistrantList` / `getApprovedRegistrantList` / `getRejectedRegistrantList`). */
export type AdminRegistrantListTab = "new" | "approved" | "rejected"

export type AdminRegistrantRow = {
	id: number
	registrantId: string | null
	fullname: string | null
	nis: string | null
	schoolName: string | null
	levelName: string | null
	/** `datatableDate($created_at, …, 'd-m-Y, H:i')` (Asia/Jakarta) */
	createdAt: string | null
	/** The hidden unix timestamp the date cell sorts by */
	createdTs: number | null
	/** `Str::title($registration_path)` */
	registrationPath: string
	progress: AdminRegistrantProgress
	updatedAt: string | null
	updatedTs: number | null
}

/** Export dropdown: Semua / Baru / Diterima / Tidak Diterima (`download/{approval_status?}`). */
export type AdminRegistrantExportStatus = "" | "wait" | "approve" | "reject"

/** Step-1 header of the create wizard (`PersonalController::personal`). */
export type AdminRegistrantCreateOptions = {
	/** `AcademicYear::where('id', '!=', 1)->orderBy('year', 'desc')` */
	academicYears: { id: number; year: string | null }[]
	/** `Level::where('status', 'show')` */
	levels: AdminRegistrantOption[]
}

export type AdminRegistrantCreateResult = {
	id: number
	message: string
	/** The edit page the wizard opens next (legacy `route('registrant.edit')`). */
	redirect: string
}

/** Everything the edit page (`registrant/edit.blade.php`) shows. */
export type AdminRegistrantDetail = {
	id: number
	registrantId: string | null
	fullname: string | null
	academicYearId: number | null
	academicYear: string | null
	levelId: number | null
	registrationPath: string | null
	email: string | null
	isBlocked: boolean
	/** false = registered through the PSB portal: the form is read-only */
	registeredByAdmin: boolean
	/** `formatDate($created_at, 'd F Y \j\a\m H:i')` in Indonesian */
	createdAtLabel: string | null
	photoUrl: string | null
	dataValidation: string | null
	dataValidationNote: string | null
	indentTest: string | null
	regularTest: string | null
	approvalStatus: string | null
	/** `Level::latest()->get()` — the widget's Jenjang select */
	levels: AdminRegistrantOption[]
	record: SocietyRecord
}

/** Body of `PATCH /admin/registrants/:id/status-data` (legacy `StatusDataRequest`); only the posted keys move. */
export type AdminRegistrantStatusDto = {
	data_validation?: string
	data_validation_note?: string
	indent_test?: string
	regular_test?: string
	approval_status?: string
}
