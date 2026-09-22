import { useState, useMemo } from "react"
import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { adminApi, type ReportArrearItem } from "@/lib/api"
import { PageLoader, Button, Input, Badge, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@roja/ui"
import { formatRupiah } from "@roja/utils"
import dayjs from "dayjs"
import {
	AlertTriangle,
	Download,
	Search,
	Filter,
	RotateCcw,
	ChevronLeft,
	ChevronRight,
	ShieldAlert,
	Clock,
	AlertCircle,
} from "lucide-react"

export const Route = createFileRoute("/_auth/reports/arrears")({
	component: ReportArrearsPage,
})

function exportToCsv(filename: string, headers: string[], rows: (string | number)[][]) {
	const csvContent = [
		headers.join(","),
		...rows.map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(",")),
	].join("\n")

	const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
	const link = document.createElement("a")
	const url = URL.createObjectURL(blob)
	link.setAttribute("href", url)
	link.setAttribute("download", filename)
	link.style.visibility = "hidden"
	document.body.appendChild(link)
	link.click()
	document.body.removeChild(link)
}

function generatePageNumbers(current: number, total: number): (number | string)[] {
	if (total <= 5) {
		return Array.from({ length: total }, (_, i) => i + 1)
	}
	const pages: (number | string)[] = []
	pages.push(1)
	if (current > 3) pages.push("...")

	const start = Math.max(2, current - 1)
	const end = Math.min(total - 1, current + 1)

	for (let i = start; i <= end; i++) {
		pages.push(i)
	}

	if (current < total - 2) pages.push("...")
	pages.push(total)
	return pages
}

function ReportArrearsPage(): JSX.Element {
	// Filter & Pagination state
	const [dateStart, setDateStart] = useState<string>("")
	const [dateEnd, setDateEnd] = useState<string>("")
	const [selectedAcademicYearId, setSelectedAcademicYearId] = useState<number | undefined>(undefined)
	const [selectedGrade, setSelectedGrade] = useState<string>("")
	const [selectedSubGrade, setSelectedSubGrade] = useState<string>("")
	const [selectedAccountId, setSelectedAccountId] = useState<number | undefined>(undefined)
	const [selectedAgingBucketFilter, setSelectedAgingBucketFilter] = useState<string | null>(null)
	const [page, setPage] = useState<number>(1)
	const [limit, setLimit] = useState<number>(20)

	const [appliedFilters, setAppliedFilters] = useState<{
		dateStart?: string
		dateEnd?: string
		academicYearId?: number
		grade?: string
		subGrade?: string
		accountancyId?: number
		page?: number
		limit?: number
	}>({ page: 1, limit: 20 })

	// Search & Table Sorting state
	const [searchQuery, setSearchQuery] = useState<string>("")
	const [sortField, setSortField] = useState<string>("agingDays")
	const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

	// Fetch Academic Years
	const { data: academicYears } = useQuery({
		queryKey: ["admin-academic-years"],
		queryFn: () => adminApi.getAcademicYears(),
	})

	// Fetch Grade options
	const { data: grades } = useQuery({
		queryKey: ["admin-grades"],
		queryFn: () => adminApi.getGrades(),
	})

	// Fetch Chart of Accounts for Fee types
	const { data: accounts } = useQuery({
		queryKey: ["admin-accounts-tree"],
		queryFn: () => adminApi.getAccountancyTree(),
	})

	// Fetch Arrears Detail Data (Paginated)
	const { data: arrearsDetails, isLoading: isLoadingDetails } = useQuery({
		queryKey: ["admin-reports-arrears", appliedFilters],
		queryFn: () => adminApi.getReportsArrears(appliedFilters),
	})

	// Fetch Aging Summary Data
	const { data: agingSummary } = useQuery({
		queryKey: ["admin-reports-arrears-aging", appliedFilters],
		queryFn: () => adminApi.getReportsArrearsAging(appliedFilters),
	})

	const academicYearsList = useMemo(() => {
		if (Array.isArray(academicYears)) return academicYears
		if (Array.isArray((academicYears as any)?.items)) return (academicYears as any).items
		if (Array.isArray((academicYears as any)?.data)) return (academicYears as any).data
		return []
	}, [academicYears])

	const gradesList = useMemo(() => {
		if (Array.isArray(grades)) return grades
		if (Array.isArray((grades as any)?.items)) return (grades as any).items
		if (Array.isArray((grades as any)?.data)) return (grades as any).data
		return []
	}, [grades])

	const accountsList = useMemo(() => {
		if (Array.isArray(accounts)) return accounts
		if (Array.isArray((accounts as any)?.items)) return (accounts as any).items
		if (Array.isArray((accounts as any)?.data)) return (accounts as any).data
		return []
	}, [accounts])

	const arrearsDetailsList = useMemo(() => {
		if (Array.isArray(arrearsDetails?.items)) return arrearsDetails.items
		if (Array.isArray(arrearsDetails)) return arrearsDetails
		if (Array.isArray((arrearsDetails as any)?.data)) return (arrearsDetails as any).data
		return []
	}, [arrearsDetails])

	const currentPage = arrearsDetails?.page ?? page
	const totalPages = arrearsDetails?.totalPages ?? 1
	const totalItems = arrearsDetails?.total ?? arrearsDetailsList.length

	const handleApplyFilter = () => {
		setPage(1)
		setAppliedFilters({
			dateStart: dateStart || undefined,
			dateEnd: dateEnd || undefined,
			academicYearId: selectedAcademicYearId || undefined,
			grade: selectedGrade || undefined,
			subGrade: selectedSubGrade || undefined,
			accountancyId: selectedAccountId || undefined,
			page: 1,
			limit: limit,
		})
	}

	const handlePageChange = (newPage: number) => {
		setPage(newPage)
		setAppliedFilters((prev) => ({
			...prev,
			page: newPage,
			limit: limit,
		}))
	}

	const handleResetFilter = () => {
		setDateStart("")
		setDateEnd("")
		setSelectedAcademicYearId(undefined)
		setSelectedGrade("")
		setSelectedSubGrade("")
		setSelectedAccountId(undefined)
		setSelectedAgingBucketFilter(null)
		setPage(1)
		setLimit(20)
		setAppliedFilters({ page: 1, limit: 20 })
	}

	// Filtered and Sorted Detail List
	const filteredArrears = useMemo(() => {
		let result = [...arrearsDetailsList]

		if (selectedAgingBucketFilter) {
			result = result.filter((item) => item.agingBucket === selectedAgingBucketFilter)
		}

		if (searchQuery.trim()) {
			const q = searchQuery.toLowerCase()
			result = result.filter(
				(item) =>
					item.studentName?.toLowerCase().includes(q) ||
					item.nis?.toLowerCase().includes(q) ||
					item.feeName?.toLowerCase().includes(q) ||
					item.uniqueId?.toLowerCase().includes(q) ||
					item.subGrade?.toLowerCase().includes(q)
			)
		}

		result.sort((a, b) => {
			let valA = a[sortField as keyof ReportArrearItem]
			let valB = b[sortField as keyof ReportArrearItem]

			if (valA === undefined || valA === null) valA = ""
			if (valB === undefined || valB === null) valB = ""

			if (typeof valA === "number" && typeof valB === "number") {
				return sortOrder === "asc" ? valA - valB : valB - valA
			}

			const comp = String(valA).localeCompare(String(valB))
			return sortOrder === "asc" ? comp : -comp
		})

		return result
	}, [arrearsDetailsList, selectedAgingBucketFilter, searchQuery, sortField, sortOrder])

	const totalArrearAmount = useMemo(() => {
		if (selectedAgingBucketFilter && agingSummary?.buckets) {
			const bucketKey = selectedAgingBucketFilter as keyof typeof agingSummary.buckets
			return agingSummary.buckets[bucketKey]?.totalAmount ?? 0
		}
		return agingSummary?.totalAmount ?? 0
	}, [agingSummary, selectedAgingBucketFilter])

	const handleExport = () => {
		if (!filteredArrears.length) return
		const headers = [
			"No",
			"ID Tagihan",
			"NISP",
			"Nama Santri",
			"Jenis Tagihan",
			"Nominal Tagihan (Rp)",
			"Jatuh Tempo",
			"Hari Tertunggak",
			"Kategori Aging",
			"Kelas",
			"Subkelas",
		]
		const rows = filteredArrears.map((item, idx) => [
			idx + 1,
			item.uniqueId,
			item.nis,
			item.studentName,
			item.feeName,
			item.amount,
			item.dueDate ? dayjs(item.dueDate).format("YYYY-MM-DD") : "-",
			item.agingDays,
			item.agingBucket,
			item.grade,
			item.subGrade,
		])
		exportToCsv(`laporan-tunggakan-santri-${dayjs().format("YYYYMMDD-HHmm")}.csv`, headers, rows)
	}

	return (
		<div className="space-y-6 animate-in fade-in pb-12">
			{/* Aging Buckets Header Bar with CSV Export */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
				<div className="flex items-center gap-3">
					<h3 className="text-base font-bold text-slate-900 tracking-tight">
						Analisis Severity Penuaan Piutang (Aging Buckets)
					</h3>
					{selectedAgingBucketFilter && (
						<button
							type="button"
							onClick={() => setSelectedAgingBucketFilter(null)}
							className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors border border-rose-200"
						>
							Hapus Filter ({selectedAgingBucketFilter}) ✕
						</button>
					)}
				</div>

				<div className="flex items-center gap-2">
					<button
						type="button"
						onClick={handleExport}
						className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100 font-semibold rounded-xl text-xs transition-colors shadow-xs"
					>
						<Download className="w-4 h-4 text-emerald-600" />
						<span>Export CSV</span>
					</button>
				</div>
			</div>

			{/* Aging Severity Cards Grid */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				{/* Bucket 1: 0-30 days */}
				<button
					type="button"
					onClick={() =>
						setSelectedAgingBucketFilter(selectedAgingBucketFilter === "0-30" ? null : "0-30")
					}
					className={`group relative p-4 rounded-2xl text-left border transition-all duration-200 cursor-pointer shadow-xs overflow-hidden ${
						selectedAgingBucketFilter === "0-30"
							? "bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-400"
							: "bg-gradient-to-br from-emerald-50/40 via-white to-white border-slate-200/80 hover:border-emerald-300 hover:shadow-md"
					}`}
				>
					<div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500/80 rounded-t-2xl" />
					<div className="flex items-center justify-between gap-2">
						<div className="flex items-center gap-2">
							<div className="p-2 rounded-xl bg-emerald-100/80 text-emerald-700 group-hover:scale-105 transition-transform">
								<Clock className="w-4 h-4" />
							</div>
							<div>
								<span className="text-xs font-bold text-slate-800">≤ 30 Hari</span>
								<span className="block text-[10px] text-emerald-700 font-medium">Lancar / Baru</span>
							</div>
						</div>
						<span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
							{agingSummary?.buckets?.["0-30"]?.count ?? 0} Tagihan
						</span>
					</div>
					<div className="mt-3">
						<p className="text-2xl font-black text-slate-900 tracking-tight">
							{formatRupiah(agingSummary?.buckets?.["0-30"]?.totalAmount ?? 0)}
						</p>
						<p className="text-[11px] text-slate-500 mt-1">Jatuh tempo dalam 30 hari terakhir</p>
					</div>
				</button>

				{/* Bucket 2: 31-60 days */}
				<button
					type="button"
					onClick={() =>
						setSelectedAgingBucketFilter(selectedAgingBucketFilter === "31-60" ? null : "31-60")
					}
					className={`group relative p-4 rounded-2xl text-left border transition-all duration-200 cursor-pointer shadow-xs overflow-hidden ${
						selectedAgingBucketFilter === "31-60"
							? "bg-amber-50/80 border-amber-500 ring-2 ring-amber-400"
							: "bg-gradient-to-br from-amber-50/40 via-white to-white border-slate-200/80 hover:border-amber-300 hover:shadow-md"
					}`}
				>
					<div className="absolute top-0 left-0 right-0 h-1 bg-amber-500/80 rounded-t-2xl" />
					<div className="flex items-center justify-between gap-2">
						<div className="flex items-center gap-2">
							<div className="p-2 rounded-xl bg-amber-100/80 text-amber-700 group-hover:scale-105 transition-transform">
								<AlertCircle className="w-4 h-4" />
							</div>
							<div>
								<span className="text-xs font-bold text-slate-800">31 - 60 Hari</span>
								<span className="block text-[10px] text-amber-700 font-medium">Perhatian</span>
							</div>
						</div>
						<span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
							{agingSummary?.buckets?.["31-60"]?.count ?? 0} Tagihan
						</span>
					</div>
					<div className="mt-3">
						<p className="text-2xl font-black text-slate-900 tracking-tight">
							{formatRupiah(agingSummary?.buckets?.["31-60"]?.totalAmount ?? 0)}
						</p>
						<p className="text-[11px] text-slate-500 mt-1">Terlambat 1 s.d. 2 bulan</p>
					</div>
				</button>

				{/* Bucket 3: 61-90 days */}
				<button
					type="button"
					onClick={() =>
						setSelectedAgingBucketFilter(selectedAgingBucketFilter === "61-90" ? null : "61-90")
					}
					className={`group relative p-4 rounded-2xl text-left border transition-all duration-200 cursor-pointer shadow-xs overflow-hidden ${
						selectedAgingBucketFilter === "61-90"
							? "bg-orange-50/80 border-orange-500 ring-2 ring-orange-400"
							: "bg-gradient-to-br from-orange-50/40 via-white to-white border-slate-200/80 hover:border-orange-300 hover:shadow-md"
					}`}
				>
					<div className="absolute top-0 left-0 right-0 h-1 bg-orange-500/80 rounded-t-2xl" />
					<div className="flex items-center justify-between gap-2">
						<div className="flex items-center gap-2">
							<div className="p-2 rounded-xl bg-orange-100/80 text-orange-700 group-hover:scale-105 transition-transform">
								<AlertTriangle className="w-4 h-4" />
							</div>
							<div>
								<span className="text-xs font-bold text-slate-800">61 - 90 Hari</span>
								<span className="block text-[10px] text-orange-700 font-medium">Kritis</span>
							</div>
						</div>
						<span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-100 text-orange-800 border border-orange-200">
							{agingSummary?.buckets?.["61-90"]?.count ?? 0} Tagihan
						</span>
					</div>
					<div className="mt-3">
						<p className="text-2xl font-black text-slate-900 tracking-tight">
							{formatRupiah(agingSummary?.buckets?.["61-90"]?.totalAmount ?? 0)}
						</p>
						<p className="text-[11px] text-slate-500 mt-1">Terlambat 2 s.d. 3 bulan</p>
					</div>
				</button>

				{/* Bucket 4: > 90 days */}
				<button
					type="button"
					onClick={() =>
						setSelectedAgingBucketFilter(selectedAgingBucketFilter === "90+" ? null : "90+")
					}
					className={`group relative p-4 rounded-2xl text-left border transition-all duration-200 cursor-pointer shadow-xs overflow-hidden ${
						selectedAgingBucketFilter === "90+"
							? "bg-rose-50/80 border-rose-500 ring-2 ring-rose-400"
							: "bg-gradient-to-br from-rose-50/40 via-white to-white border-slate-200/80 hover:border-rose-300 hover:shadow-md"
					}`}
				>
					<div className="absolute top-0 left-0 right-0 h-1 bg-rose-500/80 rounded-t-2xl" />
					<div className="flex items-center justify-between gap-2">
						<div className="flex items-center gap-2">
							<div className="p-2 rounded-xl bg-rose-100/80 text-rose-700 group-hover:scale-105 transition-transform">
								<ShieldAlert className="w-4 h-4" />
							</div>
							<div>
								<span className="text-xs font-bold text-slate-800">&gt; 90 Hari</span>
								<span className="block text-[10px] text-rose-700 font-medium">Macet / High Risk</span>
							</div>
						</div>
						<span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
							{agingSummary?.buckets?.["90+"]?.count ?? 0} Tagihan
						</span>
					</div>
					<div className="mt-3">
						<p className="text-2xl font-black text-rose-600 tracking-tight">
							{formatRupiah(agingSummary?.buckets?.["90+"]?.totalAmount ?? 0)}
						</p>
						<p className="text-[11px] text-rose-400 mt-1">Terlambat lebih dari 3 bulan</p>
					</div>
				</button>
			</div>

			{/* Filter Bar */}
			<div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
				<div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 flex-1">
						<div>
							<label className="text-[11px] font-semibold text-slate-500 block mb-1">Tahun Ajaran</label>
							<Select
								value={selectedAcademicYearId ? String(selectedAcademicYearId) : "ALL"}
								onValueChange={(val) => setSelectedAcademicYearId(val === "ALL" ? undefined : Number(val))}
							>
								<SelectTrigger className="w-full h-9 text-xs bg-slate-50 border-slate-200 rounded-xl">
									<SelectValue placeholder="Semua Tahun" />
								</SelectTrigger>
								<SelectContent align="start">
									<SelectItem value="ALL">Semua Tahun</SelectItem>
									{academicYearsList.map((ay: any) => (
										<SelectItem key={ay.id} value={String(ay.id)}>
											{ay.year}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div>
							<label className="text-[11px] font-semibold text-slate-500 block mb-1">Pos / Jenis Biaya</label>
							<Select
								value={selectedAccountId ? String(selectedAccountId) : "ALL"}
								onValueChange={(val) => setSelectedAccountId(val === "ALL" ? undefined : Number(val))}
							>
								<SelectTrigger className="w-full h-9 text-xs bg-slate-50 border-slate-200 rounded-xl">
									<SelectValue placeholder="Semua Jenis Biaya" />
								</SelectTrigger>
								<SelectContent align="start">
									<SelectItem value="ALL">Semua Jenis Biaya</SelectItem>
									{accountsList.map((acc: any) => (
										<SelectItem key={acc.id} value={String(acc.id)}>
											{acc.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div>
							<label className="text-[11px] font-semibold text-slate-500 block mb-1">Tingkat Kelas</label>
							<Select
								value={selectedGrade || "ALL"}
								onValueChange={(val) => setSelectedGrade(val === "ALL" ? "" : val)}
							>
								<SelectTrigger className="w-full h-9 text-xs bg-slate-50 border-slate-200 rounded-xl">
									<SelectValue placeholder="Semua Kelas" />
								</SelectTrigger>
								<SelectContent align="start">
									<SelectItem value="ALL">Semua Kelas</SelectItem>
									{gradesList.map((g: any) => (
										<SelectItem key={g.id} value={String(g.id)}>
											Kelas {g.name || g.id}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div>
							<label className="text-[11px] font-semibold text-slate-500 block mb-1">Jatuh Tempo Dari</label>
							<Input
								type="date"
								value={dateStart}
								onChange={(e) => setDateStart(e.target.value)}
								className="h-9 text-xs bg-slate-50 border-slate-200 rounded-xl"
							/>
						</div>

						<div>
							<label className="text-[11px] font-semibold text-slate-500 block mb-1">Jatuh Tempo S.D.</label>
							<Input
								type="date"
								value={dateEnd}
								onChange={(e) => setDateEnd(e.target.value)}
								className="h-9 text-xs bg-slate-50 border-slate-200 rounded-xl"
							/>
						</div>
					</div>

					<div className="flex items-end gap-2 pt-2 lg:pt-0">
						<Button
							size="sm"
							onClick={handleApplyFilter}
							className="h-9 gap-1.5 bg-[var(--primary)] hover:bg-pink-700 text-white rounded-xl font-semibold shadow-xs"
						>
							<Filter className="w-3.5 h-3.5" />
							<span>Terapkan</span>
						</Button>
						<Button
							size="sm"
							variant="outline"
							onClick={handleResetFilter}
							className="h-9 gap-1.5 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
						>
							<RotateCcw className="w-3.5 h-3.5" />
							<span>Reset</span>
						</Button>
					</div>
				</div>
			</div>

			{/* Main Arrears Data Table Container */}
			<div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
				<div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white">
					<div className="flex items-center gap-2">
						<span className="text-xs font-bold text-slate-900">
							Daftar Tagihan Tertunggak ({filteredArrears.length})
						</span>
						<span className="text-xs text-slate-500">
							— Total Nilai: <strong className="text-rose-600 font-bold">{formatRupiah(totalArrearAmount)}</strong>
						</span>
					</div>

					<div className="w-full sm:w-72">
						<div className="relative">
							<Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
							<Input
								placeholder="Cari santri, NISP, tagihan..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="h-8 text-xs pl-8 bg-slate-50 border-slate-200 rounded-xl"
							/>
						</div>
					</div>
				</div>

				{isLoadingDetails ? (
					<div className="p-12 flex justify-center">
						<PageLoader />
					</div>
				) : filteredArrears.length === 0 ? (
					<div className="p-12 text-center text-xs text-slate-400">
						Tidak ada tagihan tertunggak yang cocok dengan kriteria filter saat ini.
					</div>
				) : (
					<div>
						<div className="overflow-x-auto">
							<table className="w-full text-xs text-left">
								<thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px] tracking-wider">
									<tr>
										<th className="py-3 px-4 w-12 text-center">No</th>
										<th className="py-3 px-4">NISP</th>
										<th className="py-3 px-4">Atas Nama</th>
										<th className="py-3 px-4">Nama Tagihan</th>
										<th className="py-3 px-4 text-right">Biaya Tertunggak</th>
										<th className="py-3 px-4">Jatuh Tempo</th>
										<th className="py-3 px-4 text-center">Aging Severity</th>
										<th className="py-3 px-4">Kelas</th>
										<th className="py-3 px-4">Subkelas</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-slate-100">
									{filteredArrears.map((row, idx) => {
										let badgeClass = "text-emerald-700 bg-emerald-50 border-emerald-200"
										let severityText = `${row.agingDays} Hari (≤30d)`

										if (row.agingBucket === "90+") {
											badgeClass = "text-rose-700 bg-rose-50 border-rose-200 font-bold"
											severityText = `${row.agingDays} Hari (>90d Macet)`
										} else if (row.agingBucket === "61-90") {
											badgeClass = "text-orange-700 bg-orange-50 border-orange-200 font-semibold"
											severityText = `${row.agingDays} Hari (Kritis)`
										} else if (row.agingBucket === "31-60") {
											badgeClass = "text-amber-700 bg-amber-50 border-amber-200"
											severityText = `${row.agingDays} Hari (Warning)`
										}

										return (
											<tr
												key={row.id}
												className={`hover:bg-slate-50/80 transition ${
													row.agingBucket === "90+" ? "bg-rose-50/20" : ""
												}`}
											>
												<td className="py-3.5 px-4 text-center font-medium text-slate-400">{(currentPage - 1) * limit + idx + 1}</td>
												<td className="py-3.5 px-4 font-mono text-slate-600 font-semibold">{row.nis}</td>
												<td className="py-3.5 px-4 font-bold text-slate-900">{row.studentName}</td>
												<td className="py-3.5 px-4 font-medium text-slate-700">{row.feeName}</td>
												<td className="py-3.5 px-4 text-right font-bold text-rose-600 text-sm">
													{formatRupiah(row.amount)}
												</td>
												<td className="py-3.5 px-4 text-slate-600 font-medium">
													{row.dueDate ? dayjs(row.dueDate).format("DD/MM/YYYY") : "-"}
												</td>
												<td className="py-3.5 px-4 text-center">
													<Badge variant="outline" className={`text-[10px] ${badgeClass}`}>
														{severityText}
													</Badge>
												</td>
												<td className="py-3.5 px-4 text-slate-700 font-medium">{row.grade}</td>
												<td className="py-3.5 px-4 text-slate-500">{row.subGrade || "-"}</td>
											</tr>
										)
									})}
								</tbody>
							</table>
						</div>

						{/* Santri Style Pagination Footer */}
						<div className="bg-white px-5 py-3.5 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
							<div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
								<div className="flex items-center gap-2">
									<span className="text-slate-500 font-medium">Tampilkan:</span>
									<select
										value={limit}
										onChange={(e) => {
											const newLimit = Number(e.target.value)
											setLimit(newLimit)
											setPage(1)
											setAppliedFilters((prev) => ({ ...prev, page: 1, limit: newLimit }))
										}}
										className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 focus:outline-hidden"
									>
										<option value={10}>10 tagihan / hal</option>
										<option value={20}>20 tagihan / hal</option>
										<option value={50}>50 tagihan / hal</option>
										<option value={100}>100 tagihan / hal</option>
									</select>
								</div>

								<span className="text-slate-500 font-medium">
									Menampilkan <strong className="text-slate-900 font-bold">{filteredArrears.length}</strong> dari <strong className="text-slate-900 font-bold">{totalItems}</strong> tagihan
								</span>
							</div>

							<div className="flex items-center gap-1.5">
								<button
									type="button"
									disabled={currentPage <= 1}
									onClick={() => handlePageChange(currentPage - 1)}
									className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl text-xs transition-colors disabled:opacity-40 disabled:hover:bg-slate-50 cursor-pointer disabled:cursor-not-allowed"
								>
									<ChevronLeft className="w-4 h-4" />
									<span>Sebelumnya</span>
								</button>

								{generatePageNumbers(currentPage, totalPages).map((p, idx) => (
									p === "..." ? (
										<span key={`ellipsis-${idx}`} className="px-2 py-1 text-slate-400 font-semibold">...</span>
									) : (
										<button
											key={`page-${p}`}
											type="button"
											onClick={() => handlePageChange(Number(p))}
											className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
												currentPage === p
													? "bg-[var(--primary)] text-white shadow-xs font-bold"
													: "bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100"
											}`}
										>
											{p}
										</button>
									)
								))}

								<button
									type="button"
									disabled={currentPage >= totalPages}
									onClick={() => handlePageChange(currentPage + 1)}
									className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl text-xs transition-colors disabled:opacity-40 disabled:hover:bg-slate-50 cursor-pointer disabled:cursor-not-allowed"
								>
									<span>Selanjutnya</span>
									<ChevronRight className="w-4 h-4" />
								</button>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}

export default ReportArrearsPage

