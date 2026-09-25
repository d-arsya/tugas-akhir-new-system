import { Workbook } from "exceljs"

// Legacy `EwalletsExport` (`FromView`) rendering `resources/views/export/ewallet.blade.php`.
// Owned by WS D-A.

export type WalletExportRow = {
	uniqueId: string | null
	name: string | null
	ownerLabel: string
	isActive: boolean
	balance: number
}

const HEADERS = [
	{ header: "NO", width: 8 },
	{ header: "ID E-WALLET", width: 16 },
	{ header: "NAMA LENGKAP", width: 32 },
	{ header: "PENGGUNA", width: 16 },
	{ header: "STATUS", width: 16 },
	{ header: "SALDO", width: 40 },
] as const

const SPAN = HEADERS.length
// The blade's `data-format` on the balance cell
const BALANCE_FORMAT = '_(* #,##0_);_(* (#,##0);_(* "0"??_);_(@_)'
const PINK = "FFFF2D73"
const GREEN = "FF548235"

const rupiah = (value: number): string => `Rp ${String(Math.trunc(value)).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`

// PhpSpreadsheet DefaultValueBinder: numeric strings become numbers unless they have a leading zero
const bindValue = (value: string | null): string | number | null => {
	if (value === null) return null
	const numeric = /^[+-]?(\d+\.?\d*|\d*\.?\d+)$/.test(value)
	const leadingZero = value.length > 1 && value.startsWith("0") && value[1] !== "."
	return numeric && !leadingZero ? Number(value) : value
}

/**
 * The workbook of `export/ewallet.blade.php`: a pink three-line title merged over six columns, an
 * empty row, the green header row, then one row per wallet. The empty state's `colspan="5"` for
 * six columns is a legacy slip — the message spans all six here.
 */
export const buildWalletWorkbook = async (
	rows: WalletExportRow[],
	memberSuffix: string,
	statusSuffix: string,
): Promise<Buffer> => {
	const total = rows.reduce((sum, row) => sum + row.balance, 0)
	const workbook = new Workbook()
	const sheet = workbook.addWorksheet("Worksheet")

	sheet.mergeCells(1, 1, 1, SPAN)
	const title = sheet.getCell(1, 1)
	title.value = [
		"LAPORAN SALDO AKHIR",
		`${memberSuffix.toUpperCase()} - ${statusSuffix.toUpperCase()}`,
		`JUMLAH DATA : ${rows.length} DOMPET, TOTAL SALDO : ${rupiah(total)}`,
	].join("\n")
	title.font = { bold: true, size: 11, color: { argb: "FFFFFFFF" } }
	title.fill = { type: "pattern", pattern: "solid", fgColor: { argb: PINK } }
	title.alignment = { horizontal: "center", vertical: "middle", wrapText: true }
	sheet.getRow(1).height = 60

	// Row 2 is the blade's empty `<tr></tr>`
	HEADERS.forEach((column, index) => {
		sheet.getColumn(index + 1).width = column.width
		const cell = sheet.getCell(3, index + 1)
		cell.value = column.header
		cell.font = { bold: true, color: { argb: "FFFFFFFF" } }
		cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: GREEN } }
		cell.alignment = { horizontal: "center", vertical: "middle" }
	})
	sheet.getRow(3).height = 30

	let rowNumber = 4
	if (rows.length === 0) {
		sheet.mergeCells(rowNumber, 1, rowNumber, SPAN)
		const empty = sheet.getCell(rowNumber, 1)
		empty.value = "Data tidak ditemukan"
		empty.alignment = { horizontal: "center" }
		return Buffer.from(await workbook.xlsx.writeBuffer())
	}

	rows.forEach((row, index) => {
		const values = [index + 1, bindValue(row.uniqueId), bindValue(row.name), row.ownerLabel, row.isActive ? "Aktif" : "Nonaktif"]
		values.forEach((value, column) => {
			const cell = sheet.getCell(rowNumber, column + 1)
			cell.value = value
			cell.alignment = { horizontal: "left", vertical: "middle" }
		})
		const balance = sheet.getCell(rowNumber, SPAN)
		balance.value = row.balance
		balance.numFmt = BALANCE_FORMAT
		balance.alignment = { horizontal: "right", vertical: "middle" }
		rowNumber++
	})

	return Buffer.from(await workbook.xlsx.writeBuffer())
}
