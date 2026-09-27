import { In, type EntityManager } from "typeorm"

import { toAmount } from "@shared/billing/invoice-calculator"
import { unmaskAmount } from "@admin/common/amount-mask"
import type { CapabilityWriteInput } from "@admin/capabilities/dto/capability-publish.dto"
import type { GeneratedInvoice, GeneratorItem } from "@admin/capabilities/invoice-generator"
import { invoiceUniqueId } from "@admin/capabilities/invoice-generator"
import * as sql from "@admin/capabilities/publish-sql"
import { StudentCostTerm } from "@admin/common/entities/student-cost-term.entity"
import { StudentCapability } from "@santri/entities/student-capability.entity"
import { StudentCostCapability } from "@santri/entities/student-cost-capability.entity"
import { StudentInvoice } from "@santri/entities/student-invoice.entity"
import { StudentInvoiceTransaction } from "@santri/entities/student-invoice-transaction.entity"

// The SQL-facing half of `store`, `change`, `update` and `publishInvoice`: the row shapes, the
// lookups that assemble a publish's inputs, and the statement-level write primitives. Split out of
// `publish-service.ts` to keep it under the 300-line limit. Every function takes the caller's
// `EntityManager`, so they always run inside the caller's transaction and never open one.

// ─── Row shapes ─────────────────────────────────────────────────────────────────

export type StudentGradeSqlRow = {
	id: string
	studentId: string | null
	/** `student_grades.grade` is `bigint`; selected as text because `student_cost_terms.grade` is `varchar`. */
	grade: string | null
	currentAcademicYear: string | null
	fullName: string | null
}

export type CapabilityItemSqlRow = {
	id: string
	accountancyId: string | null
	amount: string | null
	/** Null when the accountancy was hard-deleted; the billable predicate already excludes those. */
	name: string | null
}

export type PredecessorSqlRow = {
	id: string
	uniqueId: string
	accountancyId: string
	index: number
	amount: string | null
	status: StudentInvoice["status"]
	paymentMethod: StudentInvoice["paymentMethod"]
	overdue: boolean
}

/** What one insert of `tbr_student_capabilities` needs. */
export type CapabilityInsert = {
	studentId: number | null
	studentGradeId: number
	note: string | null
	status: "approve" | "disapprove"
	/** Legacy writes `approve_date` on create only in the mass path, which creates approved rows. */
	approveDate: "now" | null
}

// ─── Assembling a publish's inputs ──────────────────────────────────────────────

/**
 * The posted lines, narrowed to the accounts that actually have an applied term for this
 * (year, grade) — legacy iterates the cost terms, so an account without one is silently dropped
 * there too, and nothing outside the master fee list can be attached from a crafted body.
 */
export const resolveAgreedItems = async (
	manager: EntityManager,
	academicYearId: number,
	grade: string | null,
	dto: CapabilityWriteInput,
): Promise<{ accountancyId: number; amount: number }[]> => {
	if (dto.items.length === 0) return []
	const applied = await manager.query<{ accountancyId: string }[]>(sql.SELECT_APPLIED_ACCOUNTANCIES_SQL, [
		academicYearId,
		grade,
	])
	const posted = new Map(dto.items.map((item) => [item.accountancyId, unmaskAmount(item.amount)]))

	return applied
		.map((row) => Number(row.accountancyId))
		.filter((accountancyId) => posted.has(accountancyId))
		.map((accountancyId) => ({ accountancyId, amount: posted.get(accountancyId) ?? 0 }))
}

/** Pair each agreed line with the cost term that prices it, scoped to (year, accountancy, grade, applied). */
export const buildGeneratorItems = async (
	manager: EntityManager,
	academicYearId: number,
	grade: string | null,
	lines: readonly CapabilityItemSqlRow[],
): Promise<GeneratorItem[]> => {
	const accountancyIds = lines.map((line) => Number(line.accountancyId))
	const terms =
		grade === null
			? []
			: await manager.find(StudentCostTerm, {
					select: {
						id: true,
						accountancyId: true,
						period: true,
						timeSpan: true,
						monthOf: true,
						dayOf: true,
						reminder: true,
					},
					where: { academicYearId, accountancyId: In(accountancyIds), grade, applied: true },
					order: { accountancyId: "ASC", id: "ASC" },
				})
	const byAccountancy = new Map<number, StudentCostTerm>()
	for (const term of terms) {
		const id = Number(term.accountancyId)
		if (!byAccountancy.has(id)) byAccountancy.set(id, term)
	}

	return lines.map((line) => {
		const accountancyId = Number(line.accountancyId)
		const term = byAccountancy.get(accountancyId)
		return {
			accountancyId,
			accountancyName: line.name ?? "",
			amount: toAmount(line.amount),
			term: term
				? {
						period: term.period,
						timeSpan: toAmount(term.timeSpan),
						monthOf: term.monthOf === null ? null : toAmount(term.monthOf),
						dayOf: term.dayOf === null ? null : toAmount(term.dayOf),
						reminderDays: term.reminder === null ? null : toAmount(term.reminder),
					}
				: null,
		}
	})
}

// ─── Capability rows ────────────────────────────────────────────────────────────

/**
 * `StudentCapability::create()`.
 *
 * `student_id` is taken from the santri's own `student_grades` row rather than copied from a
 * sibling capability: Data Master's period lock joins `capabilities → students → student_grades`,
 * so a null there takes the santri out of the lock entirely.
 */
export const insertCapability = async (
	manager: EntityManager,
	values: CapabilityInsert,
): Promise<number> => {
	await manager.query(sql.SYNC_CAPABILITY_SEQUENCE_SQL)
	const saved = await manager.save(
		manager.create(StudentCapability, {
			studentId: values.studentId,
			studentGradeId: values.studentGradeId,
			note: values.note,
			status: values.status,
			approveDate: values.approveDate === "now" ? new Date() : null,
		}),
	)
	return Number(saved.id)
}

/**
 * `$student_capability->accountancies()->detach()` then one `attach()` per line.
 *
 * Legacy realigns three parallel request arrays with `array_search`, whose `false` return is then
 * used as an array index — `$amount[false]` is `$amount[0]`, so a non-contiguous tick list saves
 * the first row's rupiah onto every one of them. Pairs leave nothing to realign.
 */
export const replaceCapabilityItems = async (
	manager: EntityManager,
	capabilityId: number,
	items: readonly { accountancyId: number; amount: number }[],
): Promise<void> => {
	await manager.delete(StudentCostCapability, { studentCapId: capabilityId })
	if (items.length === 0) return
	await manager.query(sql.SYNC_CAPABILITY_ITEM_SEQUENCE_SQL)
	for (const { accountancyId, amount } of items) {
		await manager.save(manager.create(StudentCostCapability, { studentCapId: capabilityId, accountancyId, amount }))
	}
}

// ─── The generation counter ─────────────────────────────────────────────────────

/**
 * seg4 — the 4th segment of every `unique_id` this publish writes.
 *
 * Read **inside the transaction and after the capability row exists**, so a mass publish that
 * creates and agrees in one request counts its own row, and `GREATEST(count, max + 1)` so a second
 * publish of the *same* capability — which leaves the count untouched — cannot reuse a number.
 * See `MAX_INVOICE_GENERATION_SQL` for the damage that reuse caused.
 */
export const nextGeneration = async (manager: EntityManager, studentGradeId: number): Promise<number> => {
	const counted = await manager.countBy(StudentCapability, { studentGradeId })
	const [highest] = await manager.query<{ maxGeneration: number }[]>(sql.MAX_INVOICE_GENERATION_SQL, [
		studentGradeId,
	])
	return Math.max(counted, Number(highest?.maxGeneration ?? 0) + 1, 1)
}

// ─── The invoices ───────────────────────────────────────────────────────────────

export type InsertedInvoice = { id: number; uniqueId: string; accountancyId: number; index: number; amount: number }

/** Step 4: the generated rows, all `unpaid` and `validity_status = true`, as legacy writes them. */
export const insertGeneratedInvoices = async (
	manager: EntityManager,
	context: { studentId: number | null; studentGradeId: number; generation: number },
	rows: readonly GeneratedInvoice[],
): Promise<InsertedInvoice[]> => {
	if (rows.length === 0) return []
	await manager.query(sql.SYNC_INVOICE_SEQUENCE_SQL)

	const inserted: InsertedInvoice[] = []
	for (const row of rows) {
		const uniqueId = invoiceUniqueId(context.studentGradeId, row.accountancyId, row.index, context.generation)
		const result = await manager.insert(StudentInvoice, {
			uniqueId,
			studentId: context.studentId,
			studentGradeId: String(context.studentGradeId),
			name: row.name,
			amount: row.amount,
			status: "unpaid",
			dueDate: row.dueDate,
			reminder: row.reminder,
			accountancyId: String(row.accountancyId),
			validityStatus: true,
			createdAt: () => "now()",
			updatedAt: () => "now()",
		})
		inserted.push({
			id: Number(result.identifiers[0]?.id),
			uniqueId,
			accountancyId: row.accountancyId,
			index: row.index,
			amount: row.amount,
		})
	}
	return inserted
}

// ─── The carry-over ─────────────────────────────────────────────────────────────

/**
 * Steps 5 and 6, **verbatim from legacy 768-812**. Three branches, deliberately not simplified:
 *
 *   1. the predecessor is overdue and was not paid → the new bill inherits the **old** amount, so
 *      a santri cannot be re-priced out of arrears they already owe;
 *   2. the new amount is lower — a `paid` predecessor keeps its amount (money already taken is not
 *      retroactively reduced), and an `unpaid` `installment` predecessor whose re-pointed payments
 *      now cover the new, lower figure is closed as `paid`;
 *   3. the new amount is higher and the predecessor was `paid` → reopened as `unpaid` +
 *      `installment`, which is what puts the difference back on the santri's bill.
 *
 * The 194 live invoices whose stored amount differs from their capability's line item are all
 * generation ≥ 2 and all equal their predecessor's amount — this is the rule that put them there.
 *
 * The re-point happens **first**, because branch 2's sum is read from the links after they have
 * moved: legacy reads `$new_student_invoice->studentInvoiceTransations` at that point, not the
 * predecessor's.
 */
export const applyCarryOver = async (
	manager: EntityManager,
	invoice: InsertedInvoice,
	predecessor: PredecessorSqlRow,
): Promise<void> => {
	const predecessorId = Number(predecessor.id)
	await manager.update(StudentInvoiceTransaction, { studentInvoiceId: predecessorId }, { studentInvoiceId: invoice.id })

	const previousAmount = toAmount(predecessor.amount)
	let amount = invoice.amount
	// `$new->update(['status' => $prev->status, 'payment_method' => $prev->payment_method])`
	let status = predecessor.status
	let paymentMethod = predecessor.paymentMethod

	if (predecessor.overdue && predecessor.status !== "paid") {
		amount = previousAmount
	} else {
		if (amount < previousAmount) {
			if (predecessor.status === "paid") amount = previousAmount

			const sum = await manager
				.createQueryBuilder(StudentInvoiceTransaction, "link")
				.select("SUM(link.pay)", "paid")
				.where("link.studentInvoiceId = :invoiceId", { invoiceId: invoice.id })
				.getRawOne<{ paid: string | null }>()
			const paid = toAmount(sum?.paid)
			if (predecessor.status === "unpaid" && predecessor.paymentMethod === "installment" && paid >= amount) {
				status = "paid"
			}
		}

		if (amount > previousAmount && predecessor.status === "paid") {
			status = "unpaid"
			paymentMethod = "installment"
		}
	}

	await manager.update(StudentInvoice, { id: invoice.id }, { status, paymentMethod, amount })
}
