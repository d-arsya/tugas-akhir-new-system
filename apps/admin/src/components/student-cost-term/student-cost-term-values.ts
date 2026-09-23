import type { StudentCostTermDetail, StudentCostTermPayload } from "@roja/types"

/**
 * The cost-term form's state. Every field is a string, because that is what the legacy inputs
 * hold: the two rupiah fields carry autoNumeric's masked text, the date carries `dd/mm/yyyy`,
 * and the four numeric boxes carry whatever was typed — an empty box has to stay empty so the
 * server can answer `Kolom … wajib diisi` rather than silently reading 0.
 */
export type StudentCostTermFormValues = {
	type: "maximum" | "option"
	period: "once" | "monthly"
	/** Masked, e.g. "1.500.000". */
	amount: string
	/** Masked; at least one row, capped at 20 by the repeater. */
	amounts: string[]
	/** dd/mm/yyyy. */
	onceBill: string
	reminderOnce: string
	monthBill: string
	monthOfMonth: string
	dayOfMonth: string
	reminderMonthly: string
}

/** `create.blade.php` renders `maximum` and `once` checked, everything else blank. */
export const EMPTY_COST_TERM_VALUES: StudentCostTermFormValues = {
	type: "maximum",
	period: "once",
	amount: "",
	amounts: [""],
	onceBill: "",
	reminderOnce: "",
	monthBill: "",
	monthOfMonth: "",
	dayOfMonth: "",
	reminderMonthly: "",
}

const text = (value: number | null | undefined): string =>
	value === null || value === undefined ? "" : String(value)

/**
 * Seeds the form from `StudentCostTermDetail.term`, which arrives already decoded: `onceBill`
 * resolved from `costDateStart + timeSpan`, `monthBill` divided back out of `timeSpan`, and the
 * amounts masked. `null` is the create page.
 *
 * Note which values survive the other branch: legacy renders every field with a
 * `period == 'x' ? … : ''` guard, so switching a saved `monthly` item to `Sekali` starts from a
 * blank due date rather than from a stale one.
 */
export const initialCostTermValues = (term: StudentCostTermDetail["term"]): StudentCostTermFormValues => {
	if (!term) return EMPTY_COST_TERM_VALUES

	const once = term.period === "once"
	const monthly = term.period === "monthly"
	return {
		type: term.type,
		period: term.period,
		amount: term.type === "maximum" ? (term.amounts[0] ?? "") : "",
		amounts: term.type === "option" && term.amounts.length > 0 ? term.amounts : [""],
		onceBill: once ? (term.onceBill ?? "") : "",
		reminderOnce: once ? text(term.reminder) : "",
		monthBill: monthly ? text(term.monthBill) : "",
		monthOfMonth: monthly ? text(term.monthOf) : "",
		dayOfMonth: monthly ? text(term.dayOf) : "",
		reminderMonthly: monthly ? text(term.reminder) : "",
	}
}

/**
 * A blank or unparseable box contributes **no key at all**, so the DTO's `superRefine` sees
 * `undefined` and answers `Kolom … wajib diisi` — assigning `undefined` would trip
 * `exactOptionalPropertyTypes`, and assigning 0 would quietly save a zero.
 */
const numberEntry = <K extends string>(key: K, value: string): Partial<Record<K, number>> => {
	if (value.trim() === "") return {}
	const parsed = Number(value)
	return Number.isFinite(parsed) ? ({ [key]: parsed } as Record<K, number>) : {}
}

/**
 * Builds the wire payload. Legacy serialised the whole form, hidden blocks included, and leaned
 * on `required_if` to ignore the branch that was not chosen; the port sends only the chosen
 * branch, which the DTO's `superRefine` validates the same way.
 *
 * The masked strings go over as-is: the server parses them with the port of PHP's
 * `intval(str_replace(".", "", $amount))`, and `amount` is length-checked at 12 **characters**,
 * dots and all, exactly as legacy's `max:12` was.
 */
export const toCostTermPayload = (values: StudentCostTermFormValues): StudentCostTermPayload => ({
	type: values.type,
	period: values.period,
	...(values.type === "maximum" ? { amount: values.amount } : { amounts: values.amounts }),
	...(values.period === "once"
		? {
				// Laravel's `ConvertEmptyStringsToNull` turns a blank box into null, which the
				// `nullable` in `once_bill`'s rule then lets past `date_format` — so an empty date
				// answers `Kolom tanggal jatuh tempo wajib diisi` alone, not that plus a format
				// complaint. Omitting the key reproduces that.
				...(values.onceBill.trim() === "" ? {} : { onceBill: values.onceBill }),
				...numberEntry("reminderOnce", values.reminderOnce),
			}
		: {
				...numberEntry("monthBill", values.monthBill),
				...numberEntry("monthOfMonth", values.monthOfMonth),
				...numberEntry("dayOfMonth", values.dayOfMonth),
				...numberEntry("reminderMonthly", values.reminderMonthly),
			}),
})
