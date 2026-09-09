import type { JSX } from "react"
import { useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { isSameDay } from "date-fns"
import {
	RojaCard,
	Badge,
	Button,
	Input,
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
	SimpleSelect,
	DatePicker,
	type DateRange,
} from "@roja/ui"
import {
	Wallet,
	PlusCircle,
	ArrowUpRight,
	Settings,
	Search,
	Calendar,
	Eye,
	ChevronDown,
	RotateCcw,
} from "lucide-react"
import TopUpModal from "./TopUpModal"
import type { EwalletTransaction } from "@roja/types"

export interface TransactionHistoryTableProps {
	totalSaldo: number
	transactions: EwalletTransaction[]
	onSaldoChange?: (newSaldo: number) => void
}

export const TransactionHistoryTable = ({
	totalSaldo,
	transactions,
	onSaldoChange,
}: TransactionHistoryTableProps): JSX.Element => {
	const navigate = useNavigate()

	const [isTopUpOpen, setIsTopUpOpen] = useState<boolean>(false)
	const [searchQuery, setSearchQuery] = useState<string>("")
	const [statusFilter, setStatusFilter] = useState<string>("")
	const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)

	const formatRupiah = (val: number) => {
		return new Intl.NumberFormat("id-ID", {
			style: "currency",
			currency: "IDR",
			minimumFractionDigits: 0,
		}).format(val)
	}

	const filteredTransactions = transactions.filter((t) => {
		const matchesSearch =
			!searchQuery ||
			t.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
			t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			(t.paymentMethod && t.paymentMethod.toLowerCase().includes(searchQuery.toLowerCase()))

		const matchesStatus = !statusFilter || t.status === statusFilter

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

	return (
		<div className="flex flex-col gap-6">
			<div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
				<div className="lg:col-span-6">
					<div className="bg-[#e4007e] text-white p-6 rounded-2xl shadow-lg relative overflow-hidden flex items-center justify-between">
						<div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-white/10 pointer-events-none" />

						<div className="flex items-center gap-4 relative z-10">
							<div className="p-3.5 rounded-2xl bg-white/20 backdrop-blur-md">
								<Wallet className="w-8 h-8 text-white" />
							</div>
							<div>
								<div className="text-2xl sm:text-3xl font-extrabold tracking-tight">
									{formatRupiah(totalSaldo)}
								</div>
								<div className="text-xs text-white/80 font-medium mt-0.5">
									Total saldo kamu
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

				<div className="lg:col-span-6 flex flex-wrap sm:flex-nowrap gap-3 items-center justify-start lg:justify-end">
					<DropdownMenu modal={false}>
						<DropdownMenuTrigger asChild>
							<Button
								type="button"
								className="h-11 rounded-xl bg-[#8dc31e] hover:bg-[#7cb018] text-white px-5 font-semibold flex items-center gap-2 shadow-sm"
							>
								<PlusCircle className="w-4 h-4" />
								Isi Saldo
								<ChevronDown className="w-3.5 h-3.5 opacity-80 ml-0.5" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="w-48 rounded-xl shadow-lg border-slate-100 p-1.5">
							<DropdownMenuItem
								onSelect={() => navigate({ to: "/e-wallet/top-up/cash" as any })}
								className="rounded-lg text-xs py-2.5 font-medium cursor-pointer"
							>
								<Wallet className="w-4 h-4 mr-2 text-slate-500" />
								Setor Tunai (Admin)
							</DropdownMenuItem>
							<DropdownMenuItem
								onSelect={() => setIsTopUpOpen(true)}
								className="rounded-lg text-xs py-2.5 font-medium cursor-pointer"
							>
								<PlusCircle className="w-4 h-4 mr-2 text-slate-500" />
								Transfer / Online
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>

					<Button
						type="button"
						variant="outline"
						onClick={() => navigate({ to: "/e-wallet/withdraw" as any })}
						className="h-11 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 px-5 font-semibold flex items-center gap-2"
					>
						<ArrowUpRight className="w-4 h-4 text-slate-500" />
						Tarik Saldo
					</Button>
				</div>
			</div>

			<RojaCard className="p-6 md:p-8 flex flex-col gap-6 rounded-2xl shadow-sm border-slate-100">
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
					<div>
						<h3 className="text-lg font-bold text-slate-800 dark:text-white">Riwayat Transaksi</h3>
						<p className="text-xs text-slate-500">Dari total {transactions.length} transaksi</p>
					</div>
					{(searchQuery || statusFilter || dateRange?.from) && (
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={() => {
								setSearchQuery("")
								setStatusFilter("")
								setDateRange(undefined)
							}}
							className="text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 gap-1.5 self-start sm:self-auto"
						>
							<RotateCcw className="w-3.5 h-3.5" />
							Reset Filter
						</Button>
					)}
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
					{/* Date Picker Component */}
					<div className="lg:col-span-4">
						<DatePicker
							mode="range"
							value={dateRange}
							onValueChange={(range) => setDateRange(range)}
							placeholder="Pilih Tanggal..."
							formatStr="dd/MM/yyyy"
						/>
					</div>

					{/* Status Select Component */}
					<div className="lg:col-span-4">
						<SimpleSelect
							value={statusFilter}
							onValueChange={setStatusFilter}
							placeholder="Semua Status"
							options={[
								{ value: "", label: "Semua Status" },
								{ value: "valid", label: "Berhasil" },
								{ value: "invalid", label: "Gagal" },
								{ value: "waiting", label: "Menunggu" },
							]}
						/>
					</div>

					{/* Search Input */}
					<div className="lg:col-span-4">
						<Input
							type="text"
							placeholder="Cari transaksi (kode/nama)..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="text-xs h-10 rounded-xl border-slate-200"
						/>
					</div>
				</div>

				<div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
					<table className="w-full text-left text-xs">
						<thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100 uppercase tracking-wider text-[11px]">
							<tr>
								<th className="py-3 px-4">No</th>
								<th className="py-3 px-4">ID Transaksi</th>
								<th className="py-3 px-4">Jenis Transaksi</th>
								<th className="py-3 px-4">Metode</th>
								<th className="py-3 px-4">Nominal</th>
								<th className="py-3 px-4">Tanggal</th>
								<th className="py-3 px-4">Status</th>
								<th className="py-3 px-4 text-right">Actions</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100 dark:divide-slate-800">
							{filteredTransactions.length === 0 ? (
								<tr>
									<td colSpan={8} className="py-8 text-center text-slate-400">Belum ada data transaksi.</td>
								</tr>
							) : (
								filteredTransactions.map((tx, idx) => (
									<tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
										<td className="py-3 px-4 text-slate-500 font-medium">{idx + 1}</td>
										<td className="py-3 px-4 font-mono font-semibold text-slate-800">{tx.code}</td>
										<td className="py-3 px-4 text-slate-700 font-medium">{tx.name}</td>
										<td className="py-3 px-4 text-slate-600">{tx.paymentMethod}</td>
										<td className="py-3 px-4 font-bold text-slate-800">
											<span className={tx.type === "income" ? "text-emerald-600" : "text-slate-800"}>
												{tx.type === "income" ? "+" : "-"} {formatRupiah(tx.amount)}
											</span>
										</td>
										<td className="py-3 px-4 text-slate-500">
											{new Date(tx.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
										</td>
										<td className="py-3 px-4">
											{tx.status === "valid" && <Badge className="bg-emerald-50 text-emerald-600 border-emerald-200">Berhasil</Badge>}
											{tx.status === "invalid" && <Badge className="bg-rose-50 text-rose-600 border-rose-200">Gagal</Badge>}
											{tx.status === "waiting" && <Badge className="bg-amber-50 text-amber-600 border-amber-200">Menunggu</Badge>}
										</td>
										<td className="py-3 px-4 text-right">
											<Button
												variant="ghost"
												size="icon"
												onClick={() => navigate({ to: "/e-wallet/transactions/$transactionId" as any, params: { transactionId: String(tx.id) } })}
												className="h-8 w-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
											>
												<Eye className="w-4 h-4" />
											</Button>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</RojaCard>

			<TopUpModal
				isOpen={isTopUpOpen}
				onClose={() => setIsTopUpOpen(false)}
				onSuccess={(amount) => onSaldoChange?.(totalSaldo + amount)}
			/>
		</div>
	)
}

export default TransactionHistoryTable

