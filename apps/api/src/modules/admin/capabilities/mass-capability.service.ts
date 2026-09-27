import { Injectable, NotFoundException, UnprocessableEntityException } from "@nestjs/common"
import { DataSource } from "typeorm"
import type { CapabilityItemRow, CapabilityMassPage, CapabilityMassResult, CapabilitySelectionResult } from "@roja/types"

import { toAmount } from "@shared/billing/invoice-calculator"
import type { CapabilityMassWriteInput, CapabilitySelectionInput } from "@admin/capabilities/dto/capability-mass.dto"
import {
	pickItems,
	sameAccounts,
	toMassCreateRow,
	toMassEditRows,
	type Approved,
	type CostTermRow,
} from "@admin/capabilities/mass-format"
import { CapabilityDocumentQueue } from "@admin/capabilities/capability-document.queue"
import { CapabilityPublishService } from "@admin/capabilities/capability-publish.service"
import { SYNC_CAPABILITY_ITEM_SEQUENCE_SQL, SYNC_CAPABILITY_SEQUENCE_SQL } from "@admin/capabilities/publish-sql"
import * as sql from "@admin/capabilities/mass-sql"
import { StudentCapability } from "@santri/entities/student-capability.entity"

// Legacy `StudentCapabilityController` — the bulk half: `@storeToSession` (141-190),
// `@massCreate` + `@massCreateAccountList` (192-242), `@massStore` (244-300),
// `@massEdit` + `@massEditAccountList` (302-393) and `@massUpdate` (395-465).
//
// Every Indonesian message is legacy's, verbatim. What changed is where the work happens:
// legacy had no transaction anywhere in this controller, so a batch that failed on santri 12
// left santri 1-11 written and approved — and because the session key is only cleared on
// success, the retry wrote them a second time. One transaction per batch closes both.

const UNAGREED = "Terdapat kesanggupan yang belum disepakati."
const ALREADY_HAS = "Terdapat santri yang sudah punya kesanggupan."
const EMPTY_ITEMS = "Silakan pilih minimal 1 kesanggupan."
const MISSING_AMOUNT = "Semua kesanggupan wajib untuk dipilih."
const STORE_SUCCESS = "Data berhasil disimpan ke dalam basis data."
const NOT_FOUND = "Kelas atau tahun ajaran tidak ditemukan."
const STALE_SELECTION = "Santri yang dipilih tidak sesuai dengan kelas dan tahun ajaran ini."

type ContextRow = { academicYearId: string; year: string | null; gradeId: string; label: string | null }
type SelectionRow = {
	studentGradeId: string
	studentId: string | null
	fullName: string | null
	currentAcademicYear: string | null
	grade: string | null
	nis: string | null
}
type ApprovedItemRow = { studentGradeId: string; capabilityId: string; accountancyId: string | null; amount: string | null }

@Injectable()
export class MassCapabilityService {
	/**
	 * The publish seam. `@massStore` and `@massUpdate` call `publishInvoice` inline for every
	 * santri, so the generator has to run **inside** this batch's transaction rather than opening
	 * one of its own — otherwise a failure halfway through leaves published invoices behind a
	 * rolled-back capability. `CapabilityPublishService.publishWithin` is exactly that entry point,
	 * and it reads the generation counter after this service's capability insert, so seg4 counts
	 * the new row.
	 *
	 * The PDF queue is injected directly (the publish service's `queueDocument` is private); renders
	 * start after the commit and never reject, so none of them can undo a committed batch.
	 */
	constructor(
		private readonly dataSource: DataSource,
		private readonly publishService: CapabilityPublishService,
		private readonly documentQueue: CapabilityDocumentQueue,
	) {}

	// ─── Shared loading ────────────────────────────────────────────────────────

	private async context(academicYearId: number, gradeId: number): Promise<ContextRow> {
		const [row] = await this.dataSource.query<ContextRow[]>(sql.SELECT_CONTEXT_SQL, [academicYearId, gradeId])
		if (!row) throw new NotFoundException(NOT_FOUND)
		return row
	}

	/**
	 * Re-reads the ticked santri and rejects any that is not this year's and grade's. Legacy's one
	 * global session key let a tab on grade 3 post its santri into a grade 5 write; the ids come
	 * from the client now, so this is all that stands between a crafted body and another grade.
	 */
	private async selection(context: ContextRow, studentGradeIds: number[]): Promise<SelectionRow[]> {
		const rows = await this.dataSource.query<SelectionRow[]>(sql.SELECT_SELECTION_SQL, [studentGradeIds])
		const belongs = rows.filter((row) => row.currentAcademicYear === context.year && row.grade === context.label)
		if (belongs.length !== studentGradeIds.length) throw new UnprocessableEntityException(STALE_SELECTION)
		return belongs
	}

	private costTerms(context: ContextRow): Promise<CostTermRow[]> {
		return this.dataSource.query<CostTermRow[]>(sql.SELECT_COST_TERMS_SQL, [context.academicYearId, context.label])
	}

	/** Each selected santri's approved capability and its line items. */
	private async approved(studentGradeIds: number[]): Promise<Approved> {
		const rows = await this.dataSource.query<ApprovedItemRow[]>(sql.SELECT_APPROVED_ITEMS_SQL, [studentGradeIds])
		const byStudent: Approved = new Map()
		for (const row of rows) {
			const key = Number(row.studentGradeId)
			const entry = byStudent.get(key) ?? { id: Number(row.capabilityId), items: new Map<number, number>() }
			// The LEFT JOIN yields one all-null item row for a capability with no line items (9 live)
			if (row.accountancyId !== null) entry.items.set(Number(row.accountancyId), toAmount(row.amount))
			byStudent.set(key, entry)
		}
		return byStudent
	}

	/**
	 * `@storeToSession`'s two rejections, in legacy's order (the first match wins): an unagreed
	 * capability blocks both actions, an existing one of any status blocks `create`.
	 *
	 * Legacy ran them once, when the selection was parked. The port runs them again on every
	 * write, because the selection now lives in a URL that can outlive the state it was checked
	 * against — a second tab could otherwise mass-create a second `approve` row for a santri.
	 */
	private async gate(studentGradeIds: number[], action: "create" | "update"): Promise<void> {
		const [state] = await this.dataSource.query<{ disapproveCount: number; anyCount: number }[]>(
			sql.SELECT_SELECTION_CAPABILITY_STATE_SQL,
			[studentGradeIds],
		)
		if ((state?.disapproveCount ?? 0) > 0) throw new UnprocessableEntityException(UNAGREED)
		if (action === "create" && (state?.anyCount ?? 0) > 0) throw new UnprocessableEntityException(ALREADY_HAS)
	}

	// ─── @storeToSession ───────────────────────────────────────────────────────

	/**
	 * Parks the tick list and answers where to go next. Legacy wrote the ids into
	 * `session('student_grade_id')`; the port puts them in the redirect's query string, the only
	 * place the two mass pages read them from.
	 */
	async storeSelection(
		academicYearId: number,
		gradeId: number,
		dto: CapabilitySelectionInput,
	): Promise<CapabilitySelectionResult> {
		const context = await this.context(academicYearId, gradeId)
		await this.selection(context, dto.studentGradeIds)
		await this.gate(dto.studentGradeIds, dto.action)

		const page = dto.action === "create" ? "mass-create" : "mass-edit"
		const students = dto.studentGradeIds.join(",")
		return {
			redirect: `/student-capabilities/academic-years/${context.academicYearId}/grades/${context.gradeId}/${page}?students=${students}`,
		}
	}

	// ─── The two page headers ──────────────────────────────────────────────────

	async findMassCreatePage(academicYearId: number, gradeId: number, studentGradeIds: number[]): Promise<CapabilityMassPage> {
		const context = await this.context(academicYearId, gradeId)
		// An empty selection is legacy's `redirect()->route('studentCapability.capability')`; the
		// page answers an empty list and the route sends the operator back.
		const students = studentGradeIds.length > 0 ? await this.selection(context, studentGradeIds) : []
		return this.toPage(context, students, false)
	}

	/** `@massEdit`. `specialCondition` is `!isStudentGradeHasSameAccount($ids)` — see `mass-format.ts`. */
	async findMassEditPage(academicYearId: number, gradeId: number, studentGradeIds: number[]): Promise<CapabilityMassPage> {
		const context = await this.context(academicYearId, gradeId)
		if (studentGradeIds.length === 0) return this.toPage(context, [], false)

		const students = await this.selection(context, studentGradeIds)
		const approved = await this.approved(studentGradeIds)
		return this.toPage(context, students, !sameAccounts(studentGradeIds, approved))
	}

	private toPage(context: ContextRow, students: SelectionRow[], specialCondition: boolean): CapabilityMassPage {
		return {
			academicYear: { id: Number(context.academicYearId), year: context.year },
			grade: { id: Number(context.gradeId), label: context.label === null ? null : Number(context.label) },
			students: students.map((row) => ({
				studentGradeId: Number(row.studentGradeId),
				nis: row.nis,
				fullName: row.fullName,
			})),
			specialCondition,
		}
	}

	// ─── The two account tables ────────────────────────────────────────────────

	async findMassCreateAccounts(academicYearId: number, gradeId: number): Promise<CapabilityItemRow[]> {
		const context = await this.context(academicYearId, gradeId)
		return (await this.costTerms(context)).map(toMassCreateRow)
	}

	async findMassEditAccounts(academicYearId: number, gradeId: number, studentGradeIds: number[]): Promise<CapabilityItemRow[]> {
		const context = await this.context(academicYearId, gradeId)
		if (studentGradeIds.length === 0) return []
		await this.selection(context, studentGradeIds)
		return toMassEditRows(await this.costTerms(context), studentGradeIds, await this.approved(studentGradeIds))
	}

	// ─── @massStore and @massUpdate ────────────────────────────────────────────

	massCreate(academicYearId: number, gradeId: number, dto: CapabilityMassWriteInput): Promise<CapabilityMassResult> {
		return this.write(academicYearId, gradeId, dto, "create")
	}

	massUpdate(academicYearId: number, gradeId: number, dto: CapabilityMassWriteInput): Promise<CapabilityMassResult> {
		return this.write(academicYearId, gradeId, dto, "update")
	}

	/**
	 * One transaction for the whole batch — legacy had none, so a failure on santri 12 left 1-11
	 * approved and published. Also fixed: `@massUpdate` validated nothing; its unguarded
	 * `->first()->update()` (`:408-412`) 500'd on a capability-less santri, who now gets a fresh
	 * capability and a `warning`; `array_search`-as-array-key (`:274`, `:432`) is gone with
	 * `position[]`; the selection is re-validated and re-gated before any write.
	 *
	 * Kept as legacy: the rows are created already `approve` and published in the same request, and
	 * the republish silently invalidates the previous generation, paid invoices included.
	 */
	private async write(
		academicYearId: number,
		gradeId: number,
		dto: CapabilityMassWriteInput,
		mode: "create" | "update",
	): Promise<CapabilityMassResult> {
		const context = await this.context(academicYearId, gradeId)
		const students = await this.selection(context, dto.studentGradeIds)
		const terms = await this.costTerms(context)

		const posted = pickItems(terms, dto.items)
		// `ArrayCannotContainNullRule` first, then `publishInvoice`'s zero-item guard — legacy's
		// order, and the first match is the message the operator sees.
		if (posted.some((item) => item.amount === null)) throw new UnprocessableEntityException(MISSING_AMOUNT)
		if (posted.length === 0) throw new UnprocessableEntityException(EMPTY_ITEMS)
		await this.gate(dto.studentGradeIds, mode)
		const items = posted as { accountancyId: number; amount: number }[]

		const approved: Approved = mode === "update" ? await this.approved(dto.studentGradeIds) : new Map()
		const shown = dto.shownAccountancyIds ?? []
		const published: { capabilityId: number; studentGradeId: number }[] = []
		let invoicesCreated = 0
		let missingPrevious = 0

		await this.dataSource.transaction(async (manager) => {
			await manager.query(sql.LOCK_CAPABILITIES_SQL, [dto.studentGradeIds])
			// A row inserted by hand with an explicit id leaves the sequence behind MAX(id) and the next
			// insert collides on the primary key — P2-B's guard, run once per batch.
			await manager.query(SYNC_CAPABILITY_SEQUENCE_SQL)
			await manager.query(SYNC_CAPABILITY_ITEM_SEQUENCE_SQL)

			for (const student of students) {
				const studentGradeId = Number(student.studentGradeId)
				const previous = approved.get(studentGradeId)

				if (mode === "update") {
					if (previous) await manager.update(StudentCapability, { id: previous.id }, { status: "changed" })
					else missingPrevious += 1
				}

				const created = await manager.save(
					manager.create(StudentCapability, {
						studentId: student.studentId === null ? null : Number(student.studentId),
						studentGradeId,
						approveDate: new Date(),
						note: dto.note ?? null,
						status: "approve",
					}),
				)
				const capabilityId = Number(created.id)

				await manager.query(sql.INSERT_CAPABILITY_ITEMS_SQL, [
					capabilityId,
					items.map((item) => item.accountancyId),
					items.map((item) => item.amount),
				])

				// `massUpdate:436-446`: what the shared form did not show is carried forward, not dropped
				if (mode === "update" && previous) {
					await manager.query(sql.REPLICATE_HIDDEN_ITEMS_SQL, [capabilityId, previous.id, shown])
				}

				const result = await this.publishService.publishWithin(manager, capabilityId, studentGradeId)
				invoicesCreated += result.invoicesCreated
				published.push({ capabilityId, studentGradeId })
			}
		})

		// Past the commit and un-awaited: none of ~98 renders may undo a committed batch
		for (const entry of published) this.documentQueue.generateInBackground(entry.capabilityId, entry.studentGradeId)

		const warnings = [
			...(missingPrevious > 0 ? [`${missingPrevious} santri belum punya kesanggupan sebelumnya, kesanggupan baru dibuat untuk mereka.`] : []),
			...(invoicesCreated === 0 ? ["Tidak ada tagihan yang dibuat."] : []),
		]

		return {
			message: STORE_SUCCESS,
			redirect: `/student-capabilities/academic-years/${context.academicYearId}/grades/${context.gradeId}`,
			studentsProcessed: students.length,
			invoicesCreated,
			...(warnings.length > 0 ? { warning: warnings.join(" ") } : {}),
		}
	}
}
