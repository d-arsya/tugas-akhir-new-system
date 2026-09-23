// Contract for the admin "Data Master" menu, phase 1: Tahun Ajaran and Akademik
// (Kelas + Subkelas, Jurusan, Jenjang). Ported 1:1 from the legacy Laravel admin.
//
// Legacy list endpoints answer `{"data": [[cell, cell, …]]}` where every cell is
// PHP-rendered HTML. Here each becomes a typed row, following three rules:
//   * the baked-in `$no` counter is dropped — the table indexes rows itself, and
//     the server instead guarantees the order that counter was built in;
//   * `<span class='tbr_label…'>` becomes an enum, rendered by <LegacyLabel>;
//   * `RegistrantService::datatableDate()`'s hidden unix span becomes a second
//     `*Ts` field, so the column sorts chronologically instead of alphabetically.

/** Where a row's destroy icon points. Legacy picks this server-side, per row, at list-render time. */
export type AcademicYearDeleteTarget =
	| "delete"
	| "delegate-registrant"
	| "delegate-student"
	| "delegate-alumni"

export type LevelDeleteTarget =
	| "delete"
	| "delegate-major"
	| "delegate-grade"
	| "delegate-registrant"
	| "delegate-student"

/** Answer shape of every delete/delegate mutation. `redirect` is a frontend path. */
export type AdminRedirectResult = {
	message: string
	redirect: string
}

// --- Tahun Ajaran (legacy AcademicYearController) --------------------------------------

export type AcademicYearRow = {
	id: number
	year: string | null
	/** `getCostPeriodAttribute()`, e.g. "01 Jul 2026 - 30 Jun 2027"; "-" when no start date. */
	period: string
	/** Legacy renders a literal "-" for the Archive row instead of a badge. */
	statusPsb: "open" | "closed" | "none"
	/** "empty" is legacy's blank cell: a period that has not ended, on a non-current year. */
	statusAkademik: "berjalan" | "berakhir" | "empty" | "none"
	deleteTarget: AcademicYearDeleteTarget
	/** false for the Archive row — legacy renders no Actions cell at all. */
	actionable: boolean
	isArchive: boolean
}

/** One row of the "Kuota jenjang" table on the create and edit pages. */
export type AcademicYearQuotaRow = {
	levelId: number
	levelName: string | null
	/** null on the create page, where legacy renders an empty Kuota and Sisa cell. */
	quota: number | null
	/** Registrants with approval_status = 'approve' for this year and level. */
	psb: number
	/** student_grades on this level + year at the level's lowest grade label, from a promotion. */
	tmq: number
}

export type AcademicYearDetail = {
	id: number
	year: string | null
	startYear: number | null
	endYear: number | null
	/** dd-mm-yyyy — the legacy `active_kbm` accessor format, which differs from the cost dates. */
	activeKbm: string | null
	note: string | null
	serialNumber: string | null
	type: "reguler" | "indent" | null
	status: boolean
	isCurrent: boolean
	/** dd/mm/yyyy. */
	costDateStart: string | null
	costDateEnd: string | null
}

export type AcademicYearQuotaInput = {
	levelId: number
	/** Sent as the raw string the input holds, so an empty box fails validation like legacy. */
	quota: string
}

export type AcademicYearPayload = {
	/** Create only — legacy disables both year inputs on edit, making `year` immutable. */
	startYear?: string
	activeKbm: string
	note?: string | null
	serialNumber: string
	type?: "reguler" | "indent"
	status: boolean
	isCurrent: boolean
	costDateStart: string
	costDateEnd: string
	quotas: AcademicYearQuotaInput[]
}

export type AcademicYearDeleteStep = {
	id: number
	year: string | null
	step: AcademicYearDeleteTarget
	/**
	 * true => the "Ya, hapus" button renders at 0.2 opacity with pointer-events:none.
	 * Registrant step: some registrant account is still active. Student step: some
	 * student is still active by account or by KBM. Alumni and plain delete: never.
	 */
	locked: boolean
	/** Set when the data changed underneath and this step no longer applies. */
	redirect: string | null
}

// --- Jenjang (legacy LevelController) ---------------------------------------------------

export type LevelRow = {
	id: number
	name: string | null
	status: "show" | "hide" | null
	/** "23 September 2026 jam 14.05". */
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

export type LevelPayload = {
	name: string
	status: "show" | "hide"
}

export type LevelDelegatePayload = {
	levelId: number
}

export type LevelDeleteStep = {
	id: number
	name: string | null
	step: LevelDeleteTarget
	/** Every other level, in database order — the destination picker. Empty for the plain delete. */
	levels: LevelOption[]
	redirect: string | null
}

// --- Jurusan (legacy MajorController) ---------------------------------------------------

export type MajorRow = {
	id: number
	name: string | null
	levelId: number | null
	/** Null when the level was deleted — legacy's `withDefault()` renders an empty cell. */
	levelName: string | null
	desc: string | null
	createdAt: string
	createdAtTs: number
}

export type MajorDetail = {
	id: number
	name: string | null
	levelId: number | null
	desc: string | null
}

export type MajorPayload = {
	name: string
	levelId: number
	desc?: string | null
}

// --- Kelas (legacy GradeController) -----------------------------------------------------

export type GradeRow = {
	id: number
	label: number | null
	/** Legacy prefixes the label, e.g. "Kelas 7". */
	name: string
	levelId: number | null
	levelName: string | null
	createdAt: string
	createdAtTs: number
}

export type GradeDetail = {
	id: number
	levelId: number | null
	label: number | null
}

export type GradePayload = {
	levelId: number
	/** Globally unique across every level — legacy's `unique:grades,label`. */
	label: number
}

// --- Subkelas (legacy SubGradeController) -----------------------------------------------

export type SubGradeRow = {
	id: number
	label: string | null
	createdAt: string
	createdAtTs: number
}

export type SubGradeDetail = {
	id: number
	label: string | null
}

export type SubGradePayload = {
	label: string
}
