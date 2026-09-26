// The Biaya Santri cost-term codec: the only place that translates between the level-4 form's
// vocabulary and the columns `student_cost_terms` actually stores.
//
// Deliberately pure — no Nest, no repository, no I/O, no `Date` — because the stored shape is
// **lossy in both period branches** and every existing fee schedule has to survive being opened
// and re-saved unchanged:
//
//   once    — stores `time_span = |days(onceBill, costDateStart)|`, reads back `costDateStart + time_span`
//   monthly — stores `time_span = monthBill * 30`, reads back `time_span / 30`
//
// Legacy read the monthly branch back as `round(time_span / 30.4167)` (`edit/monthly.blade.php`),
// which is **not** the inverse of `monthBill * 30`. It holds only for n = 1..36: the read-back is
// short by more than half a month once 0.013696n > 0.5, i.e. n > 36.497, so n = 37 already returns
// 36. That breaks **63 of the 99** values `<input type="number" min="1" max="99">` accepts (37..99,
// contiguous, each short by exactly 1). A 37 that reads back as 36 rebuilds the `Bulan ke` select
// as 1..36, drops a saved `month_of = 37` off the option list, and the next save posts an empty
// `month_of`. `time_span / 30` is exact for **every** row that
// exists (`… WHERE period='monthly' AND time_span % 30 <> 0` is empty; asserted in the tests), so
// the inverse is dropped here — plan decision.
//
// Dates are handled as `[y, m, d]` integers throughout. `cost_date_start` is a Postgres `date`
// and `time_span = 0` exists, so building a JS `Date` from it — or from a `dd/mm/yyyy` form
// value — shifts the day by one across the UTC↔Asia/Jakarta boundary and is immediately visible.

import { maskAmount, unmaskAmount } from "@admin/common/amount-mask"
import { addDays, daysFromCivil, formatDmyDate, parseDmyDate, parseIsoDate } from "@admin/common/civil-date"

export type CostTermType = "maximum" | "option"
export type CostTermPeriod = "once" | "monthly"

/** One `student_cost_terms` row, as the fee-describing columns store it. */
export type StoredCostTerm = {
	type: CostTermType
	period: CostTermPeriod
	timeSpan: number
	monthOf: number | null
	dayOf: number | null
	reminder: number | null
	/** `student_cost_terms.grade` holds the Grade **label**, as text — not the id. */
	grade: string
}

/** The level-4 form, one field per input on `create.blade.php` / `edit.blade.php`. */
export type CostTermForm = {
	type: CostTermType
	period: CostTermPeriod
	/** `once_bill`, `dd/mm/yyyy`, as the datepicker holds it. */
	onceBill: string | null
	reminderOnce: number | null
	monthBill: number | null
	monthOfMonth: number | null
	dayOfMonth: number | null
	reminderMonthly: number | null
}

export type EncodeContext = {
	/** `academic_years.cost_date_start` as `YYYY-MM-DD`. */
	costDateStart: string
	/** `grades.label`, stringified — what the column stores. */
	grade: string
	/**
	 * The row being updated, or null on create. Legacy's `update()` writes `month_of` / `day_of`
	 * **only** in the monthly branch, so a term switched monthly → once keeps its stale values.
	 * Carried through rather than nulled, so re-saving an existing row is a no-op.
	 */
	previous?: StoredCostTerm | null
}

/** `month_bill * 30` — the only multiplier legacy's `store()`/`update()` ever wrote. */
export const DAYS_PER_MONTH_BILL = 30

/**
 * `once_bill` minus `cost_date_start`, in days, **signed**.
 *
 * Legacy stores `Carbon::diffInDays()`, which is absolute, so a due date *before* the cost
 * period start is written as a positive offset and then reads back as a date *after* it.
 * {@link encodeCostTerm} replicates the `abs()` so existing rows stay interpretable; callers
 * use this to refuse creating new ones.
 */
export const onceBillOffset = (onceBill: string, costDateStart: string): number | null => {
	const due = parseDmyDate(onceBill)
	const start = parseIsoDate(costDateStart)
	if (!due || !start) return null
	return daysFromCivil(due) - daysFromCivil(start)
}

/**
 * `time_span / 30`.
 *
 * Exact for every row in the table. A hand-edited non-multiple would otherwise surface as a
 * fraction in a `type="number"` input, so it rounds — and never below 1, since the `Bulan ke`
 * select is built as `1..monthBill` and an empty domain would blank the field.
 */
const decodeMonthBill = (timeSpan: number): number =>
	Math.max(1, Math.round(timeSpan / DAYS_PER_MONTH_BILL))

/** Stored columns → the form. The inverse of {@link encodeCostTerm}. */
export const decodeCostTerm = (stored: StoredCostTerm, costDateStart: string | null): CostTermForm => {
	const base = { type: stored.type, period: stored.period } as const

	if (stored.period === "once") {
		const start = costDateStart === null ? null : parseIsoDate(costDateStart)
		return {
			...base,
			onceBill: start === null ? null : formatDmyDate(addDays(start, stored.timeSpan)),
			reminderOnce: stored.reminder,
			monthBill: null,
			monthOfMonth: null,
			dayOfMonth: null,
			reminderMonthly: null,
		}
	}

	return {
		...base,
		onceBill: null,
		reminderOnce: null,
		monthBill: decodeMonthBill(stored.timeSpan),
		monthOfMonth: stored.monthOf,
		dayOfMonth: stored.dayOf,
		reminderMonthly: stored.reminder,
	}
}

/** The form → stored columns. The inverse of {@link decodeCostTerm}. */
export const encodeCostTerm = (form: CostTermForm, context: EncodeContext): StoredCostTerm => {
	const previous = context.previous ?? null

	if (form.period === "once") {
		const offset = form.onceBill === null ? null : onceBillOffset(form.onceBill, context.costDateStart)
		return {
			type: form.type,
			period: "once",
			// `diffInDays` is absolute — replicated so rows written by legacy decode the same way
			timeSpan: offset === null ? 0 : Math.abs(offset),
			// Legacy's once branch never writes these two, on create or on update
			monthOf: previous?.monthOf ?? null,
			dayOf: previous?.dayOf ?? null,
			reminder: form.reminderOnce,
			grade: context.grade,
		}
	}

	return {
		type: form.type,
		period: "monthly",
		timeSpan: (form.monthBill ?? 0) * DAYS_PER_MONTH_BILL,
		monthOf: form.monthOfMonth,
		dayOf: form.dayOfMonth,
		reminder: form.reminderMonthly,
		grade: context.grade,
	}
}

/**
 * The domain checks that make {@link encodeCostTerm} and {@link decodeCostTerm} inverses of each
 * other — all of them the range the form's own inputs already enforce, none of them in legacy.
 * Returns the field errors, keyed by payload field, or null.
 *
 * The once rule is the important one: `Carbon::diffInDays()` is **absolute**, so legacy stored a
 * due date before the cost period start as a positive offset and read it back as a date *after*
 * it. The `abs()` stays in {@link encodeCostTerm} so rows written by legacy keep decoding the way
 * they were written; new ones are refused here instead.
 */
export const validateCostTermForm = (
	form: CostTermForm,
	costDateStart: string,
): Record<string, string[]> | null => {
	if (form.period === "once") {
		const offset = form.onceBill === null ? null : onceBillOffset(form.onceBill, costDateStart)
		if (offset !== null && offset < 0) {
			return { onceBill: ["Tanggal jatuh tempo tidak boleh sebelum awal periode biaya"] }
		}
		return null
	}

	// `<input type="number" min="1" max="99">`
	const monthBill = form.monthBill ?? 0
	if (monthBill < 1 || monthBill > 99) return { monthBill: ["Kolom ditagihkan harus antara 1 dan 99"] }

	// `Bulan ke` is rebuilt as `1..month_bill` on every keystroke, so a `month_of` outside that
	// range is dropped from the option list on the next edit and re-saved blank
	const monthOf = form.monthOfMonth ?? 0
	if (monthOf < 1 || monthOf > monthBill) {
		return { monthOfMonth: [`Kolom bulan ke harus antara 1 dan ${monthBill}`] }
	}

	const dayOf = form.dayOfMonth ?? 0
	if (dayOf < 1 || dayOf > 31) return { dayOfMonth: ["Kolom tanggal harus antara 1 dan 31"] }

	return null
}

/** Stored `student_costs.amount` rows (already `ORDER BY id`) → the form's masked strings. */
export const decodeAmounts = (amounts: number[]): string[] => amounts.map(maskAmount)

/** The form's masked strings → `student_costs.amount` integers, in the order submitted. */
export const encodeAmounts = (masked: string[]): number[] => masked.map(unmaskAmount)
