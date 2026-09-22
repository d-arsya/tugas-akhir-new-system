import { useState, useMemo } from "react"
import type { JSX } from "react"
import { createFileRoute, Link } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { adminApi, type ReportIncomeItem, type ReportIncomeRecapItem } from "@/lib/api"
import { RojaCard, PageLoader, Button, Input, Badge, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@roja/ui"
import { AdminPageHeader } from "@/components/layout/admin-page-header"
import { formatRupiah } from "@roja/utils"
import dayjs from "dayjs"
import {
	Receipt,
	Download,
	Search,
	Filter,
	RotateCcw,
	Calendar,
	TrendingUp,
	Layers,
	ChevronLeft,
	ArrowUpDown,
	DollarSign,
} from "lucide-react"
import {
	ResponsiveContainer,
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
} from "recharts"

export const Route = createFileRoute("/_auth/reports/income")({
	component: ReportIncomePage,
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

function ReportIncomePage(): JSX.Element {
	const [activeTab, setActiveTab] = useState<"detail" | "recap">("detail")

	// Filter state
	const [dateStart, setDateStart] = useState<string>("")
	const [dateEnd, setDateEnd] = useState<string>("")
	const [selectedGrade, setSelectedGrade] = useState<string>("")
	const [selectedSubGrade, setSelectedSubGrade] = useState<string>("")
	const [appliedFilters, setAppliedFilters] = useState<{
		dateStart?: string
		dateEnd?: string
		grade?: string
		subGrade?: string
	}>({})

	// Search & Table Sorting state
	const [searchQuery, setSearchQuery] = useState<string>("")
	const [sortField, setSortField] = useState<string>("paidAt")
	const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

	// Fetch Grade options
	const { data: grades } = useQuery({
		queryKey: ["admin-grades"],
		queryFn: () => adminApi.getGrades(),
	})

	// Fetch Income Detail Data
	const { data: incomeDetails, isLoading: isLoadingDetails, refetch: refetchDetails } = useQuery({
		queryKey: ["admin-reports-income", appliedFilters],
		queryFn: () => adminApi.getReportsIncome(appliedFilters),
	})

	// Fetch Income Recap Data
	const { data: incomeRecaps, isLoading: isLoadingRecaps, refetch: refetchRecaps } = useQuery({
		queryKey: ["admin-reports-income-recap", appliedFilters],
		queryFn: () => adminApi.getReportsIncomeRecap(appliedFilters),
	})

	const gradesList = useMemo(() => {
		if (Array.isArray(grades)) return grades
		if (Array.isArray((grades as any)?.items)) return (grades as any).items
		if (Array.isArray((grades as any)?.data)) return (grades as any).data
		return []
	}, [grades])

	const incomeDetailsList = useMemo(() => {
		if (Array.isArray(incomeDetails)) return incomeDetails
		if (Array.isArray((incomeDetails as any)?.items)) return (incomeDetails as any).items
		if (Array.isArray((incomeDetails as any)?.data)) return (incomeDetails as any).data
		return []
	}, [incomeDetails])

	const incomeRecapsList = useMemo(() => {
		if (Array.isArray(incomeRecaps)) return incomeRecaps
		if (Array.isArray((incomeRecaps as any)?.items)) return (incomeRecaps as any).items
		if (Array.isArray((incomeRecaps as any)?.data)) return (incomeRecaps as any).data
		return []
	}, [incomeRecaps])

	const handleApplyFilter = () => {
		setAppliedFilters({
			dateStart: dateStart || undefined,
			dateEnd: dateEnd || undefined,
			grade: selectedGrade || undefined,
			subGrade: selectedSubGrade || undefined,
		})
	}

	const handleResetFilter = () => {
		setDateStart("")
		setDateEnd("")
		setSelectedGrade("")
		setSelectedSubGrade("")
		setAppliedFilters({})
	}

	// Filtered and Sorted Detail List
	const filteredDetails = useMemo(() => {
		let result = [...incomeDetailsList]

		if (searchQuery.trim()) {
			const q = searchQuery.toLowerCase()
			result = result.filter(
				(item) =>
					item.studentName?.toLowerCase().includes(q) ||
					item.nis?.toLowerCase().includes(q) ||
					item.transactionCode?.toLowerCase().includes(q) ||
					item.feeName?.toLowerCase().includes(q) ||
					item.note?.toLowerCase().includes(q)
			)
		}

		result.sort((a, b) => {
			let valA = a[sortField as keyof ReportIncomeItem]
			let valB = b[sortField as keyof ReportIncomeItem]

			if (valA === undefined || valA === null) valA = ""
			if (valB === undefined || valB === null) valB = ""

			if (typeof valA === "number" && typeof valB === "number") {
				return sortOrder === "asc" ? valA - valB : valB - valA
			}

			const comp = String(valA).localeCompare(String(valB))
			return sortOrder === "asc" ? comp : -comp
		})

		return result
	}, [incomeDetailsList, searchQuery, sortField, sortOrder])

	// Calculate Summary Metrics
	const totalIncome = useMemo(() => {
		return incomeDetailsList.reduce((sum, item) => sum + item.amount, 0)
	}, [incomeDetailsList])

	const totalTransactions = incomeDetailsList.length
	const averagePerTx = totalTransactions > 0 ? Math.round(totalIncome / totalTransactions) : 0

	// Chart Data (Top fee types)
	const chartData = useMemo(() => {
		if (incomeRecapsList.length === 0) return []
		return incomeRecapsList.slice(0, 6).map((item) => ({
			name: item.feeName.length > 18 ? item.feeName.substring(0, 16) + "..." : item.feeName,
			fullName: item.feeName,
			total: item.totalAmount,
			count: item.count,
		}))
	}, [incomeRecapsList])


	const handleExportDetail = () => {
		if (!filteredDetails.length) return
		const headers = ["No", "ID Transaksi", "Tanggal Bayar", "Atas Nama", "NISP", "Pos Biaya", "Nominal (Rp)", "Keterangan", "Kelas", "Subkelas"]
		const rows = filteredDetails.map((item, idx) => [
			idx + 1,
			item.transactionCode,
			item.paidAt ? dayjs(item.paidAt).format("YYYY-MM-DD HH:mm") : "-",
			item.studentName,
			item.nis,
			item.feeName,
			item.amount,
			item.note,
			item.grade,
			item.subGrade,
		])
		exportToCsv(`laporan-pemasukan-rincian-${dayjs().format("YYYYMMDD-HHmm")}.csv`, headers, rows)
	}

	const handleExportRecap = () => {
		if (!incomeRecaps?.length) return
		const headers = ["No", "Nama Pos Biaya", "Total Uang Masuk (Rp)", "Jumlah Transaksi"]
		const rows = incomeRecaps.map((item, idx) => [
			idx + 1,
			item.feeName,
			item.totalAmount,
			item.count,
		])
		exportToCsv(`laporan-pemasukan-rekapitulasi-${dayjs().format("YYYYMMDD-HHmm")}.csv`, headers, rows)
	}

	return (
		<div className="space-y-6 pb-12">
			{/* Header with Back button */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div className="space-y-1">
					<Link
						to="/dashboard"
						className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-600 transition"
					>
						<ChevronLeft className="w-4 h-4" />
						<span>Kembali ke Dashboard</span>
					</Link>
					<AdminPageHeader
						title="Laporan Penerimaan Pembayaran"
						subtitle="Rincian arus kas masuk, pembayaran tagihan santri, dan rekapitulasi pos biaya."
					/>
				</div>

				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={activeTab === "detail" ? handleExportDetail : handleExportRecap}
						className="gap-2 bg-white text-slate-700 hover:bg-slate-50 border-slate-200"
					>
						<Download className="w-4 h-4 text-emerald-600" />
						<span>Export CSV</span>
					</Button>
				</div>
			</div>

			{/* KPI Summary Banner */}
			<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
				<RojaCard className="p-4 bg-teal-800 text-white rounded-xl border-0 shadow-xs">
					<div className="flex items-center justify-between">
						<span className="text-xs font-semibold text-teal-100 uppercase tracking-wider">Total Uang Masuk</span>
						<div className="w-8 h-8 rounded-lg bg-teal-700 flex items-center justify-center">
							<DollarSign className="w-4 h-4 text-white" />
						</div>
					</div>
					<div className="mt-2">
						<span className="text-2xl font-bold text-white">{formatRupiah(totalIncome)}</span>
						<p className="text-[11px] text-teal-100/80 mt-0.5">Akumulasi penerimaan sesuai filter</p>
					</div>
				</RojaCard>

				<RojaCard className="p-5 bg-white border-slate-200/80 shadow-xs">
					<div className="flex items-center justify-between">
						<span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Transaksi</span>
						<div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
							<Receipt className="w-4 h-4 text-blue-600" />
						</div>
					</div>
					<div className="mt-3">
						<span className="text-2xl font-bold text-slate-900">{totalTransactions}</span>
						<p className="text-[11px] text-slate-400 mt-0.5">Kuitansi pembayaran valid</p>
					</div>
				</RojaCard>

				<RojaCard className="p-5 bg-white border-slate-200/80 shadow-xs">
					<div className="flex items-center justify-between">
						<span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Rata-Rata Transaksi</span>
						<div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center">
							<TrendingUp className="w-4 h-4 text-purple-600" />
						</div>
					</div>
					<div className="mt-3">
						<span className="text-2xl font-bold text-slate-900">{formatRupiah(averagePerTx)}</span>
						<p className="text-[11px] text-slate-400 mt-0.5">Nilai rata-rata per transaksi</p>
					</div>
				</RojaCard>
			</div>

			{/* Filter Bar */}
			<RojaCard className="p-4 border-slate-200/80 shadow-xs">
				<div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 flex-1">
						<div>
							<label className="text-[11px] font-semibold text-slate-500 block mb-1">Dari Tanggal</label>
							<Input
								type="date"
								value={dateStart}
								onChange={(e) => setDateStart(e.target.value)}
								className="h-9 text-xs"
							/>
						</div>

						<div>
							<label className="text-[11px] font-semibold text-slate-500 block mb-1">Sampai Tanggal</label>
							<Input
								type="date"
								value={dateEnd}
								onChange={(e) => setDateEnd(e.target.value)}
								className="h-9 text-xs"
							/>
						</div>

						<div>
							<label className="text-[11px] font-semibold text-slate-500 block mb-1">Tingkat Kelas</label>
							<Select
								value={selectedGrade || "ALL"}
								onValueChange={(val) => setSelectedGrade(val === "ALL" ? "" : val)}
							>
								<SelectTrigger className="w-full h-9 text-xs bg-white border-slate-200">
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
							<label className="text-[11px] font-semibold text-slate-500 block mb-1">Subkelas / Ruang</label>
							<Input
								placeholder="Contoh: A, B, 7A"
								value={selectedSubGrade}
								onChange={(e) => setSelectedSubGrade(e.target.value)}
								className="h-9 text-xs"
							/>
						</div>
					</div>

					<div className="flex items-end gap-2 pt-2 lg:pt-0">
						<Button
							size="sm"
							onClick={handleApplyFilter}
							className="h-9 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
						>
							<Filter className="w-3.5 h-3.5" />
							<span>Terapkan</span>
						</Button>
						<Button
							size="sm"
							variant="outline"
							onClick={handleResetFilter}
							className="h-9 gap-1.5 text-slate-600 hover:bg-slate-100"
						>
							<RotateCcw className="w-3.5 h-3.5" />
							<span>Reset</span>
						</Button>
					</div>
				</div>
			</RojaCard>

			{/* Visual Distribution Chart */}
			{chartData.length > 0 && (
				<RojaCard
					title="Distribusi Penerimaan per Pos Biaya"
					subtitle="Perbandingan pendapatan terbesar berdasarkan kategori akun biaya"
					className="border-slate-200/80 shadow-xs"
				>
					<div className="h-64 w-full mt-2">
						<ResponsiveContainer width="100%" height="100%">
							<BarChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 25 }}>
								<CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
								<XAxis
									dataKey="name"
									stroke="#94a3b8"
									fontSize={11}
									interval={0}
									angle={-15}
									textAnchor="end"
								/>
								<YAxis
									stroke="#94a3b8"
									fontSize={11}
									tickFormatter={(val) => `${(val / 1000000).toFixed(1)}jt`}
								/>
								<Tooltip
									formatter={(val: any) => [formatRupiah(Number(val)), "Total Pemasukan"]}
									contentStyle={{
										backgroundColor: "#1e293b",
										borderRadius: "10px",
										color: "#fff",
										fontSize: "12px",
										border: "none",
									}}
								/>
								<Bar dataKey="total" name="Nominal Masuk" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={45} />
							</BarChart>
						</ResponsiveContainer>
					</div>
				</RojaCard>
			)}

			{/* Tab Switcher & Data Table */}
			<RojaCard className="p-0 border-slate-200/80 shadow-xs overflow-hidden">
				{/* Tabs Navigation */}
				<div className="flex items-center justify-between border-b border-slate-200 px-6 pt-4">
					<div className="flex items-center gap-6">
						<button
							onClick={() => setActiveTab("detail")}
							className={`pb-3 text-sm font-semibold border-b-2 transition ${
								activeTab === "detail"
									? "border-emerald-600 text-emerald-700"
									: "border-transparent text-slate-500 hover:text-slate-700"
							}`}
						>
							Rincian Transaksi ({filteredDetails.length})
						</button>
						<button
							onClick={() => setActiveTab("recap")}
							className={`pb-3 text-sm font-semibold border-b-2 transition ${
								activeTab === "recap"
									? "border-emerald-600 text-emerald-700"
									: "border-transparent text-slate-500 hover:text-slate-700"
							}`}
						>
							Rekapitulasi Pos Biaya ({incomeRecaps?.length ?? 0})
						</button>
					</div>

					{activeTab === "detail" && (
						<div className="pb-3 w-64">
							<div className="relative">
								<Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
								<Input
									placeholder="Cari santri, NISP, kuitansi..."
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className="h-8 text-xs pl-8"
								/>
							</div>
						</div>
					)}
				</div>

				{/* Detail Tab Content */}
				{activeTab === "detail" ? (
					isLoadingDetails ? (
						<div className="p-12 flex justify-center">
							<PageLoader />
						</div>
					) : filteredDetails.length === 0 ? (
						<div className="p-12 text-center text-xs text-slate-400">
							Tidak ada transaksi pembayaran yang cocok dengan kriteria filter.
						</div>
					) : (
						<div className="overflow-x-auto">
							<table className="w-full text-xs text-left">
								<thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px] tracking-wider">
									<tr>
										<th className="py-3 px-4 w-12 text-center">No</th>
										<th className="py-3 px-4">ID Transaksi</th>
										<th className="py-3 px-4">Tanggal Bayar</th>
										<th className="py-3 px-4">Atas Nama</th>
										<th className="py-3 px-4">NISP</th>
										<th className="py-3 px-4">Pos Biaya</th>
										<th className="py-3 px-4 text-right">Nominal</th>
										<th className="py-3 px-4">Kelas</th>
										<th className="py-3 px-4">Keterangan</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-slate-100">
									{filteredDetails.map((row, idx) => (
										<tr key={row.id} className="hover:bg-slate-50/80 transition">
											<td className="py-3 px-4 text-center font-medium text-slate-400">{idx + 1}</td>
											<td className="py-3 px-4 font-mono font-semibold text-slate-800">
												{row.transactionCode}
											</td>
											<td className="py-3 px-4 text-slate-600">
												{row.paidAt ? dayjs(row.paidAt).format("DD/MM/YYYY HH:mm") : "-"}
											</td>
											<td className="py-3 px-4 font-medium text-slate-900">{row.studentName}</td>
											<td className="py-3 px-4 font-mono text-slate-500">{row.nis}</td>
											<td className="py-3 px-4">
												<Badge variant="outline" className="text-[10px] text-emerald-700 bg-emerald-50 border-emerald-200">
													{row.feeName}
												</Badge>
											</td>
											<td className="py-3 px-4 text-right font-bold text-slate-900">
												{formatRupiah(row.amount)}
											</td>
											<td className="py-3 px-4 text-slate-600">
												{row.grade} {row.subGrade && row.subGrade !== "-" ? `(${row.subGrade})` : ""}
											</td>
											<td className="py-3 px-4 text-slate-500 max-w-xs truncate">{row.note}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)
				) : (
					/* Recap Tab Content */
					isLoadingRecaps ? (
						<div className="p-12 flex justify-center">
							<PageLoader />
						</div>
					) : incomeRecapsList.length === 0 ? (
						<div className="p-12 text-center text-xs text-slate-400">
							Tidak ada rekapitulasi data pos biaya yang tersedia.
						</div>
					) : (
						<div className="overflow-x-auto">
							<table className="w-full text-xs text-left">
								<thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px] tracking-wider">
									<tr>
										<th className="py-3 px-4 w-12 text-center">No</th>
										<th className="py-3 px-4">Nama Pos Biaya</th>
										<th className="py-3 px-4 text-center">Jumlah Transaksi</th>
										<th className="py-3 px-4 text-right">Total Uang Masuk</th>
										<th className="py-3 px-4 text-right">Kontribusi</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-slate-100">
									{incomeRecapsList.map((item, idx) => {

										const pct = totalIncome > 0 ? ((item.totalAmount / totalIncome) * 100).toFixed(1) : "0"
										return (
											<tr key={idx} className="hover:bg-slate-50/80 transition">
												<td className="py-3.5 px-4 text-center font-medium text-slate-400">{idx + 1}</td>
												<td className="py-3.5 px-4 font-semibold text-slate-900">{item.feeName}</td>
												<td className="py-3.5 px-4 text-center font-medium text-slate-600">
													{item.count} Transaksi
												</td>
												<td className="py-3.5 px-4 text-right font-bold text-emerald-600 text-sm">
													{formatRupiah(item.totalAmount)}
												</td>
												<td className="py-3.5 px-4 text-right">
													<Badge variant="outline" className="text-[11px] text-slate-700 bg-slate-100 border-slate-200">
														{pct}%
													</Badge>
												</td>
											</tr>
										)
									})}
								</tbody>
							</table>
						</div>
					)
				)}
			</RojaCard>
		</div>
	)
}

export default ReportIncomePage
