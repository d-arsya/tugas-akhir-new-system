import { Workbook } from "exceljs"

import { indoDate } from "./student-format"

// Legacy `App\Exports\StudentExport` (`FromView` + `WithStyles`) rendering `resources/views/export/student.blade.php`,
// read back by PhpSpreadsheet's HTML reader: every cell's text trimmed with whitespace collapsed, numeric
// strings bound as numbers (DefaultValueBinder), `style="width: Npx"` → column width N, `height: 100px` →
// row height 100.

export type ExportSetting = { id: number; status: boolean; label: string }

export type ExportRow = {
	nis: string | null
	email: string | null
	nisn: string | null
	fullname: string | null
	placeOfBirth: string | null
	dateOfBirth: string | null
	/** `SocietyGetterTrait::getFullAddress()`, already built */
	address: string
	siblingOrder: string | null
	numberOfSibling: string | null
	parentStatus: string | null
	bloodType: string | null
	schoolName: string | null
	fatherFullname: string | null
	fatherPhone: string | null
	fatherLastEducation: string | null
	fatherJob: string | null
	motherFullname: string | null
	motherPhone: string | null
	motherLastEducation: string | null
	motherJob: string | null
	guardianFullname: string | null
	guardianPhone: string | null
}

/** `StudentGrade::getTranslateParentStatusAttribute()` */
const PARENT_STATUS: Record<string, string> = {
	"father&mother": "Ayah dan Ibu",
	fatherless: "Yatim",
	motherless: "Piatu",
	orphan: "Yatim Piatu",
}

// PhpSpreadsheet DefaultValueBinder: numeric strings become numbers unless they have a leading zero
const bindValue = (value: string | null): string | number | null => {
	if (value === null || value === "") return null
	const numeric = /^[+-]?(\d+\.?\d*|\d*\.?\d+)$/.test(value)
	const leadingZero = value.length > 1 && value.startsWith("0") && value[1] !== "."
	return numeric && !leadingZero ? Number(value) : value
}

/** The HTML reader's `preg_replace('/\s+/u', ' ', trim($text))` */
const text = (value: string | null): string | number | null => bindValue((value ?? "").replace(/\s+/g, " ").trim())

type Column = { id: number | null; header: (label: (id: number) => string) => string; width: number; value: (row: ExportRow, index: number) => string | number | null }

/**
 * `StudentExport::getColumnCount()` counts ids 5 and 6 separately while the blade merges them into one
 * birth column, so with both on the title merge and the border run one column past the table (kept quirk).
 */
const LIST_IDS = [14, 5, 6, 13, 9, 10, 24, 19, 37, 41, 40, 43, 44, 48, 47, 50, 54, 58]

export const buildStudentWorkbook = async (
	settings: ExportSetting[],
	rows: ExportRow[],
	meta: { grade: number; levelName: string | null; year: string | null },
): Promise<Buffer> => {
	const on = (id: number): boolean => settings.find((row) => row.id === id)?.status === true
	const label = (id: number): string => (settings.find((row) => row.id === id)?.label ?? "").toUpperCase()
	const simple = (id: number, pick: (row: ExportRow) => string | null, upper = false): Column => ({
		id,
		header: () => label(id),
		width: 30,
		value: (row) => text(upper ? (pick(row) ?? "").toUpperCase() : pick(row)),
	})

	const both = on(5) && on(6)
	const columns: Column[] = [
		{ id: null, header: () => "NO", width: 5, value: (_row, index) => index + 1 },
		{ id: null, header: () => "NISP", width: 20, value: (row) => text(row.nis) },
		...(on(14) ? [simple(14, (row) => row.nisn)] : []),
		...(on(1) ? [simple(1, (row) => row.fullname)] : []),
		...(on(5) || on(6)
			? [
					{
						id: 5,
						// Three `<b>` elements: the reader trims each text node, so they join without spaces
						header: () => [on(5) ? label(5) : "", both ? "&" : "", on(6) ? label(6) : ""].join(""),
						width: 30,
						value: (row: ExportRow) =>
							text([on(5) ? (row.placeOfBirth ?? "") : "", both ? ", " : "", on(6) ? indoDate(row.dateOfBirth) : ""].join(" ")),
					},
				]
			: []),
		...(on(13) ? [simple(13, (row) => row.address)] : []),
		...(on(9) ? [simple(9, (row) => `Anak ke ${row.siblingOrder ?? ""} dari ${row.numberOfSibling ?? ""} bersaudara`)] : []),
		...(on(10) ? [simple(10, (row) => (row.parentStatus === null ? null : (PARENT_STATUS[row.parentStatus] ?? null)))] : []),
		...(on(24) ? [simple(24, (row) => row.bloodType, true)] : []),
		...(on(19) ? [simple(19, (row) => row.schoolName)] : []),
		...(on(37) ? [simple(37, (row) => row.fatherFullname)] : []),
		...(on(41) ? [simple(41, (row) => row.fatherPhone)] : []),
		...(on(40) ? [simple(40, (row) => row.fatherLastEducation, true)] : []),
		...(on(43) ? [simple(43, (row) => row.fatherJob)] : []),
		...(on(44) ? [simple(44, (row) => row.motherFullname)] : []),
		...(on(48) ? [simple(48, (row) => row.motherPhone)] : []),
		...(on(47) ? [simple(47, (row) => row.motherLastEducation, true)] : []),
		...(on(50) ? [simple(50, (row) => row.motherJob)] : []),
		...(on(54) ? [simple(54, (row) => row.guardianFullname)] : []),
		...(on(58) ? [simple(58, (row) => row.guardianPhone)] : []),
		{ id: null, header: () => "EMAIL", width: 30, value: (row) => text(row.email) },
	]
	const span = 3 + LIST_IDS.filter(on).length

	const workbook = new Workbook()
	const sheet = workbook.addWorksheet("Worksheet")
	const titles = [
		"HASIL EXPORT DATA SANTRI",
		`KELAS ${meta.grade} JENJANG ${(meta.levelName ?? "").toUpperCase()}`,
		`TAHUN AJARAN ${meta.year ?? ""}`,
		"",
	]
	titles.forEach((title, index) => {
		sheet.mergeCells(index + 1, 1, index + 1, span)
		const cell = sheet.getCell(index + 1, 1)
		cell.value = title === "" ? null : title
		cell.font = { bold: true }
		cell.alignment = { horizontal: "center" }
	})

	columns.forEach((column, index) => {
		sheet.getColumn(index + 1).width = column.width
		const cell = sheet.getCell(5, index + 1)
		cell.value = column.header(label)
		cell.font = { bold: true }
	})
	rows.forEach((row, rowIndex) => {
		const excelRow = sheet.getRow(6 + rowIndex)
		excelRow.height = 100
		columns.forEach((column, index) => {
			const cell = excelRow.getCell(index + 1)
			cell.value = column.value(row, rowIndex)
			if (index < 2) cell.alignment = { horizontal: "left" }
		})
	})

	// `styles()`: vertical centre on A–U, wrap on D, E, F and U, thin borders on A5:<end><5 + rows>
	for (let col = 1; col <= 21; col++) {
		const wrap = [4, 5, 6, 21].includes(col)
		sheet.getColumn(col).eachCell({ includeEmpty: true }, (cell) => {
			cell.alignment = { ...cell.alignment, vertical: "middle", ...(wrap ? { wrapText: true } : {}) }
		})
	}
	for (let r = 5; r <= 5 + rows.length; r++) {
		for (let c = 1; c <= span; c++) {
			const thin = { style: "thin" as const }
			sheet.getCell(r, c).border = { top: thin, left: thin, bottom: thin, right: thin }
		}
	}

	return Buffer.from(await workbook.xlsx.writeBuffer())
}
