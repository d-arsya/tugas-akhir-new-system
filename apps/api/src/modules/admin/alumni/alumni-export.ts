import { Workbook, type Worksheet } from "exceljs"

// OWNER: AK-A. Legacy `AlumniExport` (`FromView`) over `resources/views/export/alumni.blade.php`, as
// PhpSpreadsheet's Html reader turns it into a sheet: two bold centred title rows merged over the blade's
// `colspan="8"`, a bold header row, one row per alumnus; text collapsed and trimmed, numeric strings bound
// as numbers, empty cells left blank.

export const ALUMNI_EXPORT_FILE = "Hasil export data alumni.xlsx"

export type AlumniExportRow = {
	fullname: string | null
	alumniPhone: string | null
	provinceName: string | null
	regencyName: string | null
	alumniTalent: string | null
}

/**
 * The header cells' `style="width: Npx"`, converted the way the reader does (`CssDimension::width()` →
 * `pixelsToCellDimension`, Calibri 11: px × 9.140625 / 64, 4 decimals). Legacy columns are that narrow.
 */
const pxWidth = (px: number): number => Math.round(((px * 9.140625) / 64) * 10000) / 10000

/** `DefaultValueBinder`: a numeric string becomes a number unless it has a leading zero. */
const bind = (value: string): string | number => {
	const numeric = /^[+-]?(\d+\.?\d*|\d*\.?\d+)$/.test(value)
	const leadingZero = value.length > 1 && value.startsWith("0") && value[1] !== "."
	return numeric && !leadingZero ? Number(value) : value
}

/** The reader's text handling: `preg_replace('/\s+/u', ' ', trim($text))`. */
const clean = (value: string | null | undefined): string => (value ?? "").trim().replace(/\s+/gu, " ")

/** PHP `strip_tags` (entities stay as they are, as Blade then escapes them for the reader). */
const stripTags = (html: string | null): string => (html ?? "").replace(/<[^>]*>/g, "")

const put = (sheet: Worksheet, row: number, column: number, value: string, bold = false): void => {
	const text = clean(value)
	if (text === "") return
	const cell = sheet.getCell(row, column)
	cell.value = bind(text)
	if (bold) cell.font = { bold: true }
}

export const buildAlumniWorkbook = async (
	year: number,
	rows: AlumniExportRow[],
	name: { label: string; visible: boolean },
): Promise<Buffer> => {
	const workbook = new Workbook()
	const sheet = workbook.addWorksheet("Worksheet")

	const titles = ["HASIL EXPORT DATA ALUMNI", `TAHUN KELULUSAN  ${year}`]
	titles.forEach((title, index) => {
		const row = index + 1
		sheet.mergeCells(row, 1, row, 8)
		const cell = sheet.getCell(row, 1)
		// the blade's two spaces survive in the source but the reader collapses them
		cell.value = clean(title)
		cell.font = { bold: true }
		cell.alignment = { horizontal: "center" }
	})

	const headers: Array<[string, number]> = [
		["NO", 5],
		...(name.visible ? ([[name.label.toUpperCase(), 30]] as Array<[string, number]>) : []),
		["TELEPON", 20],
		["PROVINSI", 20],
		["KABUPATEN", 20],
		["MINAT BAKAT", 20],
	]
	headers.forEach(([text, px], index) => {
		sheet.getColumn(index + 1).width = pxWidth(px)
		put(sheet, 3, index + 1, text, true)
	})

	rows.forEach((row, index) => {
		const cells = [
			String(index + 1),
			...(name.visible ? [row.fullname ?? ""] : []),
			row.alumniPhone ?? "",
			row.provinceName ? `Provinsi ${row.provinceName}` : "",
			row.regencyName ?? "",
			stripTags(row.alumniTalent),
		]
		cells.forEach((value, column) => put(sheet, index + 4, column + 1, value))
	})

	return Buffer.from(await workbook.xlsx.writeBuffer())
}
