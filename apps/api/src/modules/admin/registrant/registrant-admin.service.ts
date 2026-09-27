import { Inject, Injectable, Logger, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { DataSource, Not, Repository } from "typeorm"

import type {
	AdminMessageResult,
	AdminRegistrantAcademicYearPage,
	AdminRegistrantAcademicYearRow,
	AdminRegistrantCreateOptions,
	AdminRegistrantDetail,
	AdminRegistrantExportStatus,
	AdminRegistrantListTab,
	AdminRegistrantOption,
	AdminRegistrantRow,
} from "@roja/types"

import { deleteDiseaseHistories } from "../../../shared/society/disease-history"
import { societyFileUrl } from "../../../shared/society/files"
import { renderSocietyPrintPage } from "../../../shared/society/print/society-print"
import { loadSocietyRecord } from "../../../shared/society/society-record"
import { Registrant } from "@psb/entities/registrant.entity"
import { AcademicYear } from "@shared/master/entities/academic-year.entity"
import { Level } from "@shared/master/entities/level.entity"

import { buildRegistrantWorkbook, registrantExportFileName } from "./registrant-export"
import { createdAtLabel, toRegistrantRow, toYearRows } from "./registrant-format"
import {
	DETAIL_SQL,
	LIST_SQL,
	YEAR_LIST_SQL,
	YEAR_PAGE_SQL,
	exportSql,
	type DetailRow,
	type ListRow,
	type YearListRow,
	type YearPageRow,
} from "./registrant-sql"

// Legacy `RegistrantController` — the read side, the export, the print page and `destroy`.
// Owned by workstream AK-P.

const DELETE_SUCCESS = "Data berhasil dihapus dari basis data."
const DELETE_FAILED = "Data gagal dihapus dari basis data."

const options = (levels: Array<Pick<Level, "id" | "name">>): AdminRegistrantOption[] =>
	levels.map((level) => ({ id: Number(level.id), name: level.name ?? "" }))

@Injectable()
export class RegistrantAdminService {
	private readonly logger = new Logger(RegistrantAdminService.name)

	constructor(
		@Inject(DataSource) private readonly dataSource: DataSource,
		@InjectRepository(Level) private readonly levels: Repository<Level>,
		@InjectRepository(AcademicYear) private readonly academicYears: Repository<AcademicYear>,
		@InjectRepository(Registrant) private readonly registrants: Repository<Registrant>,
	) {}

	/** `Level::where('status', 'show')->get()` */
	private async shownLevels(): Promise<AdminRegistrantOption[]> {
		return options(
			await this.levels.find({ select: { id: true, name: true }, where: { status: "show" }, order: { id: "ASC" } }),
		)
	}

	/** `Level::latest()->get()` — the edit widget's select */
	private async latestLevels(): Promise<AdminRegistrantOption[]> {
		return options(
			await this.levels.find({
				select: { id: true, name: true },
				order: { createdAt: { direction: "DESC", nulls: "LAST" }, id: "DESC" },
			}),
		)
	}

	/** `academicYearList` */
	async findAcademicYears(): Promise<AdminRegistrantAcademicYearRow[]> {
		return toYearRows((await this.dataSource.query(YEAR_LIST_SQL)) as YearListRow[])
	}

	/** `showAcademicYear` */
	async findAcademicYearPage(academicYearId: number): Promise<AdminRegistrantAcademicYearPage> {
		const rows = (await this.dataSource.query(YEAR_PAGE_SQL, [academicYearId])) as YearPageRow[]
		const row = rows[0]
		if (!row) throw new NotFoundException("Tahun ajaran tidak ditemukan")
		return {
			id: Number(row.id),
			year: row.year,
			total: Number(row.total),
			newCount: Number(row.new_count),
			approveCount: Number(row.approve_count),
			rejectCount: Number(row.reject_count),
			levels: await this.shownLevels(),
		}
	}

	/** `getNewRegistrantList` / `getApprovedRegistrantList` / `getRejectedRegistrantList` */
	async findRows(academicYearId: number, tab: AdminRegistrantListTab): Promise<AdminRegistrantRow[]> {
		await this.assertYear(academicYearId)
		const rows = (await this.dataSource.query(LIST_SQL[tab], [academicYearId])) as ListRow[]
		return rows.map(toRegistrantRow)
	}

	/** `download(AcademicYear, $approval_status = null)` */
	async exportRows(academicYearId: number, status: AdminRegistrantExportStatus): Promise<{ body: Buffer; fileName: string }> {
		const academicYear = await this.academicYears.findOne({ select: { id: true, year: true }, where: { id: academicYearId } })
		if (!academicYear) throw new NotFoundException("Tahun ajaran tidak ditemukan")
		const params: Array<number | string> = status === "approve" || status === "reject" ? [academicYearId, status] : [academicYearId]
		const rows = (await this.dataSource.query(exportSql(status), params)) as ListRow[]
		const settings = (await this.dataSource.query(
			`SELECT id, status, coalesce(custom_name, "default") AS label FROM tbr_setting_forms WHERE id IN (1, 19)`,
		)) as Array<{ id: string; status: boolean | null; label: string | null }>
		const column = (id: number): string | null => {
			const setting = settings.find((row) => Number(row.id) === id)
			return setting?.status === true ? (setting.label ?? "").toUpperCase() : null
		}
		const body = await buildRegistrantWorkbook({
			rows,
			status,
			year: academicYear.year,
			nameColumn: column(1),
			schoolColumn: column(19),
		})
		return { body, fileName: registrantExportFileName(academicYear.year) }
	}

	/** `PersonalController::personal` — the step-1 selects of the wizard. */
	async findCreateOptions(): Promise<AdminRegistrantCreateOptions> {
		const years = await this.academicYears.find({
			select: { id: true, year: true },
			where: { id: Not(1) },
			order: { year: "DESC" },
		})
		return {
			academicYears: years.map((row) => ({ id: Number(row.id), year: row.year })),
			levels: await this.shownLevels(),
		}
	}

	/** `edit(Registrant)` */
	async findDetail(registrantId: number): Promise<AdminRegistrantDetail> {
		const rows = (await this.dataSource.query(DETAIL_SQL, [registrantId])) as DetailRow[]
		const row = rows[0]
		const record = row ? await loadSocietyRecord(this.dataSource.manager, "registrant", registrantId) : null
		if (!row || !record) throw new NotFoundException("Pendaftar tidak ditemukan")
		return {
			id: Number(row.id),
			registrantId: row.registrant_id,
			fullname: row.fullname,
			academicYearId: row.academic_year_id === null ? null : Number(row.academic_year_id),
			academicYear: row.year,
			levelId: row.level_id === null ? null : Number(row.level_id),
			registrationPath: row.registration_path,
			email: row.email,
			isBlocked: row.is_blocked === true,
			registeredByAdmin: row.registered_by_admin === true,
			createdAtLabel: createdAtLabel(row),
			photoUrl: societyFileUrl(row.attach_photo),
			dataValidation: row.data_validation,
			dataValidationNote: row.data_validation_note,
			indentTest: row.indent_test,
			regularTest: row.regular_test,
			approvalStatus: row.approval_status,
			levels: await this.latestLevels(),
			record,
		}
	}

	/** `print(Registrant)` — AK-A's renderer of `print/registrant.blade.php` */
	async print(registrantId: number): Promise<string> {
		const html = await renderSocietyPrintPage(this.dataSource.manager, { society: "registrant", id: registrantId })
		if (html === null) throw new NotFoundException("Pendaftar tidak ditemukan")
		return html
	}

	/**
	 * `destroy(Registrant)` → `Registrant::delete()`: the disease histories, then the row (no soft delete).
	 * Kept as legacy: a failure still answers 200, with the failure text.
	 */
	async remove(registrantId: number): Promise<AdminMessageResult> {
		if (!(await this.registrants.existsBy({ id: registrantId }))) throw new NotFoundException("Pendaftar tidak ditemukan")
		try {
			await this.dataSource.transaction(async (manager) => {
				await deleteDiseaseHistories(manager, "registrant", registrantId)
				await manager.delete(Registrant, { id: registrantId })
			})
			return { message: DELETE_SUCCESS }
		} catch (error) {
			this.logger.error(`registrant ${registrantId} delete failed: ${error instanceof Error ? error.message : String(error)}`)
			return { message: DELETE_FAILED }
		}
	}

	private async assertYear(academicYearId: number): Promise<void> {
		if (!(await this.academicYears.existsBy({ id: academicYearId }))) throw new NotFoundException("Tahun ajaran tidak ditemukan")
	}
}
