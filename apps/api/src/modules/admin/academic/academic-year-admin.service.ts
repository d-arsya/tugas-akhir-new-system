import { Injectable, NotFoundException } from "@nestjs/common"
import { DataSource, type QueryRunner } from "typeorm"

import { throwFieldErrors } from "@core/errors/field-errors"
import { fromDmy, indoDateShort, toDmyDash, toDmySlash } from "@admin/common/date-format"
import {
	ACADEMIC_YEAR_DETAIL_SQL,
	ACADEMIC_YEAR_EXISTS_SQL,
	ACADEMIC_YEAR_LEVELS_SQL,
	ACADEMIC_YEAR_LIST_SQL,
	ACADEMIC_YEAR_QUOTA_ROWS_SQL,
	DEMOTE_CURRENT_YEARS_SQL,
	FIND_QUOTA_PIVOT_SQL,
	INSERT_ACADEMIC_YEAR_SQL,
	INSERT_QUOTA_PIVOT_SQL,
	UPDATE_ACADEMIC_YEAR_SQL,
	UPDATE_QUOTA_PIVOT_SQL,
} from "@admin/academic/academic-year-sql"
import type {
	AcademicYearCreateInput,
	AcademicYearUpdateInput,
} from "@admin/academic/dto/academic-year-admin.dto"

/** Where a row's destroy icon points — legacy picks this per row, server-side, at list-render time. */
export type AcademicYearDeleteTarget =
	| "delete"
	| "delegate-registrant"
	| "delegate-student"
	| "delegate-alumni"

export type AcademicYearRow = {
	id: number
	year: string | null
	/** `getCostPeriodAttribute()` → "01 Jul 2026 - 30 Jun 2027", or "-" when there is no start date. */
	period: string
	statusPsb: "open" | "closed" | "none"
	statusAkademik: "berjalan" | "berakhir" | "empty" | "none"
	deleteTarget: AcademicYearDeleteTarget
	actionable: boolean
	isArchive: boolean
}

export type AcademicYearQuotaRow = {
	levelId: number
	levelName: string | null
	quota: number | null
	psb: number
	tmq: number
}

export type AcademicYearDetail = {
	id: number
	year: string | null
	startYear: number | null
	endYear: number | null
	activeKbm: string | null
	note: string | null
	serialNumber: string | null
	type: "reguler" | "indent" | null
	status: boolean
	isCurrent: boolean
	costDateStart: string | null
	costDateEnd: string | null
}

type ListSqlRow = {
	id: string
	year: string | null
	costDateStart: string | null
	costDateEnd: string | null
	statusPsb: AcademicYearRow["statusPsb"]
	statusAkademik: AcademicYearRow["statusAkademik"]
	deleteTarget: AcademicYearDeleteTarget
	isArchive: boolean
}

type DetailSqlRow = {
	id: string
	year: string | null
	activeKbm: string | null
	note: string | null
	serialNumber: string | null
	type: "reguler" | "indent" | null
	status: boolean
	isCurrent: boolean
	costDateStart: string | null
	costDateEnd: string | null
}

type QuotaSqlRow = { levelId: string; levelName: string | null; quota: number; psb: number; tmq: number }

const CREATE_SUCCESS = "Data berhasil disimpan ke dalam basis data."
const UPDATE_SUCCESS = "Data berhasil diupdate."

/** `intval(Str::limit($year, 4))` / `intval(Str::substr($year, 5, 8))` in the edit blade. */
const yearHalf = (year: string | null, from: number, to: number): number | null => {
	if (year === null) return null
	const parsed = Number.parseInt(year.slice(from, to), 10)
	return Number.isNaN(parsed) ? 0 : parsed
}

/** `quota.*` is validated as a string and lands in an integer column, as it does in legacy. */
const quotaValue = (quota: string): number => {
	const parsed = Number.parseInt(quota, 10)
	return Number.isNaN(parsed) ? 0 : parsed
}

/**
 * Port of the legacy `AcademicYearController` list/create/edit half
 * (index, list, levelList, editLevelList, edit, store, update).
 *
 * The delete and delegation half lives in `AcademicYearDeleteService`, deliberately split
 * so two workstreams never share a file.
 */
@Injectable()
export class AcademicYearAdminService {
	constructor(private readonly dataSource: DataSource) {}

	/** Legacy `@list`. Sorted by the first digit run in `year`, descending; "Archive" sorts last. */
	async findAll(): Promise<AcademicYearRow[]> {
		const rows = await this.dataSource.query<ListSqlRow[]>(ACADEMIC_YEAR_LIST_SQL)

		return rows.map((row) => ({
			id: Number(row.id),
			year: row.year,
			// `$ay->cost_date_start ? $ay->getCostPeriodAttribute() : '-'`
			period:
				row.costDateStart === null
					? "-"
					: `${indoDateShort(row.costDateStart)} - ${indoDateShort(row.costDateEnd)}`,
			statusPsb: row.statusPsb,
			statusAkademik: row.statusAkademik,
			deleteTarget: row.deleteTarget,
			// Legacy returns "" for the Archive row, i.e. no edit and no destroy icon at all
			actionable: !row.isArchive,
			isArchive: row.isArchive,
		}))
	}

	/** Legacy `@levelList` — the create page's quota table: every shown level, no year context. */
	async findQuotaRows(): Promise<AcademicYearQuotaRow[]> {
		const rows = await this.dataSource.query<{ levelId: string; levelName: string | null }[]>(
			ACADEMIC_YEAR_LEVELS_SQL,
		)

		// Legacy emits `["", 0, 0, ""]` for Kuota/PSB/TMQ/Sisa — nothing is known before the year exists
		return rows.map((row) => ({
			levelId: Number(row.levelId),
			levelName: row.levelName,
			quota: null,
			psb: 0,
			tmq: 0,
		}))
	}

	/** Legacy `@editLevelList` — quota, PSB and TMQ counts for one academic year. */
	async findQuotaRowsFor(id: number): Promise<AcademicYearQuotaRow[]> {
		await this.requireYear(id)
		const rows = await this.dataSource.query<QuotaSqlRow[]>(ACADEMIC_YEAR_QUOTA_ROWS_SQL, [id])

		return rows.map((row) => ({
			levelId: Number(row.levelId),
			levelName: row.levelName,
			quota: Number(row.quota),
			psb: Number(row.psb),
			tmq: Number(row.tmq),
		}))
	}

	async findOne(id: number): Promise<AcademicYearDetail> {
		const rows = await this.dataSource.query<DetailSqlRow[]>(ACADEMIC_YEAR_DETAIL_SQL, [id])
		const row = rows[0]
		if (row === undefined) throw new NotFoundException("Tahun ajaran tidak ditemukan.")

		return {
			id: Number(row.id),
			year: row.year,
			startYear: yearHalf(row.year, 0, 4),
			endYear: yearHalf(row.year, 5, 13),
			// `getActiveKbmAttribute()` renders d-m-Y; the cost dates render d/m/Y
			activeKbm: toDmyDash(row.activeKbm),
			note: row.note,
			serialNumber: row.serialNumber,
			type: row.type,
			status: row.status,
			isCurrent: row.isCurrent,
			costDateStart: toDmySlash(row.costDateStart),
			costDateEnd: toDmySlash(row.costDateEnd),
		}
	}

	async create(dto: AcademicYearCreateInput): Promise<{ message: string }> {
		// `"{$request->start_year}/" . ($request->start_year + 1)` — PHP's numeric string addition
		const year = `${dto.startYear}/${Number(dto.startYear) + 1}`

		const clash = await this.dataSource.query<unknown[]>(ACADEMIC_YEAR_EXISTS_SQL, [year])
		// `AcademicYearExistRule` — ":Attribute sudah ada sebelumnya." with attribute "tahun ajaran"
		if (clash.length > 0) throwFieldErrors({ startYear: ["Tahun ajaran sudah ada sebelumnya."] })

		await this.inTransaction(async (runner) => {
			// B-11: legacy demotes only the first current year; the port demotes every other one
			if (dto.isCurrent) await runner.query(DEMOTE_CURRENT_YEARS_SQL, [0])

			const inserted: { id: string }[] = await runner.query(INSERT_ACADEMIC_YEAR_SQL, [
				year,
				fromDmy(dto.activeKbm),
				dto.note ?? null,
				dto.serialNumber,
				dto.type ?? null,
				dto.status,
				dto.isCurrent,
				fromDmy(dto.costDateStart),
				fromDmy(dto.costDateEnd),
			])
			const id = Number(inserted[0]?.id)

			// `foreach (Arr::wrap($request->quota) as $key => $quota) $ay->levels()->attach(...)`
			for (const quota of dto.quotas) {
				await runner.query(INSERT_QUOTA_PIVOT_SQL, [quota.levelId, id, quotaValue(quota.quota)])
			}
		})

		return { message: CREATE_SUCCESS }
	}

	async update(id: number, dto: AcademicYearUpdateInput): Promise<{ message: string }> {
		await this.requireYear(id)

		await this.inTransaction(async (runner) => {
			// Legacy: `where('is_current',1)->where('id','!=',$ay->id)->first()` — B-11 again
			if (dto.isCurrent) await runner.query(DEMOTE_CURRENT_YEARS_SQL, [id])

			// `year` is absent from the payload: the edit form disables both year inputs, so the
			// `sometimes` rule skips `start_year` and the column is immutable through this route
			await runner.query(UPDATE_ACADEMIC_YEAR_SQL, [
				id,
				fromDmy(dto.activeKbm),
				dto.note ?? null,
				dto.serialNumber,
				dto.type ?? null,
				dto.status,
				dto.isCurrent,
				fromDmy(dto.costDateStart),
				fromDmy(dto.costDateEnd),
			])

			// B-12: upsert instead of `levels()->sync()`, so a hidden level keeps its quota row
			for (const quota of dto.quotas) {
				const value = quotaValue(quota.quota)
				const existing: unknown[] = await runner.query(FIND_QUOTA_PIVOT_SQL, [id, quota.levelId])
				if (existing.length > 0) await runner.query(UPDATE_QUOTA_PIVOT_SQL, [id, quota.levelId, value])
				else await runner.query(INSERT_QUOTA_PIVOT_SQL, [quota.levelId, id, value])
			}
		})

		return { message: UPDATE_SUCCESS }
	}

	/** Route-model binding: legacy 404s before the handler runs. */
	private async requireYear(id: number): Promise<void> {
		const rows = await this.dataSource.query<unknown[]>(
			"SELECT 1 FROM tbr_academic_years WHERE id = $1 LIMIT 1",
			[id],
		)
		if (rows.length === 0) throw new NotFoundException("Tahun ajaran tidak ditemukan.")
	}

	/** Legacy runs store/update outside any transaction (B-8/B-9); the port wraps each one. */
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
