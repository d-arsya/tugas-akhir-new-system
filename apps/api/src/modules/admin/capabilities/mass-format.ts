import type { CapabilityItemRow } from "@roja/types"

import { toAmount } from "@shared/billing/invoice-calculator"

// The pure half of the bulk Kesanggupan endpoints: row shaping and the four
// `StudentCapabilityService` set helpers the mass-edit page is built on. Split out of
// `mass-service.ts` only to keep both files under the 300-line limit; nothing here touches
// the database.
//
// File name follows `mass-{controller,service,sql}.ts` and the `*-format.ts` convention already
// used by `payments/payment-format.ts` and `payments/invoice-format.ts`.

/** A row of `SELECT_COST_TERMS_SQL`. `bigint` columns arrive as strings from node-postgres. */
export type CostTermRow = {
	costTermId: string
	accountancyId: string
	name: string | null
	type: string | null
	period: string | null
	amounts: string[]
}

/** `{studentGradeId → {capability id, {accountancyId → agreed amount}}}` for the approved capability. */
export type Approved = Map<number, { id: number; items: Map<number, number> }>

/**
 * `StudentCostTerm::getAccountCostAttribute` — the master cost, which is **null** as soon as the
 * term carries more than one `tbr_student_costs` row. That is what makes an option row's amount
 * cell legitimately empty and, on mass-create, what disables the Save button until it is filled.
 */
export const accountCost = (term: CostTermRow): number | null =>
	term.amounts.length === 1 ? toAmount(term.amounts[0]) : null

/**
 * The autoNumeric mask the form posts ("1.500.000"). Returns **null** when the string holds no
 * digits at all, which is the port's stand-in for legacy's `ArrayCannotContainNullRule`: an
 * `option` row the operator never picked posts an empty value, and legacy answered
 * `Semua kesanggupan wajib untuk dipilih.` Zero is a legal amount and must not be rejected.
 */
export const unmaskAmount = (masked: string): number | null => {
	const leading = /^\s*-?\d+/.exec(masked.replace(/\./g, ""))
	return leading ? Number.parseInt(leading[0], 10) : null
}

/** The half of `CapabilityItemRow` both account tables share. */
export const toItemRow = (term: CostTermRow): Omit<CapabilityItemRow, "amount" | "maxAmount" | "step" | "selected"> => ({
	costTermId: Number(term.costTermId),
	accountancyId: Number(term.accountancyId),
	// `tbr_accountancies` has no `deleted_at` and six ids were hard-deleted, so the LEFT JOIN
	// legitimately yields a null name rather than dropping the row.
	name: term.name,
	// Both columns are free text with no CHECK constraint; only these values are live.
	type: term.type === "option" ? "option" : "maximum",
	period: term.period === "once" ? "once" : "monthly",
	periodLabel: term.period === "once" ? "Sekali" : "Bulanan",
	// `modal-edit-capability*.blade.php` only renders the radio list in the `option` branch
	options: term.type === "option" ? term.amounts.map((amount) => toAmount(amount)) : [],
})

/**
 * `StudentCapabilityService::isStudentGradeHasSameAccount` — whether every selected santri holds
 * the same accounts at the same amounts.
 *
 * Legacy compares `pluck('accountancy_id', 'amount')`, a map keyed by **amount**, between
 * consecutive santri. Keying by amount is what makes the check amount-sensitive, which is what
 * the banner's fourth bullet describes ("Bila item sama tapi nominal berbeda…"). It is also
 * lossy: two accounts carrying the same figure collapse to one entry, so two genuinely different
 * account sets can compare equal and the banner never appears. Comparing the whole
 * `{accountancyId → amount}` map keeps the intent and drops the collision.
 */
export const sameAccounts = (studentGradeIds: number[], approved: Approved): boolean => {
	const signature = (id: number): string =>
		[...(approved.get(id)?.items ?? new Map<number, number>()).entries()]
			.sort((left, right) => left[0] - right[0])
			.map(([accountancyId, amount]) => `${accountancyId}:${amount}`)
			.join("|")

	const first = signature(studentGradeIds[0] as number)
	return studentGradeIds.every((id) => signature(id) === first)
}

/**
 * `StudentCapabilityService::getAccountIdNotShow` — `array_diff(union, intersection)`, i.e. the
 * accounts **some but not all** of the selection hold. Those are hidden from the shared form, so
 * what remains on screen is the intersection plus the accounts none of them hold.
 *
 * Anything hidden here must be replicated forward by `@massUpdate`, or a santri's private
 * accounts are silently deleted by an edit that never showed them.
 */
export const hiddenAccountancyIds = (studentGradeIds: number[], approved: Approved): Set<number> => {
	const counts = new Map<number, number>()
	for (const id of studentGradeIds) {
		for (const accountancyId of approved.get(id)?.items.keys() ?? []) {
			counts.set(accountancyId, (counts.get(accountancyId) ?? 0) + 1)
		}
	}
	return new Set([...counts.keys()].filter((accountancyId) => counts.get(accountancyId) !== studentGradeIds.length))
}

/**
 * `StudentCapabilityService::getUpdateCapabilityAmount`. Only an account every selected santri
 * holds is considered, and only a unanimous figure is returned; **0** is legacy's sentinel for
 * "no agreement, fall back to the master cost".
 *
 * Zero is also a legal agreed amount, so a selection that unanimously agreed on Rp 0 is
 * indistinguishable from no agreement and falls back to the master cost. That collision is
 * legacy's own and is reproduced rather than papered over — changing it would change which
 * figure the slider opens on for 64 live line items.
 */
export const commonAmount = (accountancyId: number, studentGradeIds: number[], approved: Approved): number => {
	const amounts = studentGradeIds.map((id) => approved.get(id)?.items.get(accountancyId))
	if (amounts.some((amount) => amount === undefined)) return 0
	return new Set(amounts).size === 1 ? ((amounts[0] as number) ?? 0) : 0
}

/**
 * `@massCreateAccountList` row. Every row starts ticked (`AccountancyService::checkboxBulkAction`
 * renders `checked` from `applied`, which the query already filters on). The step is legacy's
 * `$amount > 5000 ? 5000 : $amount`, unique to this page — the other two modals hardcode 5000.
 * The ceiling is `studentCosts()->first()->amount`, the same figure as `account_cost` for a
 * `maximum` term, which always has exactly one cost.
 */
export const toMassCreateRow = (term: CostTermRow): CapabilityItemRow => {
	const first = term.amounts.length > 0 ? toAmount(term.amounts[0]) : null
	return {
		...toItemRow(term),
		amount: accountCost(term),
		maxAmount: first,
		step: first !== null && first > 5000 ? 5000 : (first ?? 0),
		selected: true,
	}
}

/**
 * `@massEditAccountList`. Shown = everything except `getAccountIdNotShow()` (the intersection
 * plus the accounts nobody holds). The amount is `getUpdateCapabilityAmount`, falling back to
 * the master cost; the checkbox follows **the first selected santri only** — legacy's
 * `$student_capabilities->first()`.
 */
export const toMassEditRows = (terms: CostTermRow[], studentGradeIds: number[], approved: Approved): CapabilityItemRow[] => {
	const hidden = hiddenAccountancyIds(studentGradeIds, approved)
	const firstStudent = approved.get(studentGradeIds[0] as number)
	return terms
		.filter((term) => !hidden.has(Number(term.accountancyId)))
		.map((term) => {
			const master = accountCost(term)
			const agreed = commonAmount(Number(term.accountancyId), studentGradeIds, approved)
			return {
				...toItemRow(term),
				amount: agreed === 0 ? master : agreed,
				maxAmount: master,
				step: 5000,
				selected: firstStudent?.items.has(Number(term.accountancyId)) === true,
			}
		})
}

/**
 * The line items to attach. Legacy iterates the year+grade's applied cost terms and looks each
 * accountancy up in the posted `account_id[]` with `array_search`, so the result is **term order**,
 * one row per term, and only accounts that have an applied term — anything else the client names
 * is silently dropped. `array_search` returns the **first** match, so a duplicated id keeps its
 * first amount. Walking the terms (not the payload) also keeps pivot order identical to the N=1
 * path through `@store`.
 *
 * `amount` stays null for a value with no digits, which the caller rejects with legacy's
 * `ArrayCannotContainNullRule` message.
 */
export const pickItems = (
	terms: CostTermRow[],
	posted: { accountancyId: number; amount: string }[],
): { accountancyId: number; amount: number | null }[] => {
	const byAccount = new Map<number, string>()
	for (const item of posted) if (!byAccount.has(item.accountancyId)) byAccount.set(item.accountancyId, item.amount)
	const seen = new Set<number>()
	return terms.flatMap((term) => {
		const accountancyId = Number(term.accountancyId)
		const raw = byAccount.get(accountancyId)
		if (raw === undefined || seen.has(accountancyId)) return []
		seen.add(accountancyId)
		return [{ accountancyId, amount: unmaskAmount(raw) }]
	})
}
