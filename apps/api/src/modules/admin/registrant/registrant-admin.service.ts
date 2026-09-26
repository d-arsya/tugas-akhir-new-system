import { Inject, Injectable, Logger, NotFoundException } from "@nestjs/common"
import { DataSource } from "typeorm"

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

import { buildRegistrantWorkbook, registrantExportFileName } from "./registrant-export"
import { createdAtLabel, toRegistrantRow, toYearRows } from "./registrant-format"
import {
	DETAIL_SQL,
	LATEST_LEVELS_SQL,
	LIST_SQL,
	SHOWN_LEVELS_SQL,
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

const options = (rows: Array<{ id: string; name: string | null }>): AdminRegistrantOption[] =>
	rows.map((row) => ({ id: Number(row.id), name: row.name ?? "" }))

@Injectable()
export class RegistrantAdminService {
	private readonly logger = new Logger(RegistrantAdminService.name)

	constructor(@Inject(DataSource) private readonly dataSource: DataSource) {}

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
			levels: options(await this.dataSource.query(SHOWN_LEVELS_SQL)),
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
		const years = (await this.dataSource.query("SELECT year FROM tbr_academic_years WHERE id = $1", [academicYearId])) as Array<{
			year: string | null
		}>
		if (!years[0]) throw new NotFoundException("Tahun ajaran tidak ditemukan")
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
			year: years[0].year,
			nameColumn: column(1),
			schoolColumn: column(19),
		})
		return { body, fileName: registrantExportFileName(years[0].year) }
	}

	/** `PersonalController::personal` — the step-1 selects of the wizard. */
	async findCreateOptions(): Promise<AdminRegistrantCreateOptions> {
		const years = (await this.dataSource.query(
			"SELECT id, year FROM tbr_academic_years WHERE id <> 1 ORDER BY year DESC",
		)) as Array<{ id: string; year: string | null }>
		return {
			academicYears: years.map((row) => ({ id: Number(row.id), year: row.year })),
			levels: options(await this.dataSource.query(SHOWN_LEVELS_SQL)),
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
			levels: options(await this.dataSource.query(LATEST_LEVELS_SQL)),
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
		const found = (await this.dataSource.query("SELECT id FROM tbr_registrants WHERE id = $1", [registrantId])) as unknown[]
		if (found.length === 0) throw new NotFoundException("Pendaftar tidak ditemukan")
		try {
			await this.dataSource.transaction(async (manager) => {
				await deleteDiseaseHistories(manager, "registrant", registrantId)
				await manager.query("DELETE FROM tbr_registrants WHERE id = $1", [registrantId])
			})
			return { message: DELETE_SUCCESS }
		} catch (error) {
			this.logger.error(`registrant ${registrantId} delete failed: ${error instanceof Error ? error.message : String(error)}`)
			return { message: DELETE_FAILED }
		}
	}

	private async assertYear(academicYearId: number): Promise<void> {
		const rows = (await this.dataSource.query("SELECT id FROM tbr_academic_years WHERE id = $1", [academicYearId])) as unknown[]
		if (rows.length === 0) throw new NotFoundException("Tahun ajaran tidak ditemukan")
	}
}
