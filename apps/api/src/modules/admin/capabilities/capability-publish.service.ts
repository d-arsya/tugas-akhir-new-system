import { Injectable, Logger, NotFoundException, UnprocessableEntityException } from "@nestjs/common"
import { DataSource, type EntityManager } from "typeorm"
import type { CapabilityPublishResult } from "@roja/types"

import { toAmount } from "@shared/billing/invoice-calculator"
import type { CapabilityWriteInput } from "@admin/capabilities/dto/capability-publish.dto"
import {
	applyCarryOver,
	buildGeneratorItems,
	insertCapability,
	insertGeneratedInvoices,
	nextGeneration,
	replaceCapabilityItems,
	resolveAgreedItems,
	type AcademicYearSqlRow,
	type CapabilityItemSqlRow,
	type CapabilitySqlRow,
	type PredecessorSqlRow,
	type StudentGradeSqlRow,
} from "@admin/capabilities/capability-write"
import { generateInvoices, InvoiceGenerationError, type GeneratorItem } from "@admin/capabilities/invoice-generator"
import * as sql from "@admin/capabilities/publish-sql"
import { CapabilityDocumentQueue } from "@admin/capabilities/capability-document.queue"

// Legacy `StudentCapabilityController` — the single-santri write half: `@store` (567-628),
// `@change` (631-679), `@update` (839-880) and `@publishInvoice` (681-836).
//
// Legacy has **no transaction anywhere in this controller**. `publishInvoice` invalidates the
// santri's entire previous generation, inserts the new one and re-points the payment rows in three
// unguarded phases, and a throw in the middle — a missing cost term divides by zero on the very
// first account — leaves the santri with every bill invalidated and nothing replacing them. All
// four writes run in one transaction here.
//
// Indonesian messages are reproduced verbatim; only the status changes, from 500 to 422, because
// these are business-rule rejections and not server faults.

const CREATE_SUCCESS = "Kesanggupan baru berhasil dibuat"
const UPDATE_SUCCESS = "Data berhasil diupdate."
const PUBLISH_SUCCESS = "Kesanggupan telah disepakati. Dan tagihan berhasil dibuat."
const NO_ITEMS = "Silakan pilih minimal 1 kesanggupan."
const NOT_FOUND = "Data tidak ditemukan."
const NO_AGREED = "Terdapat kesanggupan yang belum disepakati."
const NO_INVOICES = "Tidak ada tagihan yang dibuat. Master biaya untuk kelas ini belum ditentukan."

@Injectable()
export class CapabilityPublishService {
	private readonly logger = new Logger(CapabilityPublishService.name)

	constructor(
		private readonly dataSource: DataSource,
		private readonly documentQueue: CapabilityDocumentQueue,
	) {}

	/**
	 * `@store` — a new, **unagreed** capability for one santri. No invoices are written.
	 *
	 * The N=1 / N≥2 flip is deliberate and kept: `mass-create.blade.php:68-77` posts one santri
	 * here and two or more to `massStore()`, which approves and publishes in the same request.
	 */
	async create(studentGradeId: number, dto: CapabilityWriteInput): Promise<CapabilityPublishResult> {
		return this.dataSource.transaction(async (manager) => {
			const studentGrade = await this.loadStudentGrade(manager, studentGradeId)
			const academicYear = await this.loadAcademicYear(manager, studentGrade)
			const items = await resolveAgreedItems(manager, Number(academicYear.id), studentGrade.grade, dto)

			// `StudentCapability::where(['status' => 'approve', …])->first()` — superseded, never edited
			const [previous] = await manager.query<{ id: string }[]>(sql.SELECT_APPROVED_CAPABILITY_SQL, [studentGradeId])
			if (previous) await manager.query(sql.SUPERSEDE_CAPABILITY_SQL, [Number(previous.id)])

			const capabilityId = await insertCapability(manager, {
				studentId: studentGrade.studentId === null ? null : Number(studentGrade.studentId),
				studentGradeId,
				note: dto.note ?? null,
				status: "disapprove",
				approveDate: null,
			})
			await replaceCapabilityItems(manager, capabilityId, items)

			return {
				message: CREATE_SUCCESS,
				invoicesCreated: 0,
				redirect: `/student-capabilities/${capabilityId}/students/${studentGradeId}`,
			}
		})
	}

	/**
	 * `@change` — supersede the agreed capability with a fresh unagreed copy of its amounts.
	 *
	 * Legacy calls `->update()` straight on the `->first()` result with no null check, so a santri
	 * who has no agreed capability 500s. Guarded here with legacy's own wording for that state.
	 */
	async change(studentGradeId: number): Promise<CapabilityPublishResult> {
		return this.dataSource.transaction(async (manager) => {
			const studentGrade = await this.loadStudentGrade(manager, studentGradeId)
			const [previous] = await manager.query<{ id: string }[]>(sql.SELECT_APPROVED_CAPABILITY_SQL, [studentGradeId])
			if (!previous) throw new UnprocessableEntityException(NO_AGREED)
			const previousId = Number(previous.id)

			const academicYear = await this.loadAcademicYear(manager, studentGrade)
			const applied = await manager.query<{ accountancyId: string }[]>(sql.SELECT_APPLIED_ACCOUNTANCIES_SQL, [
				Number(academicYear.id),
				studentGrade.grade,
			])
			const held = await manager.query<{ accountancyId: string | null; amount: string | null }[]>(
				sql.SELECT_CAPABILITY_AMOUNTS_SQL,
				[previousId],
			)
			// `$prev->getAccountCost($id) ?: 0` — PHP falsiness, so null *and* 0 both write 0
			const heldAmounts = new Map(held.map((row) => [Number(row.accountancyId), toAmount(row.amount)]))

			const items = applied
				.map((row) => Number(row.accountancyId))
				.filter((accountancyId) => heldAmounts.has(accountancyId))
				.map((accountancyId) => ({ accountancyId, amount: heldAmounts.get(accountancyId) ?? 0 }))

			await manager.query(sql.SUPERSEDE_CAPABILITY_SQL, [previousId])
			const capabilityId = await insertCapability(manager, {
				studentId: studentGrade.studentId === null ? null : Number(studentGrade.studentId),
				studentGradeId,
				// legacy's `change()` creates the row without a note; the copy starts blank
				note: null,
				status: "disapprove",
				approveDate: null,
			})
			await replaceCapabilityItems(manager, capabilityId, items)

			return {
				message: CREATE_SUCCESS,
				invoicesCreated: 0,
				redirect: `/student-capabilities/${capabilityId}/students/${studentGradeId}`,
			}
		})
	}

	/**
	 * `@update` — the note, and the line items while the capability is still unagreed.
	 *
	 * Legacy decides whether to rewrite the items from `?status=disapprove`, a query string the
	 * page copies off the capability it is showing. The capability's own status is read here
	 * instead, so a crafted URL cannot detach the items of an agreed one.
	 */
	async update(capabilityId: number, studentGradeId: number, dto: CapabilityWriteInput): Promise<{ message: string }> {
		return this.dataSource.transaction(async (manager) => {
			const capability = await this.loadCapability(manager, capabilityId, studentGradeId)
			await manager.query(sql.UPDATE_CAPABILITY_NOTE_SQL, [capabilityId, dto.note ?? null])

			if (capability.status === "disapprove") {
				const studentGrade = await this.loadStudentGrade(manager, studentGradeId)
				const academicYear = await this.loadAcademicYear(manager, studentGrade)
				const items = await resolveAgreedItems(manager, Number(academicYear.id), studentGrade.grade, dto)
				await replaceCapabilityItems(manager, capabilityId, items)
			}

			return { message: UPDATE_SUCCESS }
		})
	}

	/** `@publishInvoice` — agree the capability and generate the santri's invoices. */
	async publish(capabilityId: number, studentGradeId: number): Promise<CapabilityPublishResult> {
		const result = await this.dataSource.transaction((manager) =>
			this.publishWithin(manager, capabilityId, studentGradeId),
		)

		// Past the commit, so the invoices are on record whatever happens next. A grade publish
		// queues ~98 renders; none of them may undo, delay or reject the write that produced them.
		this.queueDocument(capabilityId, studentGradeId)

		return {
			message: PUBLISH_SUCCESS,
			invoicesCreated: result.invoicesCreated,
			...(result.invoicesCreated === 0 ? { warning: NO_INVOICES } : {}),
		}
	}

	/**
	 * The publish itself, inside a transaction the caller owns.
	 *
	 * Exported for the mass path, which creates the capability and publishes it in the same
	 * request: the generation counter is read **after** that insert, so a mass publish counts its
	 * own capability exactly as legacy's `StudentCapability::where(...)->count()` did.
	 */
	async publishWithin(
		manager: EntityManager,
		capabilityId: number,
		studentGradeId: number,
	): Promise<{ invoicesCreated: number }> {
		const capability = await this.loadCapability(manager, capabilityId, studentGradeId)
		const studentGrade = await this.loadStudentGrade(manager, studentGradeId)

		const lines = await manager.query<CapabilityItemSqlRow[]>(sql.SELECT_CAPABILITY_ITEMS_SQL, [capabilityId])
		if (lines.length === 0) throw new UnprocessableEntityException(NO_ITEMS)

		const academicYear = await this.loadAcademicYear(manager, studentGrade)
		const items = await buildGeneratorItems(manager, Number(academicYear.id), studentGrade.grade, lines)
		const generated = this.schedule(items, academicYear)

		// seg4, inside the transaction and after any capability insert the caller made
		const generation = await nextGeneration(manager, studentGradeId)

		await manager.query(sql.INVALIDATE_INVOICES_SQL, [studentGradeId])
		const studentId =
			studentGrade.studentId !== null
				? Number(studentGrade.studentId)
				: capability.studentId === null
					? null
					: Number(capability.studentId)
		const inserted = await insertGeneratedInvoices(manager, { studentId, studentGradeId, generation }, generated)

		if (inserted.length > 0) {
			const predecessors = await manager.query<PredecessorSqlRow[]>(sql.SELECT_PREDECESSORS_SQL, [
				studentGradeId,
				inserted.map((row) => row.id),
				generation,
			])
			const byKey = new Map(predecessors.map((row) => [`${Number(row.accountancyId)}|${row.index}`, row]))
			for (const invoice of inserted) {
				const predecessor = byKey.get(`${invoice.accountancyId}|${invoice.index}`)
				if (predecessor) await applyCarryOver(manager, invoice, predecessor)
			}
		}

		// Only the capability being published — never `latest()->first()`, which agreed whichever
		// row happened to be newest and could approve a draft nobody had agreed to.
		await manager.query(sql.APPROVE_CAPABILITY_SQL, [capabilityId, studentGradeId])

		return { invoicesCreated: inserted.length }
	}

	// ─── helpers ────────────────────────────────────────────────────────────

	private async loadCapability(
		manager: EntityManager,
		capabilityId: number,
		studentGradeId: number,
	): Promise<CapabilitySqlRow> {
		const [capability] = await manager.query<CapabilitySqlRow[]>(sql.SELECT_CAPABILITY_FOR_PUBLISH_SQL, [capabilityId])
		if (!capability) throw new NotFoundException(NOT_FOUND)
		// Legacy binds `{capability}` and `{studentGrade}` independently and never checks they
		// belong together, so a crafted URL publishes capability A against santri B — and
		// `publishInvoice` then writes B's id onto A, moving it for good.
		if (Number(capability.studentGradeId) !== studentGradeId) throw new NotFoundException(NOT_FOUND)
		return capability
	}

	private async loadStudentGrade(manager: EntityManager, studentGradeId: number): Promise<StudentGradeSqlRow> {
		const [studentGrade] = await manager.query<StudentGradeSqlRow[]>(sql.SELECT_STUDENT_GRADE_SQL, [studentGradeId])
		if (!studentGrade) throw new NotFoundException(NOT_FOUND)
		return studentGrade
	}

	/** `getAcademicYearId($student_grade->current_academic_year)`, with the missing-row guard legacy lacks. */
	private async loadAcademicYear(manager: EntityManager, studentGrade: StudentGradeSqlRow): Promise<AcademicYearSqlRow> {
		const [academicYear] = await manager.query<AcademicYearSqlRow[]>(sql.SELECT_ACADEMIC_YEAR_BY_NAME_SQL, [
			studentGrade.currentAcademicYear,
		])
		if (!academicYear) {
			throw new UnprocessableEntityException(
				`Tahun ajaran "${studentGrade.currentAcademicYear ?? "-"}" tidak ditemukan.`,
			)
		}
		return academicYear
	}

	/** `generateInvoices`, with its faults turned into 422s rather than a 500 or a silent no-op. */
	private schedule(items: GeneratorItem[], academicYear: AcademicYearSqlRow): ReturnType<typeof generateInvoices> {
		try {
			return generateInvoices(items, {
				costDateStart: academicYear.costDateStart,
				costDateEnd: academicYear.costDateEnd,
			})
		} catch (error) {
			if (error instanceof InvoiceGenerationError) throw new UnprocessableEntityException(error.message)
			throw error
		}
	}

	/** Un-awaited and unable to reject — the shape `payment-admin.service.ts:154-160` uses. */
	private queueDocument(capabilityId: number, studentGradeId: number): void {
		try {
			this.documentQueue.generateInBackground(capabilityId, studentGradeId)
		} catch (error) {
			this.logger.warn(`[Kesanggupan] dokumen ${capabilityId} gagal diantrikan: ${String(error)}`)
		}
	}
}
