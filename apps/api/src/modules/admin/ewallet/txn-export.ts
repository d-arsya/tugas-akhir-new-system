import { Workbook, type Worksheet } from "exceljs"

import { EWALLET_MERCHANT_TYPE, EWALLET_STUDENT_TYPE } from "@shared/ewallet/balance"
import { dateTimeLong, rupiah, statusText } from "@admin/ewallet/txn-format"

// Legacy `TransactionHistoryExport` / `AllTransactionHistoryExport` and
// `resources/views/export/transaction-history.blade.php`.
//
// Legacy loaded every transaction into memory and filtered the collection in PHP, and it laid a
// purchase with several items out by injecting a nested `<table>` and deleting rows after the
// fact. Here the rows arrive already filtered by SQL and a purchase is one merged block per
// transaction, one line per item.

export type ExportRow = {
	id: string
	code: string | null
	type: string
	status: string
	paymentMethod: string | null
	totalAmount: string | null
	createdAt: string | null
	walletUniqueId: string | null
	ownerType: string | null
	ownerName: string | null
	merchantName: string | null
	studentUniqueId: string | null
	studentName: string | null
}

export type ExportItem = { transactionId: string; description: string | null; price: string | null }

export type ExportOptions = {
	/** The requested type, or undefined for the three-sheet "all" workbook. */
	type: string | undefined
	dateSuffix: string
	typeSuffix: string
	statusSuffix: string
}

const HEADER_FILL = "FFFF2D73"
const COLUMN_FILL = "FF548235"
const AMOUNT_FORMAT = '_(* #,##0_);_(* (#,##0);_(* "0"??_);_(@_)'
const NOT_SET = "Belum Ditentukan"

// `typeLabel()` of the export — the sheet titles legacy took from the blade's `<title>`
const SHEET_TITLE: Record<string, string> = {
	purchase: "JUAL BELI",
	income: "ISI SALDO",
	expense: "TARIK SALDO",
}

const PURCHASE_COLUMNS: Array<[string, number]> = [
	["NO", 8],
	["ID TRANSAKSI", 16],
	["TANGGAL TRANSAKSI", 24],
	["ID E-WALLET SANTRI", 20],
	["NAMA SANTRI", 24],
	["ID E-WALLET MERCHANT", 24],
	["NAMA MERCHANT", 20],
	["DESKRIPSI", 24],
	["NOMINAL", 24],
	["STATUS", 16],
]

const OTHER_COLUMNS: Array<[string, number]> = [
	["NO", 8],
	["ID TRANSAKSI", 24],
	["TANGGAL", 24],
	["ID E-WALLET", 24],
	["PENGGUNA", 24],
	["NAMA LENGKAP", 24],
	["METODE", 24],
	["NOMINAL", 24],
	["STATUS", 24],
]

/** `Ewallet::getEwalletUserTypeAttribute`. */
const ownerLabel = (ownerType: string | null): string => {
	if (ownerType === EWALLET_MERCHANT_TYPE) return "Merchant"
	if (ownerType === EWALLET_STUDENT_TYPE) return "Santri"
	return "Tidak ditemukan"
}

const NUMERIC = /^[1-9]\d*$/

// PhpSpreadsheet's default binder writes numeric strings as numbers unless they lead with a zero
const bind = (value: string | null): string | number | null => {
	if (value === null) return null
	return NUMERIC.test(value) && value.length <= 15 ? Number(value) : value
}

const writeBanner = (sheet: Worksheet, span: number, count: number, total: number, options: ExportOptions): void => {
	sheet.mergeCells(1, 1, 1, span)
	const cell = sheet.getCell(1, 1)
	cell.value = [
		"LAPORAN RIWAYAT TRANSAKSI",
		`${options.dateSuffix.toUpperCase()}, JENIS TRANSAKSI : ${options.typeSuffix.toUpperCase()}, ${options.statusSuffix.toUpperCase()}`,
		`JUMLAH DATA : ${count} TRANSAKSI, TOTAL TRANSAKSI : ${rupiah(total)}`,
	].join("\n")
	cell.font = { bold: true, size: 11, color: { argb: "FFFFFFFF" } }
	cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: HEADER_FILL } }
	cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true }
	sheet.getRow(1).height = 60
}

const writeColumnHeaders = (sheet: Worksheet, row: number, columns: Array<[string, number]>): void => {
	columns.forEach(([title, width], index) => {
		sheet.getColumn(index + 1).width = width
		const cell = sheet.getCell(row, index + 1)
		cell.value = title
		cell.font = { bold: true, color: { argb: "FFFFFFFF" } }
		cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLUMN_FILL } }
		cell.alignment = { horizontal: "center", vertical: "middle" }
	})
	sheet.getRow(row).height = 30
}

const writeEmpty = (sheet: Worksheet, row: number, span: number): void => {
	sheet.mergeCells(row, 1, row, span)
	const cell = sheet.getCell(row, 1)
	cell.value = "Data tidak ditemukan"
	cell.alignment = { horizontal: "center" }
}

const totalOf = (rows: ExportRow[]): number => rows.reduce((sum, row) => sum + Number(row.totalAmount ?? 0), 0)

const writeOtherSheet = (workbook: Workbook, title: string, rows: ExportRow[], options: ExportOptions): void => {
	const sheet = workbook.addWorksheet(title)
	writeBanner(sheet, OTHER_COLUMNS.length, rows.length, totalOf(rows), options)
	writeColumnHeaders(sheet, 3, OTHER_COLUMNS)
	if (rows.length === 0) return writeEmpty(sheet, 4, OTHER_COLUMNS.length)

	rows.forEach((row, index) => {
		const line = sheet.getRow(4 + index)
		line.values = [
			index + 1,
			row.code,
			dateTimeLong(row.createdAt),
			// `getEwalletUniqueIdAttribute`
			row.walletUniqueId === null && row.ownerType === null ? "Belum ditentukan" : bind(row.walletUniqueId),
			ownerLabel(row.ownerType),
			row.ownerName ?? "Tidak ditemukan",
			row.paymentMethod,
			Number(row.totalAmount ?? 0),
			statusText(row.status),
		]
		line.getCell(8).numFmt = AMOUNT_FORMAT
		line.getCell(8).alignment = { horizontal: "right" }
		line.getCell(1).alignment = { horizontal: "left" }
	})
}

const writePurchaseSheet = (
	workbook: Workbook,
	title: string,
	rows: ExportRow[],
	itemsByTransaction: Map<string, ExportItem[]>,
	options: ExportOptions,
): void => {
	const sheet = workbook.addWorksheet(title)
	writeBanner(sheet, PURCHASE_COLUMNS.length, rows.length, totalOf(rows), options)
	writeColumnHeaders(sheet, 3, PURCHASE_COLUMNS)
	if (rows.length === 0) return writeEmpty(sheet, 4, PURCHASE_COLUMNS.length)

	let cursor = 4
	rows.forEach((row, index) => {
		const items = itemsByTransaction.get(row.id) ?? []
		const span = Math.max(items.length, 1)
		const lines = items.length > 0 ? items : [null]
		lines.forEach((item, offset) => {
			const line = sheet.getRow(cursor + offset)
			const first = offset === 0
			line.values = [
				first ? index + 1 : null,
				first ? row.code : null,
				first ? dateTimeLong(row.createdAt) : null,
				first ? (bind(row.studentUniqueId) ?? NOT_SET) : null,
				first ? (row.studentName ?? NOT_SET) : null,
				first ? bind(row.walletUniqueId) : null,
				first ? row.merchantName : null,
				item ? item.description : "-",
				item ? Number(item.price ?? 0) : "-",
				first ? statusText(row.status) : null,
			]
			if (item) {
				line.getCell(9).numFmt = AMOUNT_FORMAT
				line.getCell(9).alignment = { horizontal: "right", vertical: "middle" }
			}
		})
		if (span > 1) {
			for (const column of [1, 2, 3, 4, 5, 6, 7, 10]) sheet.mergeCells(cursor, column, cursor + span - 1, column)
		}
		for (let offset = 0; offset < span; offset++) {
			for (const column of [1, 2, 3, 4, 5, 6, 7, 10]) {
				sheet.getCell(cursor + offset, column).alignment = { horizontal: "left", vertical: "middle" }
			}
		}
		cursor += span
	})
}

const groupItems = (items: ExportItem[]): Map<string, ExportItem[]> => {
	const grouped = new Map<string, ExportItem[]>()
	for (const item of items) grouped.set(item.transactionId, [...(grouped.get(item.transactionId) ?? []), item])
	return grouped
}

/** The three-sheet workbook when no type was chosen, otherwise one sheet in that type's layout. */
export const buildHistoryWorkbook = async (
	rows: ExportRow[],
	items: ExportItem[],
	options: ExportOptions,
): Promise<Buffer> => {
	const workbook = new Workbook()
	const grouped = groupItems(items)
	const ofType = (type: string): ExportRow[] => rows.filter((row) => row.type === type)

	if (options.type === undefined) {
		writeOtherSheet(workbook, "ISI SALDO", ofType("income"), { ...options, typeSuffix: "ISI SALDO" })
		writeOtherSheet(workbook, "TARIK SALDO", ofType("expense"), { ...options, typeSuffix: "TARIK SALDO" })
		writePurchaseSheet(workbook, "JUAL BELI", ofType("purchase"), grouped, { ...options, typeSuffix: "JUAL BELI" })
	} else if (options.type === "purchase") {
		writePurchaseSheet(workbook, SHEET_TITLE.purchase ?? "JUAL BELI", ofType("purchase"), grouped, options)
	} else {
		writeOtherSheet(workbook, SHEET_TITLE[options.type] ?? "SEMUA TRANSAKSI", ofType(options.type), options)
	}

	return Buffer.from(await workbook.xlsx.writeBuffer())
}
