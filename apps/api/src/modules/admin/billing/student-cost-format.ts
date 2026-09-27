// The Biaya Santri cell renderers, ported from `StudentCostService` and `AccountancyService`,
// plus the row shapes they map between.
//
// Legacy returns HTML from every one of these, each with a hidden `<span class="d-none">` sort
// key in front of the visible text so DataTables' `any-number` type sorts the column numerically
// rather than alphabetically. Following the phase-1 contract rule, the visible string and the
// sort key ship as separate fields and the markup stays in the client.

import type { StudentCostTermWriteInput } from "@admin/billing/dto/student-cost-admin.dto"
import { addDays, formatIsoDate, parseIsoDate } from "@admin/common/civil-date"
import {
	decodeAmounts,
	decodeCostTerm,
	type CostTermForm,
	type CostTermPeriod,
	type CostTermType,
	type StoredCostTerm,
} from "@admin/billing/cost-term-codec"
import { indoDate, indoDateShort } from "@admin/common/date-format"
import type { StudentCostTerm as StudentCostTermEntity } from "@admin/common/entities/student-cost-term.entity"

// ─── Row shapes ─────────────────────────────────────────────────────────────────

/** `student_cost_terms`, as node-pg hands bigints back: strings. */
export type TermSqlRow = {
	id: string
	type: CostTermType
	period: CostTermPeriod
	timeSpan: string | null
	monthOf: string | null
	dayOf: string | null
	reminder: string | null
	grade: string
}

/** One accountancy of the level-3 table, with its term for this year+grade left-joined on. */
export type AccountSqlRow = TermSqlRow & {
	accountancyId: string
	name: string | null
	note: string | null
	termId: string | null
	applied: boolean
}

/** Level 1: one academic year. */
export type StudentCostYearRow = {
	id: number
	year: string | null
	period: string
	statusAkademik: "berjalan" | "berakhir" | "empty" | "none"
}

/** Level 2: one grade, with "N dari M item biaya". */
export type StudentCostGradeRow = {
	gradeId: number
	label: number | null
	name: string
	appliedCount: number
	totalItems: number
	appliedText: string
}

/** Level 3: one accountancy row of the ten-column item table. */
export type StudentCostAccountRow = {
	accountancyId: number
	name: string | null
	note: string
	termId: number | null
	applied: boolean
	type: CostTermType | null
	maximumCost: string | null
	maximumSort: number | null
	optionCosts: string[]
	optionSort: number | null
	periodLabel: string
	periodSort: number | null
	reminderLabel: string
	reminderSort: number | null
	dueDate: string
}

export type StudentCostAccountPage = {
	academicYear: { id: number; year: string | null; costPeriod: string; costDateStart: string | null }
	grade: { id: number; label: number | null }
	/** `isAccountancyAppliedAll()` — the header check-all box's initial state. */
	allApplied: boolean
	rows: StudentCostAccountRow[]
}

/** The level-4 form's payload, already decoded out of the stored representation. */
export type StudentCostTerm = {
	id: number
	type: CostTermType
	period: CostTermPeriod
	onceBill: string | null
	reminder: number | null
	monthBill: number | null
	monthOf: number | null
	dayOf: number | null
	amounts: string[]
}

export type StudentCostTermDetail = {
	accountancy: { id: number; name: string | null }
	academicYear: { id: number; year: string | null; costDateStart: string | null }
	grade: { id: number; label: number | null }
	/** null on the create page. */
	term: StudentCostTerm | null
	/** An approved StudentCapability exists, so legacy renders the Periode radios `tbr_disabled`. */
	periodLocked: boolean
}

export const toNumber = (value: string | null): number | null => (value === null ? null : Number(value))

const toText = (value: number | string | null): string | null => (value === null ? null : String(value))

export type TermColumns = Pick<
	StudentCostTermEntity,
	"id" | "type" | "period" | "timeSpan" | "monthOf" | "dayOf" | "reminder" | "grade"
>

export const toTermSqlRow = (term: TermColumns): TermSqlRow => ({
	id: String(term.id),
	type: term.type as CostTermType,
	period: term.period as CostTermPeriod,
	timeSpan: toText(term.timeSpan),
	monthOf: toText(term.monthOf),
	dayOf: toText(term.dayOf),
	reminder: toText(term.reminder),
	grade: term.grade as string,
})

/** The six fee columns of one row, as the codec reads them. */
export const storedFrom = (row: TermSqlRow): StoredCostTerm => ({
	type: row.type,
	period: row.period,
	timeSpan: Number(row.timeSpan ?? 0),
	monthOf: toNumber(row.monthOf),
	dayOf: toNumber(row.dayOf),
	reminder: toNumber(row.reminder),
	grade: row.grade,
})

// ─── Cell renderers ─────────────────────────────────────────────────────────────

/** `'Rp ' . number_format($amount, 0, ",", ".")` → "Rp 1.500.000". */
export const rupiah = (amount: number): string =>
	`Rp ${String(amount).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`

/**
 * `getCostPeriodAttribute()` → "01 Jul 2025 - 30 Jun 2026". A year with no cost dates renders
 * "-", as it does on the Tahun Ajaran list.
 */
export const costPeriodText = (costDateStart: string | null, costDateEnd: string | null): string =>
	costDateStart === null ? "-" : `${indoDateShort(costDateStart)} - ${indoDateShort(costDateEnd)}`

/** `"Kelas " . $grade->label`. */
export const gradeName = (label: number | null): string => `Kelas ${label ?? ""}`

/** `appliedCostItem()` → "3 dari 9 item biaya". */
export const appliedCostItemText = (applied: number, total: number): string =>
	`${applied} dari ${total} item biaya`

/** `getPeriode()` — "Sekali" sorts as 1, "Bulanan" as 2, anything else renders "-" with no key. */
export const periodLabel = (period: CostTermPeriod | null): string =>
	period === "once" ? "Sekali" : period === "monthly" ? "Bulanan" : "-"

export const periodSort = (period: CostTermPeriod | null): number | null =>
	period === "once" ? 1 : period === "monthly" ? 2 : null

/** `getHari()` → "7 Hari". A null or zero reminder is falsy in PHP and renders "-". */
export const reminderLabel = (reminder: number | null): string => (reminder ? `${reminder} Hari` : "-")

export const reminderSort = (reminder: number | null): number | null => (reminder ? reminder : null)

/**
 * `getDueDate()`.
 *
 * * monthly → "Bulan ke 3, Tanggal 10" — the raw `month_of` / `day_of`, interpolated even when
 *   they are null (PHP prints an empty string, which is what an unfinished row shows).
 * * once → `Carbon(cost_date_start)->addDays($time_span)` in Indonesian `d F Y`, e.g.
 *   "15 Agustus 2025". Computed on `[y, m, d]` integers: `time_span = 0` exists, so a UTC↔Jakarta
 *   round trip through `Date` would show up as an off-by-one immediately.
 * * anything else, including a term that does not exist yet → "-".
 */
export const dueDateText = (
	period: CostTermPeriod | null,
	term: { timeSpan: number | null; monthOf: number | null; dayOf: number | null },
	costDateStart: string | null,
): string => {
	if (period === "monthly") return `Bulan ke ${term.monthOf ?? ""}, Tanggal ${term.dayOf ?? ""}`
	if (period !== "once") return "-"

	const start = parseIsoDate(costDateStart)
	// Legacy would throw here; the only year without cost dates is Archive, which level 1 hides
	if (start === null) return "-"
	return indoDate(formatIsoDate(addDays(start, term.timeSpan ?? 0)))
}

// ─── Row mappers ────────────────────────────────────────────────────────────────

/** One row of the level-3 table: the display strings plus the `any-number` sort keys. */
export const toAccountRow = (
	row: AccountSqlRow,
	amounts: Map<string, number[]>,
	costDateStart: string | null,
): StudentCostAccountRow => {
	const saved = row.termId === null ? [] : (amounts.get(row.termId) ?? [])
	// `getMaximumCost()` returns inside its loop, so it renders the **first** amount only
	const first = saved[0] ?? null
	// `getOptionCost()` interpolates `$student_cost` *after* the loop — i.e. the **last** amount
	const last = saved[saved.length - 1] ?? null
	// No term yet: legacy renders the cells off an empty in-memory model, so they all read "-"
	const period = row.termId === null ? null : row.period
	const isMaximum = row.termId !== null && row.type === "maximum"
	const isOption = row.termId !== null && row.type === "option"

	return {
		accountancyId: Number(row.accountancyId),
		name: row.name,
		note: row.note ? row.note : "-",
		termId: toNumber(row.termId),
		applied: row.applied,
		type: row.termId === null ? null : row.type,
		// A "maximum" term with no amounts renders blank in legacy; unreachable, folded into "-"
		maximumCost: isMaximum && first !== null ? rupiah(first) : null,
		maximumSort: isMaximum ? first : null,
		optionCosts: isOption ? saved.map(rupiah) : [],
		optionSort: isOption ? last : null,
		periodLabel: periodLabel(period),
		periodSort: periodSort(period),
		reminderLabel: reminderLabel(toNumber(row.reminder)),
		reminderSort: reminderSort(toNumber(row.reminder)),
		dueDate: dueDateText(
			period,
			{ timeSpan: toNumber(row.timeSpan), monthOf: toNumber(row.monthOf), dayOf: toNumber(row.dayOf) },
			costDateStart,
		),
	}
}

/** The level-4 payload: the stored row run back through the codec, amounts in `ORDER BY id`. */
export const toTerm = (
	row: TermSqlRow,
	amounts: number[],
	costDateStart: string | null,
): StudentCostTerm => {
	const stored = storedFrom(row)
	const form = decodeCostTerm(stored, costDateStart)
	return {
		id: Number(row.id),
		type: stored.type,
		period: stored.period,
		onceBill: form.onceBill,
		reminder: stored.reminder,
		monthBill: form.monthBill,
		monthOf: form.monthOfMonth,
		dayOf: form.dayOfMonth,
		amounts: decodeAmounts(amounts),
	}
}

/** The write DTO in the codec's vocabulary. */
export const toForm = (dto: StudentCostTermWriteInput): CostTermForm => ({
	type: dto.type,
	period: dto.period,
	onceBill: dto.onceBill ?? null,
	reminderOnce: dto.reminderOnce ?? null,
	monthBill: dto.monthBill ?? null,
	monthOfMonth: dto.monthOfMonth ?? null,
	dayOfMonth: dto.dayOfMonth ?? null,
	reminderMonthly: dto.reminderMonthly ?? null,
})
