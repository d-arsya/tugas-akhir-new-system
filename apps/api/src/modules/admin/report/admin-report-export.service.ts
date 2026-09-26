import { Injectable } from "@nestjs/common"
import { Workbook, type Alignment, type Borders, type Worksheet } from "exceljs"
import type { ArrearFilter, IncomeFilter } from "@admin/report/dto/admin-report.dto"
import { AdminReportService } from "./admin-report.service"
import { formatDmy } from "./report-format"

// Legacy Blade exports: `data-format` on every amount cell
const RUPIAH_FORMAT = '_("Rp"* #,##0_);_("Rp"* (#,##0);_("Rp"* "0"??_);_(@_)'
const THIN: Borders = ["top", "left", "bottom", "right"].reduce(
	(borders, side) => ({ ...borders, [side]: { style: "thin", color: { argb: "FF000000" } } }),
	{} as Borders,
)
const NBSP = " "

type Cell = string | number | null
type Column = { header: string; width: number; center?: boolean }
type SheetSpec = {
	title: string
	columns: Column[]
	period: string
	// Row 3 is only rendered when an academic year / grade / sub grade filter is set
	filterLine: string | null
	rows: Cell[][]
	total: number
	totalAlign?: Alignment["horizontal"]
}

export type ReportFile = { fileName: string; buffer: Buffer }

// PhpSpreadsheet DefaultValueBinder: numeric strings become numbers unless they have a leading zero
const bindValue = (value: Cell): Cell => {
	if (typeof value !== "string") return value
	const numeric = /^[+-]?(\d+\.?\d*|\d*\.?\d+)([Ee][-+]?[0-2]?\d{1,3})?$/.test(value)
	const leadingZero = value.length > 1 && value.startsWith("0") && value[1] !== "."
	return numeric && !leadingZero ? Number(value) : value
}

const periodLine = (from: string | undefined, to: string | undefined, first: string | null, last: string | null): string => {
	if (from && to) return `PERIODE ${from} s.d ${to}`
	return first ? `PERIODE ${first} s.d ${last ?? ""}` : ""
}

// `{year} &nbsp;` + `KELAS &nbsp;` + `{grade} &nbsp;` + `{sub_grade} &nbsp;` as read by the HTML reader
const filterLine = (filter: IncomeFilter): string | null => {
	if (!filter.academicYear && !filter.grade && !filter.subGrade) return null
	const parts: string[] = []
	if (filter.academicYear) parts.push(filter.academicYear)
	if (filter.grade || filter.subGrade) parts.push("KELAS")
	if (filter.grade) parts.push(filter.grade)
	if (filter.subGrade) parts.push(filter.subGrade)
	return parts.map((part) => `${part} ${NBSP}`).join("")
}

const mergedRow = (sheet: Worksheet, row: number, span: number, text: string, bold: boolean): void => {
	sheet.mergeCells(row, 1, row, span)
	const cell = sheet.getCell(row, 1)
	cell.value = text
	cell.font = { bold }
	cell.alignment = { horizontal: "center" }
}

const buildSheet = async (spec: SheetSpec): Promise<Buffer> => {
	const workbook = new Workbook()
	const sheet = workbook.addWorksheet("Worksheet")
	const span = spec.columns.length
	let row = 1

	mergedRow(sheet, row++, span, spec.title, true)
	mergedRow(sheet, row++, span, spec.period, true)
	if (spec.filterLine !== null) mergedRow(sheet, row++, span, spec.filterLine, true)
	mergedRow(sheet, row++, span, "", false)

	const headerRow = row
	spec.columns.forEach((column, index) => {
		sheet.getColumn(index + 1).width = column.width
		const cell = sheet.getCell(row, index + 1)
		cell.value = column.header
		cell.font = { bold: true }
		cell.alignment = { horizontal: "center" }
	})
	row++

	if (spec.rows.length === 0) {
		sheet.mergeCells(row, 1, row, span)
		sheet.getCell(row, 1).value = "Tidak ada data"
		sheet.getCell(row, 1).alignment = { horizontal: "center" }
		row++
	}
	for (const values of spec.rows) {
		values.forEach((value, index) => {
			const cell = sheet.getCell(row, index + 1)
			cell.value = bindValue(value)
			if (spec.columns[index]?.center) cell.alignment = { horizontal: "center" }
		})
		sheet.getCell(row, span).numFmt = RUPIAH_FORMAT
		row++
	}
	const lastDataRow = row - 1

	const label = sheet.getCell(row, span - 1)
	label.value = "TOTAL"
	label.font = { bold: true }
	label.alignment = { horizontal: "right" }
	const total = sheet.getCell(row, span)
	total.value = spec.total
	total.font = { bold: true }
	total.numFmt = RUPIAH_FORMAT
	if (spec.totalAlign) total.alignment = { horizontal: spec.totalAlign }

	for (let r = headerRow; r <= lastDataRow; r++) {
		for (let c = 1; c <= span; c++) sheet.getCell(r, c).border = THIN
	}
	label.border = THIN
	total.border = THIN

	return Buffer.from(await workbook.xlsx.writeBuffer())
}

// Port of legacy DetailReportExport / RecapReportExport / ArrearReportExport (Maatwebsite FromView)
@Injectable()
export class AdminReportExportService {
	constructor(private readonly reportService: AdminReportService) {}

	async exportDetail(filter: IncomeFilter): Promise<ReportFile> {
		const rows = await this.reportService.getIncomeDetailRows(filter)
		const buffer = await buildSheet({
			title: "LAPORAN PEMBAYARAN SANTRI",
			columns: [
				{ header: "NO", width: 5 },
				{ header: "ID TRANSAKSI", width: 20 },
				{ header: "TANGGAL", width: 12 },
				{ header: "NISP", width: 10 },
				{ header: "ATAS NAMA", width: 20 },
				{ header: "KETERANGAN", width: 20 },
				{ header: "KELAS", width: 15, center: true },
				{ header: "SUBKELAS", width: 20, center: true },
				{ header: "NOMINAL", width: 20 },
			],
			period: periodLine(filter.from, filter.to, formatDmy(rows[0]?.createdAt ?? null), formatDmy(rows.at(-1)?.createdAt ?? null)),
			filterLine: filterLine(filter),
			rows: rows.map((r, i) => [
				i + 1,
				r.code,
				formatDmy(r.createdAt),
				r.nis,
				r.fullname,
				r.description,
				r.grade,
				r.subGrade,
				r.amount,
			]),
			total: rows.reduce((sum, r) => sum + r.amount, 0),
			totalAlign: "justify",
		})
		return { fileName: "Laporan Pembayaran Santri (Rincian).xlsx", buffer }
	}

	async exportRecap(filter: IncomeFilter): Promise<ReportFile> {
		const rows = await this.reportService.getIncomeRecapRows(filter)
		// Legacy: first created_at of the first account with invoices … last of the last one
		const withData = rows.filter((r) => r.firstAt)
		const buffer = await buildSheet({
			title: "LAPORAN PEMBAYARAN SANTRI",
			columns: [
				{ header: "NO", width: 5 },
				{ header: "NAMA BIAYA", width: 30 },
				{ header: "NOMINAL", width: 20 },
			],
			period: periodLine(
				filter.from,
				filter.to,
				withData[0] ? formatDmy(withData[0].firstAt) : null,
				withData.at(-1) ? formatDmy(withData.at(-1)?.lastAt ?? null) : null,
			),
			filterLine: filterLine(filter),
			rows: rows.map((r, i) => [i + 1, r.accName, r.totalAmount]),
			total: rows.reduce((sum, r) => sum + r.totalAmount, 0),
		})
		return { fileName: "Laporan Pembayaran Santri (Rekapitulasi).xlsx", buffer }
	}

	async exportArrear(filter: ArrearFilter): Promise<ReportFile> {
		const rows = await this.reportService.getArrearRows(filter)
		const buffer = await buildSheet({
			title: "LAPORAN TUNGGAKAN PEMBAYARAN SANTRI",
			columns: [
				{ header: "NO", width: 5 },
				{ header: "NISP", width: 10 },
				{ header: "ATAS NAMA", width: 20 },
				{ header: "NAMA TAGIHAN", width: 20 },
				{ header: "JATUH TEMPO", width: 15 },
				{ header: "KELAS", width: 15, center: true },
				{ header: "SUBKELAS", width: 20, center: true },
				{ header: "NOMINAL", width: 20 },
			],
			period: periodLine(filter.from, filter.to, formatDmy(rows[0]?.dueDate ?? null), formatDmy(rows.at(-1)?.dueDate ?? null)),
			filterLine: filterLine(filter),
			rows: rows.map((r, i) => [i + 1, r.nis, r.fullname, r.name, formatDmy(r.dueDate), r.grade, r.subGrade, r.amount]),
			// Legacy summed a column the query had renamed, so its TOTAL was always 0
			total: rows.reduce((sum, r) => sum + r.amount, 0),
			totalAlign: "right",
		})
		return { fileName: "Laporan Tunggakan Pembayaran Santri.xlsx", buffer }
	}
}
