import type { JSX } from "react"
import { useState } from "react"
import { Link } from "@tanstack/react-router"
import { isSameDay } from "date-fns"
import {
	RojaCard,
	Badge,
	Button,
	Input,
	SimpleSelect,
	DatePicker,
	type DateRange,
} from "@roja/ui"
import {
	Wallet,
	Plus,
	Download,
	LogOut,
	Settings,
	Eye,
	RotateCcw,
	RefreshCw,
	QrCode,
	ArrowRight,
} from "lucide-react"
import { formatRupiah, formatDate } from "@roja/utils"
import StatusBadge from "@/components/StatusBadge"
import TablePagination from "@/components/table-pagination"

export interface MerchantTransaction {
	id: string | number
	code: string
	name: string
	amount: number | string
	createdAt: string
	status: string
	paymentMethod?: string
}

export interface MerchantTransactionHistoryTableProps {
	totalSaldo: number
	transactions: MerchantTransaction[]
	meta?: {
		page: number
		limit: number
		total: number
		totalPages: number
	}
	page?: number
	limit?: number
	searchQuery?: string
	onSearchChange?: (search: string) => void
	statusFilter?: string
	onStatusChange?: (status: string) => void
	dateRange?: DateRange | undefined
	onDateRangeChange?: (dateRange: DateRange | undefined) => void
	onResetFilters?: () => void
	onPageChange?: (newPage: number) => void
	onLimitChange?: (newLimit: number) => void
	onOpenModal?: () => void
	onRefetch?: () => void
	isLoading?: boolean
}

export const MerchantTransactionHistoryTable = ({
	totalSaldo,
	transactions,
	meta,
	page = 1,
	limit = 10,
	searchQuery: externalSearchQuery,
	onSearchChange,
	statusFilter: externalStatusFilter,
	onStatusChange,
	dateRange: externalDateRange,
	onDateRangeChange,
	onResetFilters,
	onPageChange,
	onLimitChange,
	onOpenModal,
	onRefetch,
	isLoading = false,
}: MerchantTransactionHistoryTableProps): JSX.Element => {
	const [internalSearchQuery, setInternalSearchQuery] = useState<string>("")
	const [internalStatusFilter, setInternalStatusFilter] = useState<string>("all")
	const [internalDateRange, setInternalDateRange] = useState<DateRange | undefined>(undefined)

	const searchQuery = externalSearchQuery ?? internalSearchQuery
	const setSearchQuery = (val: string) => {
		setInternalSearchQuery(val)
		onSearchChange?.(val)
	}

	const statusFilter = externalStatusFilter ?? internalStatusFilter
	const setStatusFilter = (val: string) => {
		setInternalStatusFilter(val)
		onStatusChange?.(val)
	}

	const dateRange = externalDateRange ?? internalDateRange
	const setDateRange = (val: DateRange | undefined) => {
		setInternalDateRange(val)
		onDateRangeChange?.(val)
	}

	const handleReset = () => {
		setInternalSearchQuery("")
		setInternalStatusFilter("all")
		setInternalDateRange(undefined)
		onResetFilters?.()
	}

	const isFiltered = Boolean(
		searchQuery ||
			(statusFilter && statusFilter !== "all") ||
			dateRange?.from,
	)

	const filteredTransactions = transactions.filter((t) => {
		const matchesSearch =
			!searchQuery ||
			t.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
			t.name.toLowerCase().includes(searchQuery.toLowerCase())

		const matchesStatus =
			!statusFilter || statusFilter === "all" || t.status === statusFilter

		const matchesDate = (() => {
			if (!dateRange?.from) return true
			const itemDateStr = t.createdAt ? t.createdAt.split("T")[0] : ""
			if (!itemDateStr) return true
			const itemDate = new Date(itemDateStr)

			if (dateRange.from && !dateRange.to) {
				return isSameDay(itemDate, dateRange.from)
			}
			if (dateRange.from && dateRange.to) {
				const start = new Date(dateRange.from)
				start.setHours(0, 0, 0, 0)
				const end = new Date(dateRange.to)
				end.setHours(23, 59, 59, 999)
				return itemDate >= start && itemDate <= end
			}
			return true
		})()

		return matchesSearch && matchesStatus && matchesDate
	})

	const displayTransactions =
		onSearchChange || onStatusChange || onDateRangeChange
			? transactions
			: filteredTransactions

	return (
		<div className="flex flex-col gap-6">
			{/* Top Bar: Merchant Green Saldo Widget (Left) + Action Buttons (Right) */}
			<div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
				<div className="lg:col-span-6">
					<div className="bg-[#8dc31e] text-white p-6 rounded-2xl shadow-lg relative overflow-hidden flex items-center justify-between">
						<div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-white/10 pointer-events-none" />

						<div className="flex items-center gap-4 relative z-10">
							<div className="p-3.5 rounded-2xl bg-white/20 backdrop-blur-md">
								<Wallet className="w-8 h-8 text-white" />
							</div>
							<div>
								<div className="text-2xl sm:text-3xl font-extrabold tracking-tight font-mono">
									{formatRupiah(totalSaldo)}
								</div>
								<div className="text-xs text-white/90 font-medium mt-0.5">
									Total saldo merchant kamu
								</div>
							</div>
						</div>

						<div className="relative z-10">
							<Badge className="bg-white/20 hover:bg-white/30 text-white border-0 px-3 py-1 text-xs">
								Aktif
							</Badge>
						</div>
					</div>
				</div>

				<div className="lg:col-span-6 flex flex-wrap sm:flex-nowrap gap-2.5 justify-start lg:justify-end">
					<Button
						type="button"
						onClick={onOpenModal}
						className="h-11 px-4 bg-[#8dc31e] hover:bg-[#7cb018] text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow-sm"
					>
						<Plus className="w-4 h-4" />
						Transaksi
					</Button>

					<Link to="/e-wallet/top-up/cash">
						<Button
							type="button"
							className="h-11 px-4 bg-[#8dc31e] hover:bg-[#7cb018] text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow-sm"
						>
							<Download className="w-4 h-4" />
							Isi Saldo
						</Button>
					</Link>

					<Link to="/e-wallet/withdraw">
						<Button
							type="button"
							className="h-11 px-4 bg-[#8dc31e] hover:bg-[#7cb018] text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow-sm"
						>
							<LogOut className="w-4 h-4" />
							Tarik Saldo
						</Button>
					</Link>

					<Link to="/e-wallet/edit-pin">
						<Button
							type="button"
							variant="outline"
							className="h-11 w-11 p-0 border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl flex items-center justify-center cursor-pointer shrink-0"
							title="Pengaturan PIN E-Wallet"
						>
							<Settings className="w-5 h-5 text-[#8dc31e]" />
						</Button>
					</Link>
				</div>
			</div>

			{/* Main Datatable Card */}
			<RojaCard className="p-6 md:p-8 flex flex-col gap-6 rounded-2xl shadow-sm border-slate-100 bg-white">
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
					<div className="flex items-center gap-4">
						<div className="text-2xl sm:text-3xl font-extrabold text-slate-800 bg-slate-100 px-4 py-1.5 rounded-xl min-w-[50px] text-center font-mono">
							{meta?.total ?? transactions.length}
						</div>
						<div>
							<h5 className="text-lg font-bold text-slate-800">Riwayat Transaksi</h5>
							<p className="text-xs text-slate-500">
								{meta
									? `Halaman ${meta.page} dari ${meta.totalPages || 1}`
									: `Menampilkan riwayat transaksi merchant`}
							</p>
						</div>
					</div>

					<div className="flex items-center gap-2 self-start sm:self-auto">
						{isFiltered && (
							<Button
								type="button"
								variant="ghost"
								size="sm"
								onClick={handleReset}
								className="text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-50 gap-1.5 h-9 rounded-xl cursor-pointer"
							>
								<RotateCcw className="w-3.5 h-3.5" />
								Reset Filter
							</Button>
						)}

						{onRefetch && (
							<Button
								type="button"
								variant="ghost"
								size="sm"
								onClick={onRefetch}
								disabled={isLoading}
								className="h-9 px-3 text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1.5 rounded-xl cursor-pointer"
							>
								<RefreshCw
									className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`}
								/>
								<span>Segarkan</span>
							</Button>
						)}
					</div>
				</div>

				{/* Filter Controls Grid */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
					{/* Date Range Picker Component */}
					<div className="lg:col-span-5">
						<DatePicker
							mode="range"
							value={dateRange}
							onValueChange={(range) => setDateRange(range)}
							placeholder="Pilih Tanggal..."
							formatStr="dd/MM/yyyy"
						/>
					</div>

					{/* Status Select Component */}
					<div className="lg:col-span-3">
						<SimpleSelect
							value={statusFilter}
							onValueChange={setStatusFilter}
							placeholder="Semua Status"
							options={[
								{ value: "all", label: "Semua Status" },
								{ value: "valid", label: "Berhasil" },
								{ value: "waiting", label: "Menunggu" },
								{ value: "process", label: "Diproses" },
								{ value: "invalid", label: "Gagal (Invalid)" },
							]}
						/>
					</div>

					{/* Search Input Component */}
					<div className="lg:col-span-4">
						<Input
							type="text"
							placeholder="Cari kode atau nama..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="text-xs h-10 rounded-xl border-slate-200"
						/>
					</div>
				</div>

				{/* Modern Table */}
				<div className="overflow-x-auto rounded-xl border border-slate-100 mt-2">
					<table className="w-full text-left text-xs">
						<thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100 uppercase tracking-wider text-[11px]">
							<tr>
								<th className="py-3 px-4">No</th>
								<th className="py-3 px-4">ID Transaksi</th>
								<th className="py-3 px-4">Jenis Transaksi</th>
								<th className="py-3 px-4">Nominal</th>
								<th className="py-3 px-4">Tanggal</th>
								<th className="py-3 px-4">Status</th>
								<th className="py-3 px-4 text-right">Actions</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100">
							{isLoading ? (
								<tr>
									<td colSpan={7} className="py-8 text-center text-slate-400">
										Memuat data transaksi...
									</td>
								</tr>
							) : displayTransactions.length === 0 ? (
								<tr>
									<td colSpan={7} className="py-8 text-center text-slate-400">
										Tidak ada transaksi yang ditemukan.
									</td>
								</tr>
							) : (
								displayTransactions.map((tx, idx) => (
									<tr
										key={tx.id}
										className="hover:bg-slate-50/70 transition-colors"
									>
										<td className="py-3 px-4 text-slate-500 font-medium">
											{(page - 1) * limit + idx + 1}
										</td>
										<td className="py-3 px-4 font-mono font-semibold text-slate-800">
											{tx.code}
										</td>
										<td className="py-3 px-4 text-slate-700 font-medium">
											{tx.name}
										</td>
										<td className="py-3 px-4 font-mono font-bold text-slate-800">
											{formatRupiah(Number(tx.amount))}
										</td>
										<td className="py-3 px-4 text-slate-500 font-mono">
											{formatDate(tx.createdAt)}
										</td>
										<td className="py-3 px-4">
											<StatusBadge status={tx.status} />
										</td>
										<td className="py-3 px-4 text-right">
											<div className="flex items-center justify-end gap-1.5">
												{tx.status === "waiting" && (
													<Link
														to="/transactions/$id/scan-qr"
														params={{ id: String(tx.id) }}
													>
														<Button
															type="button"
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
													<Link
														to="/transactions/$id/checkout"
														params={{ id: String(tx.id) }}
													>
														<Button
															type="button"
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

												<Link
													to="/transactions/$id/detail"
													params={{ id: String(tx.id) }}
												>
													<Button
														type="button"
														variant="ghost"
														size="icon"
														className="h-8 w-8 rounded-lg text-slate-400 hover:text-[#8dc31e] hover:bg-slate-100 cursor-pointer"
														title="Lihat Detail"
													>
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

				<TablePagination
					page={meta?.page || page}
					limit={meta?.limit || limit}
					total={meta?.total ?? transactions.length}
					totalPages={
						meta?.totalPages ?? (Math.ceil(transactions.length / limit) || 1)
					}
					onPageChange={(newPage) => onPageChange?.(newPage)}
					entriesValue={meta?.limit || limit}
					onEntriesChange={onLimitChange}
				/>
			</RojaCard>
		</div>
	)
}

export default MerchantTransactionHistoryTable
