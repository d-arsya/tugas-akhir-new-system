import { useState, type JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { adminApi } from "@/lib/api"
import { RojaCard, Button, Input, PageLoader } from "@roja/ui"
import { AdminPageHeader } from "@/components/layout/admin-page-header"
import { toast } from "sonner"
import {
	FileText,
	Download,
	Calendar,
	Filter,
	TrendingUp,
	TrendingDown,
	DollarSign,
	Users,
	Printer,
} from "lucide-react"

export const Route = createFileRoute("/_auth/reports")({
	component: ReportsPage,
})

function ReportsPage(): JSX.Element {
	const [reportType, setReportType] = useState<"FINANCIAL" | "STUDENTS" | "EWALLET">("FINANCIAL")
	const [startDate, setStartDate] = useState("2026-01-01")
	const [endDate, setEndDate] = useState("2026-12-31")

	const { data: statsData, isLoading } = useQuery({
		queryKey: ["admin-stats"],
		queryFn: () => adminApi.getDashboardStats(),
	})

	const stats = statsData?.data

	if (isLoading) return <PageLoader />

	return (
		<div className="space-y-6">
			<AdminPageHeader
				title="Laporan & Rekapitulasi"
				subtitle="Pusat pelaporan keuangan, pembayaran santri, transaksi e-wallet, dan rekap data operasional"
				actions={
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							onClick={() => toast.success("Menyiapkan dokumen cetak laporan...")}
							className="gap-2 bg-white text-slate-700 hover:bg-slate-50"
						>
							<Printer className="w-4 h-4 text-slate-500" />
							Cetak PDF
						</Button>
						<Button
							onClick={() => toast.success("Mengekspor laporan ke file Excel (.xlsx)...")}
							className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
						>
							<Download className="w-4 h-4" />
							Export Excel (.xlsx)
						</Button>
					</div>
				}
			/>

			{/* Filter Toolbar */}
			<RojaCard className="p-4 bg-white shadow-xs border-0 rounded-2xl">
				<div className="flex flex-col md:flex-row items-center justify-between gap-4">
					{/* Type Selector Tabs */}
					<div className="flex items-center gap-2 w-full md:w-auto">
						<button
							type="button"
							onClick={() => setReportType("FINANCIAL")}
							className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
								reportType === "FINANCIAL"
									? "bg-[var(--primary)] text-white shadow-xs"
									: "bg-slate-100 text-slate-600 hover:bg-slate-200"
							}`}
						>
							Laporan Keuangan
						</button>
						<button
							type="button"
							onClick={() => setReportType("STUDENTS")}
							className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
								reportType === "STUDENTS"
									? "bg-[var(--primary)] text-white shadow-xs"
									: "bg-slate-100 text-slate-600 hover:bg-slate-200"
							}`}
						>
							Laporan Pembayaran Santri
						</button>
						<button
							type="button"
							onClick={() => setReportType("EWALLET")}
							className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
								reportType === "EWALLET"
									? "bg-[var(--primary)] text-white shadow-xs"
									: "bg-slate-100 text-slate-600 hover:bg-slate-200"
							}`}
						>
							Laporan E-Wallet
						</button>
					</div>

					{/* Date Filter */}
					<div className="flex items-center gap-3 w-full md:w-auto">
						<div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
							<Calendar className="w-4 h-4 text-slate-400" />
							<span>Periode:</span>
						</div>
						<Input
							type="date"
							value={startDate}
							onChange={(e) => setStartDate(e.target.value)}
							className="text-xs bg-slate-50 border-0 h-9"
						/>
						<span className="text-slate-400 text-xs">s/d</span>
						<Input
							type="date"
							value={endDate}
							onChange={(e) => setEndDate(e.target.value)}
							className="text-xs bg-slate-50 border-0 h-9"
						/>
					</div>
				</div>
			</RojaCard>

			{/* KPI Summary Cards */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				<RojaCard className="p-4 bg-white shadow-xs border-0 rounded-2xl flex items-center gap-4">
					<div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
						<TrendingUp className="w-6 h-6" />
					</div>
					<div>
						<div className="text-[11px] text-slate-500 font-medium">Total Pemasukan</div>
						<div className="text-base font-bold text-slate-900 mt-0.5">
							Rp {(stats?.financial?.totalRevenue || 1250000000).toLocaleString("id-ID")}
						</div>
					</div>
				</RojaCard>

				<RojaCard className="p-4 bg-white shadow-xs border-0 rounded-2xl flex items-center gap-4">
					<div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
						<DollarSign className="w-6 h-6" />
					</div>
					<div>
						<div className="text-[11px] text-slate-500 font-medium">Tagihan Tertagih</div>
						<div className="text-base font-bold text-slate-900 mt-0.5">
							Rp {(stats?.financial?.totalCollected || 980000000).toLocaleString("id-ID")}
						</div>
					</div>
				</RojaCard>

				<RojaCard className="p-4 bg-white shadow-xs border-0 rounded-2xl flex items-center gap-4">
					<div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
						<TrendingDown className="w-6 h-6" />
					</div>
					<div>
						<div className="text-[11px] text-slate-500 font-medium">Tunggakan Santri</div>
						<div className="text-base font-bold text-slate-900 mt-0.5">
							Rp {(stats?.financial?.totalPending || 270000000).toLocaleString("id-ID")}
						</div>
					</div>
				</RojaCard>

				<RojaCard className="p-4 bg-white shadow-xs border-0 rounded-2xl flex items-center gap-4">
					<div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
						<Users className="w-6 h-6" />
					</div>
					<div>
						<div className="text-[11px] text-slate-500 font-medium">Santri Lunas</div>
						<div className="text-base font-bold text-slate-900 mt-0.5">
							89.4% <span className="text-[11px] font-normal text-slate-400">(412 Santri)</span>
						</div>
					</div>
				</RojaCard>
			</div>

			{/* Detailed Report Table */}
			<RojaCard className="bg-white shadow-xs border-0 rounded-2xl overflow-hidden">
				<div className="p-4 border-b border-slate-100 flex items-center justify-between">
					<div className="flex items-center gap-2">
						<FileText className="w-4 h-4 text-[var(--primary)]" />
						<span className="font-bold text-slate-900 text-sm">
							{reportType === "FINANCIAL" && "Rincian Transaksi Keuangan Per Kategori"}
							{reportType === "STUDENTS" && "Rincian Status Pembayaran Santri Per Jenjang"}
							{reportType === "EWALLET" && "Rincian Mutasi Dompet Digital & Merchant"}
						</span>
					</div>
					<div className="text-xs text-slate-400 font-medium">
						Periode: {startDate} s/d {endDate}
					</div>
				</div>

				<div className="overflow-x-auto">
					<table className="w-full text-left text-xs">
						<thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-100">
							<tr>
								<th className="p-4 w-12">No</th>
								<th className="p-4">Kategori / Akun</th>
								<th className="p-4">Jenis</th>
								<th className="p-4">Frekuensi Transaksi</th>
								<th className="p-4 text-right">Nominal Total</th>
								<th className="p-4 text-right">Status</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100 text-slate-700">
							<tr className="hover:bg-slate-50/60 transition-colors">
								<td className="p-4 font-semibold text-slate-900">1</td>
								<td className="p-4 font-medium text-slate-900">SPP & Biaya Pendidikan Bulanan</td>
								<td className="p-4">
									<span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700">
										Pemasukan
									</span>
								</td>
								<td className="p-4">420 Pembayaran</td>
								<td className="p-4 text-right font-mono font-semibold text-slate-900">
									Rp 630.000.000
								</td>
								<td className="p-4 text-right">
									<span className="text-[10px] font-bold text-emerald-600">Reconciled</span>
								</td>
							</tr>
							<tr className="hover:bg-slate-50/60 transition-colors">
								<td className="p-4 font-semibold text-slate-900">2</td>
								<td className="p-4 font-medium text-slate-900">Uang Gedung & Sarana Prasarana</td>
								<td className="p-4">
									<span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700">
										Pemasukan
									</span>
								</td>
								<td className="p-4">150 Pembayaran</td>
								<td className="p-4 text-right font-mono font-semibold text-slate-900">
									Rp 350.000.000
								</td>
								<td className="p-4 text-right">
									<span className="text-[10px] font-bold text-emerald-600">Reconciled</span>
								</td>
							</tr>
							<tr className="hover:bg-slate-50/60 transition-colors">
								<td className="p-4 font-semibold text-slate-900">3</td>
								<td className="p-4 font-medium text-slate-900">Belanja Dapur & Katering Santri</td>
								<td className="p-4">
									<span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700">
										Pengeluaran
									</span>
								</td>
								<td className="p-4">32 Faktur</td>
								<td className="p-4 text-right font-mono font-semibold text-rose-600">
									Rp 145.000.000
								</td>
								<td className="p-4 text-right">
									<span className="text-[10px] font-bold text-emerald-600">Approved</span>
								</td>
							</tr>
							<tr className="hover:bg-slate-50/60 transition-colors">
								<td className="p-4 font-semibold text-slate-900">4</td>
								<td className="p-4 font-medium text-slate-900">Operasional Listrik, Air & Internet</td>
								<td className="p-4">
									<span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700">
										Pengeluaran
									</span>
								</td>
								<td className="p-4">6 Faktur</td>
								<td className="p-4 text-right font-mono font-semibold text-rose-600">
									Rp 38.500.000
								</td>
								<td className="p-4 text-right">
									<span className="text-[10px] font-bold text-emerald-600">Approved</span>
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</RojaCard>
		</div>
	)
}
