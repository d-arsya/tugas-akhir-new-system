import type {
	ReportArrearFilterParams,
	ReportArrearPage,
	ReportArrearRow,
	ReportFilterParams,
	ReportIncomeDetailPage,
	ReportIncomeDetailRow,
	ReportIncomeRecap,
	ReportOptions,
	ReportTableParams,
} from "@roja/types"

// Dev-only report data, filtered / sorted / paged in memory like the API does

export const mockReportOptions: ReportOptions = {
	academicYears: ["2026/2027", "2025/2026", "2024/2025"],
	grades: [1, 2, 3, 4, 5, 6],
	subGrades: ["A", "B"],
	accountancies: ["Syahriyah", "Kesantrian", "Buku LKS", "Kitab", "Seragam"],
}

const NAMES = [
	"Laila Alfi Sa'diah",
	"Aulia Nur Rohmah",
	"Mumtaza Ashmaul Karima",
	"Mutiara Fauziah Kamilatunnisa",
	"Nur Alifah Zahrani",
	"Dinda Setyo Ningrum",
	"Suci Qonitah Nur Hartanto",
	"Zuyyina Nabiha",
	"Afifah Sarmadani",
	"Tsabita Al Haq",
]
const FEES = ["Syahriyah Bulan September 2026", "Kesantrian Bulan September 2026", "Buku LKS Bulan September 2026", "Kitab", "Seragam"]

const pad = (n: number): string => String(n).padStart(2, "0")
const localDay = (offset: number): string => {
	const date = new Date()
	date.setDate(date.getDate() + offset)
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}
const dmyToIso = (value: string | undefined): string | undefined =>
	value && /^\d{2}\/\d{2}\/\d{4}$/.test(value) ? value.split("/").reverse().join("-") : undefined

type DetailFixture = ReportIncomeDetailRow & { academicYear: string }

// 26 payments today (enough for 3 pages of 10) plus some on the previous days
const detailFixtures: DetailFixture[] = Array.from({ length: 40 }, (_, i) => {
	const dayOffset = i < 26 ? 0 : -1 - (i % 4)
	const day = localDay(dayOffset)
	const feeCount = (i % 5) + 1
	const fees = FEES.slice(0, feeCount)
	const time = `${pad(7 + (i % 10))}:${pad((i * 7) % 60)}:00`
	return {
		code: `${day.replaceAll("-", "")}${String(i + 1).padStart(3, "0")}`,
		paidAt: `${day}T${time}`,
		createdAt: `${day}T${time}`,
		fullname: NAMES[i % NAMES.length] ?? "",
		nis: String(2300300 + i),
		amount: feeCount * 250000 + (i % 3) * 50000,
		description: fees.join(", "),
		grade: (i % 6) + 1,
		subGrade: i % 7 === 0 ? "undefined" : i % 2 === 0 ? "A" : "B",
		academicYear: i % 4 === 0 ? "2025/2026" : "2026/2027",
	}
})

type ArrearFixture = ReportArrearRow & { academicYear: string; accountancy: string }

const arrearFixtures: ArrearFixture[] = Array.from({ length: 23 }, (_, i) => {
	const accountancy = mockReportOptions.accountancies[i % 5] ?? "Syahriyah"
	return {
		id: 2300 + i,
		nis: String(1700010 + (i % 9)),
		fullname: NAMES[(i + 3) % NAMES.length] ?? "",
		name: `${accountancy} Bulan ${["Juli", "Agustus", "Januari", "Februari"][i % 4]} 202${3 + (i % 3)}`,
		amount: 200000 + (i % 4) * 50000,
		dueDate: localDay(-30 - i * 17),
		grade: String((i % 6) + 1),
		subGrade: i % 5 === 0 ? "undefined" : i % 2 === 0 ? "A" : "B",
		academicYear: i % 3 === 0 ? "2024/2025" : "2025/2026",
		accountancy,
	}
})

const matchesSearch = (values: (string | number | null)[], search: string | undefined): boolean =>
	!search || values.some((value) => value !== null && String(value).toLowerCase().includes(search.toLowerCase()))

const inRange = (day: string | null, params: ReportFilterParams): boolean => {
	const from = dmyToIso(params.from)
	const to = dmyToIso(params.to)
	if (!from || !to || !day) return true
	const date = day.slice(0, 10)
	return date >= from && date <= to
}

const sortRows = <T,>(rows: T[], params: ReportTableParams, pick: (row: T, key: string) => string | number | null): T[] => {
	const { sortBy, sortDir } = params
	if (!sortBy) return rows
	const factor = sortDir === "desc" ? -1 : 1
	return [...rows].sort((a, b) => {
		const x = pick(a, sortBy) ?? ""
		const y = pick(b, sortBy) ?? ""
		return (x < y ? -1 : x > y ? 1 : 0) * factor
	})
}

const pageOf = <T,>(rows: T[], params: ReportTableParams): T[] =>
	rows.slice((params.page - 1) * params.limit, params.page * params.limit)

const meta = (params: ReportTableParams, total: number): ReportIncomeDetailPage["meta"] & ReportArrearPage["meta"] => ({
	page: params.page,
	limit: params.limit,
	total,
	totalPages: Math.max(1, Math.ceil(total / params.limit)),
	totalIncome: 0,
	totalArrear: 0,
})

const filterDetail = (params: ReportFilterParams): DetailFixture[] =>
	detailFixtures.filter(
		(row) =>
			inRange(row.paidAt, params) &&
			(!params.academicYear || row.academicYear === params.academicYear) &&
			(!params.grade || String(row.grade) === params.grade) &&
			(!params.subGrade || row.subGrade === params.subGrade) &&
			matchesSearch([row.code, row.amount, row.fullname, row.grade, row.subGrade, row.nis], params.search),
	)

export const mockReportIncomeDetail = (params: ReportFilterParams & ReportTableParams): ReportIncomeDetailPage => {
	const rows = filterDetail(params)
	const sorted = sortRows(rows, params, (row, key) => {
		const value = row[key as keyof DetailFixture]
		return typeof value === "number" || typeof value === "string" ? value : null
	})
	const data = pageOf(sorted, params).map(({ academicYear: _academicYear, ...row }) => row)
	return { data, meta: { ...meta(params, rows.length), totalIncome: rows.reduce((sum, row) => sum + row.amount, 0) } }
}

export const mockReportIncomeRecap = (params: ReportFilterParams): ReportIncomeRecap => {
	const rows = filterDetail(params)
	const recap = mockReportOptions.accountancies.map((accName) => ({
		accName,
		totalAmount: rows.filter((row) => row.description.includes(accName)).reduce((sum) => sum + 250000, 0),
	}))
	return { rows: recap, totalAmount: recap.reduce((sum, row) => sum + row.totalAmount, 0), totalData: recap.length }
}

export const mockReportArrears = (params: ReportArrearFilterParams & ReportTableParams): ReportArrearPage => {
	const rows = arrearFixtures.filter(
		(row) =>
			inRange(row.dueDate, params) &&
			(!params.academicYear || row.academicYear === params.academicYear) &&
			(!params.accountancy || row.accountancy === params.accountancy) &&
			(!params.grade || row.grade === params.grade) &&
			(!params.subGrade || row.subGrade === params.subGrade) &&
			matchesSearch([row.nis, row.fullname, row.name, row.amount, row.dueDate, row.grade, row.subGrade], params.search),
	)
	const sorted = sortRows(rows, params, (row, key) => {
		const value = row[key as keyof ArrearFixture]
		return typeof value === "number" || typeof value === "string" ? value : null
	})
	const data = pageOf(sorted, params).map(({ academicYear: _a, accountancy: _b, ...row }) => row)
	return { data, meta: { ...meta(params, rows.length), totalArrear: rows.reduce((sum, row) => sum + row.amount, 0) } }
}
