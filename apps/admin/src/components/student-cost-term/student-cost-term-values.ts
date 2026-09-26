import type { StudentCostTermDetail, StudentCostTermPayload } from "@roja/types"

export type StudentCostTermFormValues = {
	type: "maximum" | "option"
	period: "once" | "monthly"
	amount: string
	amounts: string[]
	onceBill: string
	reminderOnce: string
	monthBill: string
	monthOfMonth: string
	dayOfMonth: string
	reminderMonthly: string
}

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

const numberEntry = <K extends string>(key: K, value: string): Partial<Record<K, number>> => {
	if (value.trim() === "") return {}
	const parsed = Number(value)
	return Number.isFinite(parsed) ? ({ [key]: parsed } as Record<K, number>) : {}
}

export const toCostTermPayload = (values: StudentCostTermFormValues): StudentCostTermPayload => ({
	type: values.type,
	period: values.period,
	...(values.type === "maximum" ? { amount: values.amount } : { amounts: values.amounts }),
	...(values.period === "once"
		? {
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
