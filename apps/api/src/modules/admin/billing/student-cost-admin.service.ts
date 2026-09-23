import { Injectable, NotFoundException } from "@nestjs/common"
import { DataSource, type QueryRunner } from "typeorm"

import { throwFieldErrors } from "@core/errors/field-errors"
import {
	encodeAmounts,
	encodeCostTerm,
	validateCostTermForm,
	type CostTermForm,
} from "@admin/billing/cost-term-codec"
import {
	appliedCostItemText,
	costPeriodText,
	gradeName,
	storedFrom,
	toAccountRow,
	toForm,
	toNumber,
	toTerm,
	type AccountSqlRow,
	type StudentCostAccountPage,
	type StudentCostGradeRow,
	type StudentCostTermDetail,
	type StudentCostYearRow,
	type TermSqlRow,
} from "@admin/billing/student-cost-format"
import * as sql from "@admin/billing/student-cost-sql"
import type {
	StudentCostAppliedInput,
	StudentCostTermWriteInput as Write,
} from "@admin/dto/student-cost-admin.dto"

export type {
	StudentCostAccountPage,
	StudentCostAccountRow,
	StudentCostGradeRow,
	StudentCostTermDetail,
	StudentCostYearRow,
} from "@admin/billing/student-cost-format"

type YearContext = { id: number; year: string | null; costDateStart: string | null; costDateEnd: string | null }
type GradeContext = { id: number; label: number | null }
type Message = { message: string }

const APPLY_SUCCESS = "Item biaya di kesanggupan berhasil disesuaikan dengan item biaya yang dipilih."
const WRITE_SUCCESS = "Data berhasil diupdate."

/**
 * Port of the legacy `StudentCostTermController` (Data Master ▸ Keuangan ▸ Biaya Santri).
 *
 * **`student_cost_terms.grade` stores the Grade `label`**, as text — see `student-cost-sql.ts`
 * for the five readers that agree and the four that do not. The encode/decode pair lives in
 * `cost-term-codec.ts`, kept pure and property-tested, because the stored representation is
 * lossy in both period branches.
 */
@Injectable()
export class StudentCostAdminService {
	constructor(private readonly dataSource: DataSource) {}

	/** Level 1 — `academicYearList()`: `exceptArchive()`, `ORDER BY year DESC`. */
	async findYears(): Promise<StudentCostYearRow[]> {
		type Row = Omit<YearContext, "id"> & { id: string; statusAkademik: StudentCostYearRow["statusAkademik"] }
		const rows = await this.dataSource.query<Row[]>(sql.STUDENT_COST_YEARS_SQL)

		return rows.map((row) => ({
			id: Number(row.id),
			year: row.year,
			period: costPeriodText(row.costDateStart, row.costDateEnd),
			statusAkademik: row.statusAkademik,
		}))
	}

	/** Level 2 — `gradeList()`: every grade, `ORDER BY label DESC`, with the applied counts. */
	async findGrades(academicYearId: number): Promise<StudentCostGradeRow[]> {
		await this.requireYear(academicYearId)

		const [rows, totals] = await Promise.all([
			this.dataSource.query<{ gradeId: string; label: string | null; appliedCount: number }[]>(
				sql.STUDENT_COST_GRADES_SQL,
				[academicYearId],
			),
			this.dataSource.query<{ total: number }[]>(sql.STUDENT_COST_ITEM_TOTAL_SQL),
		])
		const totalItems = totals[0]?.total ?? 0

		return rows.map((row) => ({
			gradeId: Number(row.gradeId),
			label: toNumber(row.label),
			name: gradeName(toNumber(row.label)),
			appliedCount: row.appliedCount,
			totalItems,
			appliedText: appliedCostItemText(row.appliedCount, totalItems),
		}))
	}

	/** Level 3 — `account()` + `accountList()`: child accountancies flagged `is_student_cost`. */
	async findAccounts(academicYearId: number, gradeId: number): Promise<StudentCostAccountPage> {
		const year = await this.requireYear(academicYearId)
		const grade = await this.requireGrade(gradeId)
		const label = String(grade.label ?? "")

		const [rows, totals] = await Promise.all([
			this.dataSource.query<AccountSqlRow[]>(sql.STUDENT_COST_ACCOUNTS_SQL, [academicYearId, label]),
			this.dataSource.query<{ total: number; applied: number }[]>(sql.STUDENT_COST_APPLIED_TOTALS_SQL, [
				academicYearId,
				label,
			]),
		])
		const amounts = await this.amountsByTerm(rows.map((row) => row.termId).filter((id) => id !== null))

		return {
			academicYear: {
				id: year.id,
				year: year.year,
				costPeriod: costPeriodText(year.costDateStart, year.costDateEnd),
				costDateStart: year.costDateStart,
			},
			grade: { id: grade.id, label: grade.label },
			// `isAccountancyAppliedAll()` — every term applied, and at least one term
			allApplied: (totals[0]?.total ?? 0) > 0 && totals[0]?.total === totals[0]?.applied,
			rows: rows.map((row) => toAccountRow(row, amounts, year.costDateStart)),
		}
	}

	/**
	 * `applied()`. Legacy's `whereIn('id', $request->id)` is **not** scoped to the year or grade,
	 * so any posted term id anywhere in the table was flipped; both halves are scoped here, in one
	 * transaction (plan decision). An empty selection answers the DTO's validation error rather
	 * than legacy's swallowed 500.
	 */
	async apply(academicYearId: number, gradeId: number, dto: StudentCostAppliedInput): Promise<Message> {
		await this.requireYear(academicYearId)
		const grade = await this.requireGrade(gradeId)
		const parameters = [academicYearId, String(grade.label ?? ""), dto.ids]

		await this.inTransaction(async (runner) => {
			await runner.query(sql.STUDENT_COST_APPLY_SQL, parameters)
			await runner.query(sql.STUDENT_COST_UNAPPLY_SQL, parameters)
		})

		return { message: APPLY_SUCCESS }
	}

	/** Level 4 — backs both `create()` and `edit()`; `term` is null when nothing is saved yet. */
	async findTerm(academicYearId: number, gradeId: number, accountancyId: number): Promise<StudentCostTermDetail> {
		const year = await this.requireYear(academicYearId)
		const grade = await this.requireGrade(gradeId)
		const accountancy = await this.requireAccountancy(accountancyId)
		const row = await this.findTermRow(academicYearId, accountancyId, String(grade.label ?? ""))
		const lock = [year.year, grade.label]
		const locked = await this.dataSource.query<unknown[]>(sql.STUDENT_COST_PERIOD_LOCK_SQL, lock)
		const amounts = row === null ? new Map<string, number[]>() : await this.amountsByTerm([row.id])

		return {
			accountancy,
			academicYear: { id: year.id, year: year.year, costDateStart: year.costDateStart },
			grade: { id: grade.id, label: grade.label },
			term: row === null ? null : toTerm(row, amounts.get(row.id) ?? [], year.costDateStart),
			periodLocked: locked.length > 0,
		}
	}

	async createTerm(academicYearId: number, gradeId: number, accountancyId: number, dto: Write): Promise<Message> {
		const year = await this.requireYear(academicYearId)
		const grade = await this.requireGrade(gradeId)
		await this.requireAccountancy(accountancyId)
		const label = String(grade.label ?? "")

		// Legacy 404s the create *page* when a term already exists but lets `store()` insert a
		// second one anyway, leaving an unordered `first()` to pick between them. Guarded here too.
		if ((await this.findTermRow(academicYearId, accountancyId, label)) !== null) {
			throw new NotFoundException("Biaya untuk akun ini sudah ada.")
		}

		const form = this.validated(dto, year.costDateStart)
		const stored = encodeCostTerm(form, { costDateStart: year.costDateStart ?? "", grade: label })

		const { type, period, monthOf, dayOf, timeSpan, reminder } = stored
		const args = [accountancyId, academicYearId, type, period, stored.grade, monthOf, dayOf, timeSpan, reminder]

		await this.inTransaction(async (runner) => {
			const inserted: { id: string }[] = await runner.query(sql.INSERT_STUDENT_COST_TERM_SQL, args)
			await this.writeAmounts(runner, Number(inserted[0]?.id), dto)
		})

		return { message: WRITE_SUCCESS }
	}

	async updateTerm(academicYearId: number, gradeId: number, accountancyId: number, dto: Write): Promise<Message> {
		const year = await this.requireYear(academicYearId)
		const grade = await this.requireGrade(gradeId)
		await this.requireAccountancy(accountancyId)
		const row = await this.findTermRow(academicYearId, accountancyId, String(grade.label ?? ""))
		if (row === null) throw new NotFoundException("Biaya santri tidak ditemukan.")

		const previous = storedFrom(row)
		const form = this.validated(dto, year.costDateStart)
		const context = { costDateStart: year.costDateStart ?? "", grade: previous.grade, previous }
		const stored = encodeCostTerm(form, context)
		const termId = Number(row.id)
		const once = stored.period === "once"

		await this.inTransaction(async (runner) => {
			// Legacy deletes the costs before updating the term, with no transaction to undo it
			await runner.query(sql.DELETE_STUDENT_COSTS_SQL, [termId])
			await this.writeAmounts(runner, termId, dto)
			const args = once
				? [termId, stored.type, stored.period, stored.timeSpan, stored.reminder]
				: [termId, stored.type, stored.period, stored.timeSpan, stored.monthOf, stored.dayOf, stored.reminder]
			const statement = once ? sql.UPDATE_STUDENT_COST_TERM_ONCE_SQL : sql.UPDATE_STUDENT_COST_TERM_MONTHLY_SQL
			await runner.query(statement, args)
		})

		return { message: WRITE_SUCCESS }
	}

	// ─── Internals ──────────────────────────────────────────────────────────

	/** `StudentCost::where('stuco_term_id', …)`, for every term on the page at once, `ORDER BY id`. */
	private async amountsByTerm(termIds: string[]): Promise<Map<string, number[]>> {
		const grouped = new Map<string, number[]>()
		if (termIds.length === 0) return grouped

		type Row = { termId: string; amount: string }
		const rows = await this.dataSource.query<Row[]>(sql.STUDENT_COST_AMOUNTS_SQL, [termIds])
		for (const row of rows) {
			const bucket = grouped.get(row.termId)
			if (bucket) bucket.push(Number(row.amount))
			else grouped.set(row.termId, [Number(row.amount)])
		}
		return grouped
	}

	private async findTermRow(yearId: number, accId: number, label: string): Promise<TermSqlRow | null> {
		const args = [yearId, accId, label]
		return (await this.dataSource.query<TermSqlRow[]>(sql.STUDENT_COST_TERM_SQL, args))[0] ?? null
	}

	/** `StudentCost::create()` — one row for "maximum", one per entry for "option". */
	private async writeAmounts(runner: QueryRunner, termId: number, dto: Write): Promise<void> {
		const masked = dto.type === "maximum" ? [dto.amount ?? ""] : (dto.amounts ?? [])
		for (const amount of encodeAmounts(masked)) {
			await runner.query(sql.INSERT_STUDENT_COST_SQL, [termId, amount])
		}
	}

	/** The codec's domain guards, which legacy never had — see `validateCostTermForm`. */
	private validated(dto: Write, costDateStart: string | null): CostTermForm {
		const form = toForm(dto)
		const errors = validateCostTermForm(form, costDateStart ?? "")
		if (errors !== null) throwFieldErrors(errors)
		return form
	}

	/** Route-model binding: legacy 404s before the handler runs. */
	private async requireOne<T>(statement: string, id: number, missing: string): Promise<T> {
		const row = (await this.dataSource.query<T[]>(statement, [id]))[0]
		if (!row) throw new NotFoundException(missing)
		return row
	}

	private async requireYear(id: number): Promise<YearContext> {
		type Row = Omit<YearContext, "id"> & { id: string }
		const row = await this.requireOne<Row>(sql.STUDENT_COST_YEAR_SQL, id, "Tahun ajaran tidak ditemukan.")
		return { ...row, id: Number(row.id) }
	}

	private async requireGrade(id: number): Promise<GradeContext> {
		type Row = { id: string; label: string | null }
		const row = await this.requireOne<Row>(sql.STUDENT_COST_GRADE_SQL, id, "Kelas tidak ditemukan.")
		return { id: Number(row.id), label: toNumber(row.label) }
	}

	private async requireAccountancy(id: number): Promise<{ id: number; name: string | null }> {
		type Row = { id: string; name: string | null }
		const row = await this.requireOne<Row>(sql.STUDENT_COST_ACCOUNTANCY_SQL, id, "Akun tidak ditemukan.")
		return { id: Number(row.id), name: row.name }
	}

	/** Legacy runs store/update/applied outside any transaction (B-8/B-9); the port wraps each one. */
	private async inTransaction(work: (runner: QueryRunner) => Promise<void>): Promise<void> {
		const runner = this.dataSource.createQueryRunner()
		await runner.connect()
		await runner.startTransaction()
		try {
			await work(runner)
			await runner.commitTransaction()
		} catch (error) {
			await runner.rollbackTransaction()
			throw error
		} finally {
			await runner.release()
		}
	}
}
