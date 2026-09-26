// The invoice generator: the arithmetic half of legacy `StudentCapabilityController@publishInvoice`
// (681-836), lifted out of the controller so it can be checked against the 22,615 invoices the
// legacy code already wrote without a database being anywhere near it.
//
// **Pure by construction** — no Nest, no repository, no `Date`, no `toLocaleString`, no `now()`.
// Everything it needs arrives as plain values and it answers with the rows to insert. That is what
// makes the golden test (`scratchpad/golden-invoice-check.ts`) possible: it re-derives every live
// invoice from its capability and cost term and diffs the result byte-for-byte.
//
// Three properties of the legacy code decide the shape of this file:
//
//   1. `$start_date` is a **mutable Carbon instance and `$inc_date` is the same object**. Each
//      instalment is computed from where the previous one landed, not from the period start, so the
//      loop carries a cursor. Legacy re-creates `$start_date` at the top of every accountancy, so
//      the cursor resets per account and never across accounts.
//   2. Every date is a Postgres `date`. Building a JS `Date` from `2022-07-01` and formatting it
//      back in Asia/Jakarta moves the day, so all arithmetic happens on `[y, m, d]` integers via the
//      civil-date helpers in `billing/cost-term-codec.ts`.
//   3. The composed `name` (`"Syahriyah Bulan Juli 2022"`) is stored on 18,908 live rows and is what
//      the santri portal prints. The month word comes from an explicit table — `toLocaleString`
//      depends on the host's ICU build and would silently drift.

import { addDays, daysFromCivil, parseIsoDate, type CivilDate } from "@admin/common/civil-date"

/** `tbr_student_cost_terms.period`. The column is free text; `yearly` is enum-legal and unhandled. */
export type GeneratorPeriod = "monthly" | "once"

/** Why a publish cannot produce invoices. Legacy has no equivalent — it wrote nothing and said "berhasil". */
export type InvoiceGenerationFault =
	| { code: "no-items" }
	| { code: "missing-cost-period" }
	| { code: "missing-cost-term"; accountancyId: number }
	| { code: "unsupported-period"; accountancyId: number; period: string | null }
	| { code: "invalid-interval"; accountancyId: number; timeSpan: number }
	| { code: "missing-month-of"; accountancyId: number }
	| { code: "missing-day-of"; accountancyId: number }

export class InvoiceGenerationError extends Error {
	constructor(readonly fault: InvoiceGenerationFault) {
		super(describeFault(fault))
		this.name = "InvoiceGenerationError"
	}
}

/** One `tbr_student_cost_terms` row, already narrowed to the columns the schedule depends on. */
export type GeneratorTerm = {
	period: string | null
	timeSpan: number
	monthOf: number | null
	dayOf: number | null
	reminderDays: number | null
}

/** One agreed line of the capability, paired with the cost term that prices its schedule. */
export type GeneratorItem = {
	accountancyId: number
	/** `tbr_accountancies.name` as it reads **now**; the invoice keeps it as a snapshot. */
	accountancyName: string
	/** `tbr_student_cost_capabilities.amount`. Zero is a legal agreed amount, not missing. */
	amount: number
	/** Null when the scoped lookup found nothing — legacy swallowed that into the string `'0'`. */
	term: GeneratorTerm | null
}

/** `tbr_academic_years.cost_date_start` / `cost_date_end`, as `YYYY-MM-DD`. */
export type GeneratorPeriodDates = {
	costDateStart: string | null
	costDateEnd: string | null
}

/** One row for `tbr_student_invoices`, minus everything the writer supplies. */
export type GeneratedInvoice = {
	accountancyId: number
	/** Legacy `$count_monthly` — the instalment ordinal and the 3rd segment of `unique_id`. */
	index: number
	name: string
	amount: number
	/** `YYYY-MM-DD`. */
	dueDate: string
	/** `YYYY-MM-DD`. */
	reminder: string
}

// ─── Civil-date arithmetic ───────────────────────────────────────────────────────

/** `Carbon::daysInMonth`. */
export const daysInMonth = (year: number, month: number): number => {
	if (month === 2) {
		const leap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
		return leap ? 29 : 28
	}
	return month === 4 || month === 6 || month === 9 || month === 11 ? 30 : 31
}

/**
 * `Carbon::startOfMonth()->addMonths($n)`.
 *
 * Legacy only ever calls `addMonths` on a cursor it has just reset to the 1st, so Carbon's
 * end-of-month overflow (31 Jan + 1 month → 3 Mar) can never fire. Normalising to day 1 first
 * makes that impossible here too rather than leaving it to the caller.
 */
export const startOfMonthPlus = (cursor: CivilDate, months: number): CivilDate => {
	const zeroBased = (cursor.year * 12 + (cursor.month - 1)) + months
	return { year: Math.floor(zeroBased / 12), month: (zeroBased % 12) + 1, day: 1 }
}

/** `Carbon::lastOfMonth()`. */
export const lastOfMonth = (cursor: CivilDate): CivilDate => ({
	year: cursor.year,
	month: cursor.month,
	day: daysInMonth(cursor.year, cursor.month),
})

/** `Carbon::diffInDays()` — absolute, as legacy's is. */
const diffInDays = (from: CivilDate, to: CivilDate): number =>
	Math.abs(daysFromCivil(to) - daysFromCivil(from))

const toIso = (date: CivilDate): string =>
	`${String(date.year).padStart(4, "0")}-${String(date.month).padStart(2, "0")}-${String(date.day).padStart(2, "0")}`

// ─── Naming ─────────────────────────────────────────────────────────────────────

/**
 * `formatDate($inc_date, 'F Y')` under `config('app.locale') = 'id'`.
 *
 * Spelled out rather than delegated: `Intl`/`toLocaleString` answers from whatever ICU data the
 * host node happens to carry, and 18,908 stored names have to keep matching byte-for-byte. Verified
 * against every distinct month word in `tbr_student_invoices`.
 */
export const INDONESIAN_MONTHS = [
	// prettier-ignore
	"Januari", "Februari", "Maret", "April", "Mei", "Juni",
	// prettier-ignore
	"Juli", "Agustus", "September", "Oktober", "November", "Desember",
] as const

export const indonesianMonthYear = (date: CivilDate): string =>
	`${INDONESIAN_MONTHS[date.month - 1] ?? ""} ${date.year}`

/** `$accountancy->name . ' Bulan ' . formatDate($inc_date, 'F Y')`. */
export const monthlyInvoiceName = (accountancyName: string, date: CivilDate): string =>
	`${accountancyName} Bulan ${indonesianMonthYear(date)}`

// ─── Decoding one account's schedule ─────────────────────────────────────────────

/**
 * `round($time_span / 30.4167)` — how many months apart two instalments are.
 *
 * Legacy then uses it as `$i % $date_range_month`, so 0 is a `DivisionByZeroError` and the whole
 * publish 500s having already written part of the batch. `time_span` is `month_bill * 30` for every
 * row that exists, so the rounding is exact; a hand-edited non-multiple or anything under 16 is
 * refused here instead of dividing by zero.
 */
export const intervalMonths = (timeSpan: number): number => Math.round(timeSpan / 30.4167)

const monthlySchedule = (item: GeneratorItem, term: GeneratorTerm, period: GeneratorPeriodDates): GeneratedInvoice[] => {
	const start = parseIsoDate(period.costDateStart)
	const end = parseIsoDate(period.costDateEnd)
	if (!start || !end) throw new InvoiceGenerationError({ code: "missing-cost-period" })

	const interval = intervalMonths(term.timeSpan)
	if (interval < 1) {
		throw new InvoiceGenerationError({ code: "invalid-interval", accountancyId: item.accountancyId, timeSpan: term.timeSpan })
	}
	if (term.monthOf === null || term.monthOf < 1) {
		throw new InvoiceGenerationError({ code: "missing-month-of", accountancyId: item.accountancyId })
	}
	if (term.dayOf === null || term.dayOf < 1) {
		throw new InvoiceGenerationError({ code: "missing-day-of", accountancyId: item.accountancyId })
	}

	// `round(diffInDays(cost_date_start, cost_date_end) / 30.4167)` — 12 for every live academic year
	const yearMonths = Math.round(diffInDays(start, end) / 30.4167)
	const reminderDays = term.reminderDays ?? 0

	// The mutable Carbon. `$inc_date` is `$start_date`, so where one instalment lands is where the
	// next one starts counting from.
	let cursor: CivilDate = start
	let ordinal = 0
	const rows: GeneratedInvoice[] = []

	for (let i = 1; i <= yearMonths; i++) {
		if (i % interval !== 0) continue
		ordinal += 1

		// `$i <= $date_range_month` can only hold on the first qualifying step, because the first
		// `i` that clears `i % interval === 0` is `interval` itself.
		cursor = startOfMonthPlus(cursor, i <= interval ? term.monthOf - 1 : interval)

		// `$day_in_month < $day_date ? lastOfMonth() : setDay($day_date)`. Legacy calls whichever
		// branch it picks twice — once for `$reminder`, once for `due_date` — which is idempotent
		// for every `day_of` in the table (1..30) and is collapsed to one call here.
		cursor =
			daysInMonth(cursor.year, cursor.month) < term.dayOf
				? lastOfMonth(cursor)
				: { year: cursor.year, month: cursor.month, day: term.dayOf }

		rows.push({
			accountancyId: item.accountancyId,
			index: ordinal,
			name: monthlyInvoiceName(item.accountancyName, cursor),
			amount: item.amount,
			dueDate: toIso(cursor),
			reminder: toIso(addDays(cursor, -reminderDays)),
		})
	}

	return rows
}

const onceSchedule = (item: GeneratorItem, term: GeneratorTerm, period: GeneratorPeriodDates): GeneratedInvoice[] => {
	const start = parseIsoDate(period.costDateStart)
	if (!start) throw new InvoiceGenerationError({ code: "missing-cost-period" })

	// `$start_date->addDays($date_range_once)` — the **raw** `time_span`, never the `/30` decoder.
	// 61 of the 90 live `once` terms are not multiples of 30, so decoding one would move its due date.
	const due = addDays(start, term.timeSpan)

	return [
		{
			accountancyId: item.accountancyId,
			index: 1,
			name: item.accountancyName,
			amount: item.amount,
			dueDate: toIso(due),
			reminder: toIso(addDays(due, -(term.reminderDays ?? 0))),
		},
	]
}

/**
 * The whole schedule for one capability, in legacy's order: every instalment of the first account,
 * then every instalment of the second, and so on.
 *
 * Legacy silently produced nothing for any period it did not recognise — `$result` simply never
 * grew — and still answered "Kesanggupan telah disepakati. Dan tagihan berhasil dibuat." Both that
 * and a missing cost term are explicit faults here; the caller turns them into a 422.
 */
export const generateInvoices = (items: readonly GeneratorItem[], period: GeneratorPeriodDates): GeneratedInvoice[] => {
	if (items.length === 0) throw new InvoiceGenerationError({ code: "no-items" })

	const rows: GeneratedInvoice[] = []
	for (const item of items) {
		if (!item.term) throw new InvoiceGenerationError({ code: "missing-cost-term", accountancyId: item.accountancyId })

		if (item.term.period === "monthly") {
			rows.push(...monthlySchedule(item, item.term, period))
			continue
		}
		if (item.term.period === "once") {
			rows.push(...onceSchedule(item, item.term, period))
			continue
		}
		throw new InvoiceGenerationError({
			code: "unsupported-period",
			accountancyId: item.accountancyId,
			period: item.term.period,
		})
	}
	return rows
}

/** `{student_grade_id}-{accountancy_id}-{instalment}-{generation}`. */
export const invoiceUniqueId = (studentGradeId: number, accountancyId: number, index: number, generation: number): string =>
	`${studentGradeId}-${accountancyId}-${index}-${generation}`

function describeFault(fault: InvoiceGenerationFault): string {
	switch (fault.code) {
		case "no-items":
			return "Silakan pilih minimal 1 kesanggupan."
		case "missing-cost-period":
			return "Periode biaya tahun ajaran belum ditentukan."
		case "missing-cost-term":
			return `Master biaya untuk akun ${fault.accountancyId} belum ditentukan.`
		case "unsupported-period":
			return `Periode "${fault.period ?? "-"}" pada akun ${fault.accountancyId} tidak didukung.`
		case "invalid-interval":
			return `Jangka waktu ${fault.timeSpan} hari pada akun ${fault.accountancyId} tidak valid.`
		case "missing-month-of":
			return `Bulan ke pada akun ${fault.accountancyId} belum ditentukan.`
		case "missing-day-of":
			return `Tanggal jatuh tempo pada akun ${fault.accountancyId} belum ditentukan.`
	}
}
