import { Workbook } from "exceljs"

import type { AdminRegistrantExportStatus } from "@roja/types"

import { strTitle } from "./registrant-format"
import type { ListRow } from "./registrant-sql"

// Legacy `RegistrantExport` (`FromView`) rendering `resources/views/export/registrant.blade.php`:
// two bold centred title rows merged over 8 columns, a bold header row, one row per registrant.

/** `exportTitleRegistrant($approval_status)` (Helper.php 376-391) */
const TITLE: Record<AdminRegistrantExportStatus, string> = {
	"": "HASIL EXPORT SEMUA PENDAFTAR",
	wait: "HASIL EXPORT PENDAFTAR BARU",
	approve: "HASIL EXPORT PENDAFTAR DITERIMA",
	reject: "HASIL EXPORT PENDAFTAR TIDAK DITERIMA",
}

/** `approvalStatusExport()` (Helper.php 86-97) */
const approvalLabel = (status: string | null): string => (status === "reject" ? "Tidak Diterima" : status === "approve" ? "Diterima" : "Baru")

/** `'Data PSB tahun ' . sanitizeFileName($academic_year->year) . '.xlsx'` */
export const registrantExportFileName = (year: string | null): string =>
	`Data PSB tahun ${(year ?? "").replace(/[^a-zA-Z0-9_\-.]/g, " ")}.xlsx`

// PhpSpreadsheet DefaultValueBinder: numeric strings become numbers unless they have a leading zero
const bindValue = (value: string | number | null): string | number | null => {
	if (value === null || typeof value === "number") return value
	const numeric = /^[+-]?(\d+\.?\d*|\d*\.?\d+)$/.test(value)
	const leadingZero = value.length > 1 && value.startsWith("0") && value[1] !== "."
	return numeric && !leadingZero ? Number(value) : value
}

type Column = { header: string; width: number; value: (row: ListRow, index: number) => string | number | null }

export type RegistrantExportInput = {
	rows: ListRow[]
	status: AdminRegistrantExportStatus
	year: string | null
	/** `getInputStatus($setting_forms, 1)` / `(…, 19)` and their `Str::upper(getInputLabel(…))` */
	nameColumn: string | null
	schoolColumn: string | null
}

export const buildRegistrantWorkbook = async (input: RegistrantExportInput): Promise<Buffer> => {
	const columns: Column[] = [
		{ header: "NO", width: 5, value: (_, index) => index + 1 },
		{ header: "NO. PENDAFTAR", width: 20, value: (row) => row.registrant_id },
		...(input.nameColumn === null ? [] : [{ header: input.nameColumn, width: 30, value: (row: ListRow) => row.fullname }]),
		...(input.schoolColumn === null ? [] : [{ header: input.schoolColumn, width: 30, value: (row: ListRow) => row.school_name }]),
		{ header: "JENJANG", width: 20, value: (row) => row.level_name },
		{ header: "TANGGAL DAFTAR", width: 20, value: (row) => row.created_at },
		{ header: "JALUR", width: 20, value: (row) => strTitle(row.registration_path) },
		{ header: "STATUS PENERIMAAN", width: 20, value: (row) => approvalLabel(row.approval_status) },
	]

	const workbook = new Workbook()
	const sheet = workbook.addWorksheet("Worksheet")

	// `<th colspan="8" style="text-align: center"><b>…</b></th>` twice
	const titles = [TITLE[input.status], `PENDAFTARAN SANTRI BARU TAHUN ${input.year ?? ""}`]
	titles.forEach((text, index) => {
		sheet.mergeCells(index + 1, 1, index + 1, 8)
		const cell = sheet.getCell(index + 1, 1)
		cell.value = text
		cell.font = { bold: true }
		cell.alignment = { horizontal: "center" }
	})

	columns.forEach((column, index) => {
		sheet.getColumn(index + 1).width = column.width
		const cell = sheet.getCell(3, index + 1)
		cell.value = column.header
		cell.font = { bold: true }
	})

	input.rows.forEach((row, rowIndex) => {
		columns.forEach((column, index) => {
			sheet.getCell(rowIndex + 4, index + 1).value = bindValue(column.value(row, rowIndex))
		})
	})

	return Buffer.from(await workbook.xlsx.writeBuffer())
}
