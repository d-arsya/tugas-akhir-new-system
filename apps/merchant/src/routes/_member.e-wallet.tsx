import { type JSX, useState, useEffect } from "react"
import { createFileRoute, Link, useLocation, Outlet } from "@tanstack/react-router"
import { Plus, Download, LogOut, Settings, Calendar, Eye, RefreshCw, ChevronLeft, ChevronRight, QrCode, ArrowRight } from "lucide-react"
import {
	RojaCard,
	Button,
	Input,
	Select,
	SelectTrigger,
	SelectValue,
	SelectContent,
	SelectItem,
	PinChallengeGate,
} from "@roja/ui"
import { toast } from "sonner"
import { formatRupiah, formatDate } from "@roja/utils"

import useEwalletStore from "@/stores/ewalletStore"
import {
	useMerchantEwalletStatus,
	useMerchantEwalletDashboard,
	useLoginEwalletPinMutation,
} from "@/hooks/use-merchant-queries"
import { useDebounce } from "@/hooks/use-debounce"
import StatusBadge from "@/components/StatusBadge"
import TransactionModal from "@/components/transactions/TransactionModal"

export const Route = createFileRoute("/_member/e-wallet")({
	component: EwalletDashboardRouteComponent,
})

function EwalletDashboardRouteComponent(): JSX.Element {
	const location = useLocation()
	const { setPinAuthenticated, isPinAuthenticated } = useEwalletStore()

	const [page, setPage] = useState(1)
	const [limit, setLimit] = useState(10)
	const [statusFilter, setStatusFilter] = useState("all")
	const [searchQuery, setSearchQuery] = useState("")
	const [startDate, setStartDate] = useState("")
	const [endDate, setEndDate] = useState("")
	const [isModalOpen, setIsModalOpen] = useState(false)

	const debouncedSearch = useDebounce(searchQuery, 400)

	const isSubRoute = location.pathname !== "/e-wallet" && location.pathname !== "/e-wallet/"

	// Check status
	const { data: statusData, isLoading: isLoadingStatus } = useMerchantEwalletStatus()

	// Query dashboard data
	const {
		data: dashboardData,
		isLoading: isLoadingDashboard,
		refetch,
	} = useMerchantEwalletDashboard(
		{
			page,
			limit,
			status: statusFilter === "all" ? undefined : statusFilter,
			search: debouncedSearch || undefined,
			dateStart: startDate || undefined,
			dateEnd: endDate || undefined,
		},
		isPinAuthenticated && !isSubRoute,
	)

	const loginPinMutation = useLoginEwalletPinMutation()

	if (isSubRoute) {
		return <Outlet />
	}

	if (isLoadingStatus) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[40vh] space-y-3">
				<div className="w-8 h-8 rounded-full border-2 border-[#8dc31e] border-t-transparent animate-spin" />
				<p className="text-xs text-slate-500 font-medium">Memeriksa status dompet digital...</p>
			</div>
		)
	}

	if (statusData && !statusData.hasEwallet) {
		return (
			<div className="space-y-6 max-w-md mx-auto py-8 text-center">
				<RojaCard className="p-8 rounded-2xl border border-slate-200/80 space-y-4 shadow-sm">
					<div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#8dc31e]/10 text-[#8dc31e]">
						<Plus className="w-7 h-7" />
					</div>
					<div>
						<h3 className="text-lg font-bold text-slate-800">Aktivasi E-Wallet Merchant</h3>
						<p className="text-xs text-slate-500 mt-1">
							Anda belum mengaktifkan layanan dompet digital merchant.
						</p>
					</div>
					<Link to="/e-wallet/create">
						<Button className="w-full h-11 bg-[#8dc31e] hover:bg-[#8dc31e]/90 text-white font-bold text-xs rounded-xl cursor-pointer shadow-sm">
							Aktifkan Sekarang
						</Button>
					</Link>
				</RojaCard>
			</div>
		)
	}

	if (statusData && !statusData.isActive) {
		return (
			<div className="space-y-6 max-w-md mx-auto py-8 text-center">
				<RojaCard className="p-8 rounded-2xl border border-rose-200 space-y-4 shadow-sm">
					<h3 className="text-lg font-bold text-rose-600">E-Wallet Nonaktif</h3>
					<p className="text-xs text-slate-500">
						Layanan dompet digital merchant dinonaktifkan oleh administrator.
					</p>
					<Link to="/e-wallet/inactive">
						<Button variant="outline" className="w-full h-10 text-xs rounded-xl">
							Lihat Informasi
						</Button>
					</Link>
				</RojaCard>
			</div>
		)
	}

	if (!isPinAuthenticated) {
		return (
			<PinChallengeGate
				title="Masukkan PIN E-Wallet Merchant"
				description="Memastikan bahwa benar dompet ini milik merchant Anda."
				onSubmitPin={async (pin) => {
					await loginPinMutation.mutateAsync(pin)
					setPinAuthenticated(true)
					toast.success("PIN Terverifikasi", { description: "Dompet digital terbuka." })
				}}
			/>
		)
	}

	const transactions = dashboardData?.transactions ?? []
	const totalSaldo = dashboardData?.totalBalance ?? dashboardData?.totalSaldo ?? 0
	const meta = dashboardData?.meta

	return (
		<div className="space-y-6">
			{/* Top Bar: Green Saldo Widget (Left) + 4 Action Buttons (Right) */}
			<div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
				{/* 1:1 Legacy Total Saldo Widget (`tbr_widget-info`) */}
				<div className="bg-[#8dc31e] text-white p-5 rounded-2xl flex items-center gap-4 shadow-sm min-w-[280px]">
					<div className="p-3 bg-white/20 rounded-xl shrink-0">
						<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
							<rect width="32" height="32" fill="none" />
							<path d="M16 4L4 12V24L16 28L28 24V12L16 4Z" fill="white" fillOpacity="0.4" />
							<circle cx="16" cy="16" r="6" fill="white" />
						</svg>
					</div>
					<div>
						<div className="text-2xl font-extrabold font-mono tracking-tight">
							{formatRupiah(totalSaldo).replace("Rp", "").trim()}
						</div>
						<div className="text-xs text-white/90 font-medium">Total saldo kamu</div>
					</div>
				</div>

				{/* 1:1 Legacy Action Buttons Row */}
				<div className="flex items-center gap-2.5 flex-wrap">
					<Button
						onClick={() => setIsModalOpen(true)}
						className="h-11 px-4 bg-[#8dc31e] hover:bg-[#8dc31e]/90 text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow-sm"
					>
						<Plus className="w-4 h-4" />
						Transaksi
					</Button>

					<Link to="/e-wallet/top-up/cash">
						<Button className="h-11 px-4 bg-[#8dc31e] hover:bg-[#8dc31e]/90 text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow-sm">
							<Download className="w-4 h-4" />
							Isi Saldo
						</Button>
					</Link>

					<Link to="/e-wallet/withdraw">
						<Button className="h-11 px-4 bg-[#8dc31e] hover:bg-[#8dc31e]/90 text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow-sm">
							<LogOut className="w-4 h-4" />
							Tarik Saldo
						</Button>
					</Link>

					<Link to="/e-wallet/edit-pin">
						<Button
							variant="outline"
							className="h-11 w-11 p-0 border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl flex items-center justify-center cursor-pointer"
							title="Pengaturan PIN E-Wallet"
						>
							<Settings className="w-5 h-5 text-[#8dc31e]" />
						</Button>
					</Link>
				</div>
			</div>

			{/* Main Datatable Card (`tbr_card_dashboard`) */}
			<RojaCard className="p-6 rounded-2xl shadow-sm border border-slate-100 bg-white space-y-6">
				{/* 1:1 Legacy Header Count */}
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-4">
						<div className="text-3xl font-extrabold text-slate-800 bg-slate-100 px-4 py-2 rounded-xl min-w-[50px] text-center font-mono">
							{meta?.total ?? transactions.length}
						</div>
						<div>
							<h2 className="text-lg font-bold text-slate-800">Transaksi</h2>
							<p className="text-xs text-slate-500">
								{meta ? `Halaman ${meta.page} dari ${meta.totalPages || 1}` : `Menampilkan riwayat transaksi terkini`}
							</p>
						</div>
					</div>

					<Button
						variant="ghost"
						size="sm"
						onClick={() => refetch()}
						disabled={isLoadingDashboard}
						className="h-9 px-3 text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1.5 rounded-xl cursor-pointer"
					>
						<RefreshCw className={`w-3.5 h-3.5 ${isLoadingDashboard ? "animate-spin" : ""}`} />
						<span>Segarkan</span>
					</Button>
				</div>

				{/* 1:1 Legacy Filter Controls Row */}
				<div className="grid grid-cols-1 md:grid-cols-12 gap-3">
					<div className="md:col-span-5 flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs">
						<Calendar className="w-4 h-4 text-slate-400 shrink-0" />
						<input
							type="date"
							value={startDate}
							onChange={(e) => {
								setStartDate(e.target.value)
								setPage(1)
							}}
							className="bg-transparent text-slate-700 outline-none w-full text-xs"
						/>
						<span className="text-slate-400">-</span>
						<input
							type="date"
							value={endDate}
							onChange={(e) => {
								setEndDate(e.target.value)
								setPage(1)
							}}
							className="bg-transparent text-slate-700 outline-none w-full text-xs"
						/>
					</div>

					<div className="md:col-span-3">
						<Select
							value={statusFilter}
							onValueChange={(val) => {
								setStatusFilter(val)
								setPage(1)
							}}
						>
							<SelectTrigger className="h-10 text-xs rounded-xl bg-slate-50 border-slate-200">
								<SelectValue placeholder="Status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">Semua Status</SelectItem>
								<SelectItem value="valid">Berhasil</SelectItem>
								<SelectItem value="waiting">Menunggu</SelectItem>
								<SelectItem value="process">Diproses</SelectItem>
								<SelectItem value="invalid">Gagal (Invalid)</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="md:col-span-4">
						<Input
							placeholder="Cari kode atau nama..."
							value={searchQuery}
							onChange={(e) => {
								setSearchQuery(e.target.value)
								setPage(1)
							}}
							className="h-10 text-xs rounded-xl bg-slate-50 border-slate-200"
						/>
					</div>
				</div>

				{/* 1:1 Legacy Table */}
				<div className="overflow-x-auto">
					<table className="w-full text-xs text-left border-collapse">
						<thead>
							<tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
								<th className="py-3 px-3">No</th>
								<th className="py-3 px-3">ID Transaksi</th>
								<th className="py-3 px-3">Jenis Transaksi</th>
								<th className="py-3 px-3">Nominal</th>
								<th className="py-3 px-3">Tanggal</th>
								<th className="py-3 px-3">Status</th>
								<th className="py-3 px-3 text-right">Actions</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100">
							{isLoadingDashboard ? (
								<tr>
									<td colSpan={7} className="py-8 text-center text-slate-400">
										Memuat transaksi...
									</td>
								</tr>
							) : transactions.length === 0 ? (
								<tr>
									<td colSpan={7} className="py-8 text-center text-slate-400">
										Tidak ada transaksi yang ditemukan.
									</td>
								</tr>
							) : (
								transactions.map((tx, idx) => (
									<tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
										<td className="py-3 px-3 font-medium text-slate-500">{(page - 1) * limit + idx + 1}</td>
										<td className="py-3 px-3 font-mono font-semibold text-slate-800">{tx.code}</td>
										<td className="py-3 px-3 font-medium text-slate-700">{tx.name}</td>
										<td className="py-3 px-3 font-mono font-bold text-slate-800">
											{formatRupiah(Number(tx.amount))}
										</td>
										<td className="py-3 px-3 text-slate-500 font-mono">{formatDate(tx.createdAt)}</td>
										<td className="py-3 px-3">
											<StatusBadge status={tx.status} />
										</td>
										<td className="py-3 px-3 text-right">
											<div className="flex items-center justify-end gap-1.5">
												{tx.status === "waiting" && (
													<Link to="/transactions/$id/scan-qr" params={{ id: String(tx.id) }}>
														<Button
															variant="ghost"
															size="sm"
															className="h-8 px-2.5 text-xs font-semibold text-[#e4007e] hover:bg-[#e4007e]/10 flex items-center gap-1 rounded-lg cursor-pointer"
															title="Lanjutkan Scan QR"
														>
															<QrCode className="w-3.5 h-3.5" />
															<span>Scan QR</span>
														</Button>
													</Link>
												)}
												{tx.status === "process" && (
													<Link to="/transactions/$id/checkout" params={{ id: String(tx.id) }}>
														<Button
															variant="ghost"
															size="sm"
															className="h-8 px-2.5 text-xs font-semibold text-[#8dc31e] hover:bg-[#8dc31e]/10 flex items-center gap-1 rounded-lg cursor-pointer"
															title="Lanjutkan Checkout"
														>
															<ArrowRight className="w-3.5 h-3.5" />
															<span>Checkout</span>
														</Button>
													</Link>
												)}
												<Link to="/transactions/$id/detail" params={{ id: String(tx.id) }}>
													<Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-[#8dc31e] cursor-pointer" title="Lihat Detail">
														<Eye className="w-4 h-4" />
													</Button>
												</Link>
											</div>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>

				{/* Pagination Controls */}
				{meta && meta.totalPages > 1 && (
					<div className="flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-500">
						<div>
							Menampilkan {(page - 1) * limit + 1} - {Math.min(page * limit, meta.total)} dari {meta.total} transaksi
						</div>
						<div className="flex items-center gap-2">
							<Button
								variant="outline"
								size="sm"
								disabled={page <= 1}
								onClick={() => setPage((p) => Math.max(1, p - 1))}
								className="h-8 px-2.5 rounded-lg text-xs"
							>
								<ChevronLeft className="w-3.5 h-3.5" />
								Sebelumnya
							</Button>
							<span className="font-semibold text-slate-700">
								{page} / {meta.totalPages}
							</span>
							<Button
								variant="outline"
								size="sm"
								disabled={page >= meta.totalPages}
								onClick={() => setPage((p) => p + 1)}
								className="h-8 px-2.5 rounded-lg text-xs"
							>
								Berikutnya
								<ChevronRight className="w-3.5 h-3.5" />
							</Button>
						</div>
					</div>
				)}
			</RojaCard>

			{/* 1:1 Legacy Modal Item (`modalItem`) */}
			<TransactionModal open={isModalOpen} onOpenChange={setIsModalOpen} />
		</div>
	)
}

export default Route
