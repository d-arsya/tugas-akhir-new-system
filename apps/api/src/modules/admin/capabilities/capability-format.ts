// The Kesanggupan cell renderers, ported from `StudentCapabilityService`, `Grade`,
// `AcademicYearService` and `StudentCostTerm`, plus the row shapes they map between and the data
// both agreement documents read.
//
// Legacy returns HTML from every one of these — a `<span class='tbr_label…'>` badge, a hidden
// `<span class="d-none">` sort key, an inline SVG action. Following the phase-1 contract rule the
// markup stays in the client and only the value travels.

import type {
	CapabilityAlertState,
	CapabilityHistoryRow,
	CapabilityItemRow,
	CapabilityPeriodLabel,
	CapabilityStatus,
	CapabilityStatusLabel,
} from "@roja/types"

import { toAmount } from "@shared/billing/invoice-calculator"

// ─── SQL row shapes, as node-postgres hands them back ───────────────────────

export type YearSqlRow = {
	id: string
	year: string | null
	costDateStart: string | null
	costDateEnd: string | null
	statusLabel: "Berjalan" | "Berakhir" | "-" | null
}

export type GradeSqlRow = {
	id: string
	label: string | null
	masterCostDefined: boolean
	studentCount: number
}

export type StudentSqlRow = {
	studentGradeId: string
	nis: string | null
	fullName: string | null
	parentOrGuardian: string | null
	subGrade: string | null
	capabilityCount: number
}

export type CardSqlRow = {
	studentGradeId: string
	studentId: string | null
	nis: string | null
	fullName: string | null
	photoPath: string | null
	academicYear: string | null
	levelName: string | null
	grade: string | null
	subGrade: string | null
	fatherName: string | null
	currentAcademicYear: string | null
	costAcademicYearId: string | null
	gradeId: string | null
}

export type HistorySqlRow = {
	id: string
	approveDate: string | null
	approveDateTs: string | null
	status: CapabilityStatus | null
	note: string | null
	itemCount: number
}

export type CapabilitySqlRow = {
	id: string
	studentGradeId: string | null
	status: CapabilityStatus | null
	note: string | null
	approveDate: string | null
	ordinal: number
}

export type ItemSqlRow = {
	costTermId: string
	accountancyId: string | null
	name: string | null
	type: "maximum" | "option"
	period: "once" | "monthly"
	amounts: string[] | null
	agreedAmount: string | null
	hasRow: boolean
}

// ─── Copy, verbatim ─────────────────────────────────────────────────────────

/** `Grade::getNoteCapability()` — hardcoded, for every grade, in every year. */
export const GRADE_NOTE = "Dalam pengerjaan"

/** `@storeToSession:156` — any ticked santri still holding an unagreed capability. */
export const UNAGREED_IN_SELECTION = "Terdapat kesanggupan yang belum disepakati."
/** `@storeToSession:165` — "create" was chosen but somebody already has one. */
export const ALREADY_HAS_CAPABILITY = "Terdapat santri yang sudah punya kesanggupan."

export const STUDENT_NOT_FOUND = "Santri tidak ditemukan"
export const CAPABILITY_NOT_FOUND = "Kesanggupan tidak ditemukan"
export const YEAR_NOT_FOUND = "Tahun ajaran tidak ditemukan"
export const GRADE_NOT_FOUND = "Kelas tidak ditemukan"
/** New copy: legacy never checks that the ticked ids came from the page that posted them. */
export const SELECTION_OUT_OF_SCOPE = "Terdapat santri yang bukan berasal dari kelas ini."
/** The level-3 guard legacy answers with a redirect; an API answers with a reason. */
export const MASTER_COST_UNDEFINED = "Master biaya belum ditentukan!"

// ─── Cell renderers ─────────────────────────────────────────────────────────

const MONTHS_SHORT_ID = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"]

/** `formatFromTo($date, 'Y-m-d', 'd M Y')` → "01 Jul 2026". */
const shortDate = (isoDate: string | null): string => {
	if (!isoDate) return ""
	const month = MONTHS_SHORT_ID[Number(isoDate.slice(5, 7)) - 1] ?? ""
	return `${isoDate.slice(8, 10)} ${month} ${isoDate.slice(0, 4)}`
}

/**
 * `AcademicYear::getCostPeriodAttribute()` → "01 Jul 2024 - 30 Jun 2025".
 *
 * Legacy concatenates `$start . ' - ' . $end` with no guard, so a year without cost dates renders
 * the separator alone. Only `Archive` is in that state and level 1 never lists it.
 */
export const costPeriodText = (costDateStart: string | null, costDateEnd: string | null): string =>
	`${shortDate(costDateStart)} - ${shortDate(costDateEnd)}`

/** `"Kelas " . $grade->label`. */
export const gradeName = (label: number | null): string => `Kelas ${label ?? ""}`

/** `StudentCapabilityService::getStatus()` — the three `tbr_label` badges, and nothing for anything else. */
export const statusLabel = (status: CapabilityStatus | null): CapabilityStatusLabel | null => {
	if (status === "approve") return "Disepakati"
	if (status === "changed") return "Dirubah"
	if (status === "disapprove") return "Belum disepakati"
	return null
}

/** `StudentCostTerm::getTranslatePeriodAttribute()` — `once` reads "Sekali", anything else "Bulanan". */
export const periodLabel = (period: string | null): CapabilityPeriodLabel =>
	period === "once" ? "Sekali" : "Bulanan"

/**
 * `StudentCostTerm::getAccountCostAttribute()` — the master price of a term, or null when the term
 * carries more than one, which legacy renders as an empty cell and which blocks saving.
 */
const accountCost = (amounts: readonly string[]): number | null =>
	amounts.length > 1 || amounts.length === 0 ? null : toAmount(amounts[0])

/**
 * One row of the level-5 table.
 *
 * Two legacy readings of "what amount does this row show" disagree, and the table's is the one the
 * contract carries:
 *
 *  * the **cell** is `rupiah(is_null($capability_cost) ? $term->account_cost : $capability_cost)`,
 *    so an agreed 0 prints "Rp 0";
 *  * the **modal** is `$capability->getAccountCost(...) ?: $term->account_cost`, PHP's falsy
 *    fallback, so re-opening that same row put the slider back at the master price and saving
 *    without touching it silently raised the santri's agreed amount from 0.
 *
 * `amount = COALESCE(agreed, master)` keeps the cell's reading in both places (fix). 64 live line
 * items are a legal agreed 0 on a `type='maximum'` term.
 *
 * `selected` is `!is_null($capability->getAccountCost($accountancy_id))`, which is false both when
 * the capability has no row for the account **and** when the row it has carries a NULL amount —
 * two live rows are in that second state.
 */
export const toItemRow = (row: ItemSqlRow): CapabilityItemRow => {
	const amounts = row.amounts ?? []
	const master = accountCost(amounts)
	const agreed = row.agreedAmount === null ? null : toAmount(row.agreedAmount)

	return {
		costTermId: Number(row.costTermId),
		accountancyId: Number(row.accountancyId ?? 0),
		name: row.name,
		type: row.type,
		period: row.period,
		periodLabel: periodLabel(row.period),
		amount: agreed ?? master,
		// `max="{{ $student_cost_term->studentCosts->first()->amount }}"` on the slider
		maxAmount: amounts.length === 0 ? null : toAmount(amounts[0]),
		// The radio list is built from `$student_cost_term->studentCosts`; a slider has none
		options: row.type === "option" ? amounts.map(toAmount) : [],
		// `modal-edit-capability-item.blade.php:42` hardcodes it; mass-create uses `min(master, 5000)`
		step: 5000,
		selected: row.hasRow && row.agreedAmount !== null,
	}
}

export const toHistoryRow = (row: HistorySqlRow, ordinal: number): CapabilityHistoryRow => ({
	id: Number(row.id),
	ordinal,
	approveDate: row.approveDate,
	approveDateTs: row.approveDateTs === null ? null : Number(row.approveDateTs),
	itemCount: row.itemCount,
	status: row.status,
	statusLabel: statusLabel(row.status),
	note: row.note,
})

/**
 * `student-capability.blade.php:41-99` — the three `@if` branches, and the gap between them.
 *
 * No capability at all opens the "Buat kesanggupan" form; the newest one being `disapprove` or
 * `approve` picks a banner. `changed` matches nothing, so legacy renders **no banner** — that is
 * reproduced as `null` rather than invented into a fourth state.
 */
export const alertFor = (status: CapabilityStatus | null, hasAny: boolean): CapabilityAlertState => {
	if (!hasAny) return "no-capability"
	if (status === "disapprove") return "unagreed"
	if (status === "approve") return "agreed"
	return null
}
