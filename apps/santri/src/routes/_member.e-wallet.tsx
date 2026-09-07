import type { JSX } from "react"
import { useState, useEffect } from "react"
import { createFileRoute, useNavigate, useLocation, Outlet } from "@tanstack/react-router"
import {
	RojaCard,
	Badge,
	Button,
	Input,
	Alert,
	AlertDescription,
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
} from "@roja/ui"
import {
	Wallet,
	KeyRound,
	PlusCircle,
	ArrowUpRight,
	ArrowDownLeft,
	Settings,
	Search,
	Calendar,
	Filter,
	Eye,
	ChevronDown,
} from "lucide-react"
import useEwalletStore from "@/stores/ewalletStore"
import { santriApi } from "@/lib/api"
import PinInput from "@/components/ewallet/PinInput"
import TopUpModal from "@/components/ewallet/TopUpModal"
import CreateEwalletView from "@/components/ewallet/CreateEwalletView"
import InactiveEwalletView from "@/components/ewallet/InactiveEwalletView"
import type { EwalletTransaction } from "@roja/types"

const EwalletPage = (): JSX.Element => {
	const navigate = useNavigate()
	const location = useLocation()

	const {
		isPinAuthenticated,
		hasEwallet,
		isActive,
		setPinAuthenticated,
		setHasEwallet,
		setIsActive,
	} = useEwalletStore()

	// If current route is a sub-route under /e-wallet (e.g. /e-wallet/withdraw, /e-wallet/edit-pin, etc.), render Outlet
	const isSubRoute = location.pathname !== "/e-wallet" && location.pathname !== "/e-wallet/"
	if (isSubRoute) {
		return <Outlet />
	}

	// PIN Challenge State
	const [pinInputVal, setPinInputVal] = useState<string>("")
	const [pinError, setPinError] = useState<string>("")
	const [pinLoading, setPinLoading] = useState<boolean>(false)

	// Dashboard Data State
	const [dashboardLoading, setDashboardLoading] = useState<boolean>(false)
	const [totalSaldo, setTotalSaldo] = useState<number>(0)
	const [transactions, setTransactions] = useState<EwalletTransaction[]>([])
	const [isTopUpOpen, setIsTopUpOpen] = useState<boolean>(false)

	// Transaction Table Filters
	const [searchQuery, setSearchQuery] = useState<string>("")
	const [statusFilter, setStatusFilter] = useState<string>("")
	const [startDate, setStartDate] = useState<string>("")
	const [endDate, setEndDate] = useState<string>("")

	// Check status on mount
	useEffect(() => {
		const fetchStatus = async () => {
			try {
				const res = await santriApi.getEwalletStatus()
				setHasEwallet(res.hasEwallet)
				setIsActive(res.isActive)
			} catch (err) {
				// Default fallback in dev
			}
		}
		fetchStatus()
	}, [setHasEwallet, setIsActive])

	// Fetch dashboard data when PIN is authenticated
	useEffect(() => {
		if (isPinAuthenticated && hasEwallet && isActive) {
			const fetchDashboard = async () => {
				setDashboardLoading(true)
				try {
					const data = await santriApi.getEwalletDashboard()
					setTotalSaldo(data.totalSaldo)
					setTransactions(data.transactions)
				} catch (err) {
					// Fallback
				} finally {
					setDashboardLoading(false)
				}
			}
			fetchDashboard()
		}
	}, [isPinAuthenticated, hasEwallet, isActive])

	// PIN Gate Login Submission
	const handlePinSubmit = async () => {
		if (pinInputVal.length < 6) {
			setPinError("Masukkan 6 digit PIN terlebih dahulu.")
			return
		}
		setPinError("")
		setPinLoading(true)
		try {
			const res = await santriApi.loginEwalletPin(pinInputVal)
			if (res.success) {
				setPinAuthenticated(true)
			}
		} catch (err: any) {
			setPinError(err.message || "PIN yang kamu masukkan salah.")
		} finally {
			setPinLoading(false)
		}
	}

	// Create E-Wallet Submission
	const handleCreateEwallet = async (pin: string, pinConfirmation: string) => {
		await santriApi.createEwallet({ pin, pinConfirmation })
		setHasEwallet(true)
		setPinAuthenticated(true)
	}

	// Format Rupiah Helper
	const formatRupiah = (val: number) => {
		return new Intl.NumberFormat("id-ID", {
			style: "currency",
			currency: "IDR",
			minimumFractionDigits: 0,
		}).format(val)
	}

	// Filter Transactions
	const filteredTransactions = transactions.filter((t) => {
		const matchesSearch =
			!searchQuery ||
			t.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
			t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			t.paymentMethod.toLowerCase().includes(searchQuery.toLowerCase())

		const matchesStatus = !statusFilter || t.status === statusFilter

		const txDate = t.createdAt.split("T")[0]
		const matchesStart = !startDate || txDate >= startDate
		const matchesEnd = !endDate || txDate <= endDate

		return matchesSearch && matchesStatus && matchesStart && matchesEnd
	})

	// State 1: User does not have E-Wallet
	if (!hasEwallet) {
		return (
			<div className="py-6">
				<CreateEwalletView onSubmit={handleCreateEwallet} />
			</div>
		)
	}

	// State 2: E-Wallet is Inactive
	if (!isActive) {
		return (
			<div className="py-6">
				<InactiveEwalletView />
			</div>
		)
	}

	// State 3: PIN Challenge Gate (login.blade.php)
	if (!isPinAuthenticated) {
		return (
			<div className="py-6">
				<RojaCard className="p-8 sm:p-12 text-center max-w-xl mx-auto shadow-xl rounded-2xl border-slate-100 bg-white">
					<div className="flex flex-col items-center">
						<div className="w-16 h-16 rounded-2xl bg-pink-50 flex items-center justify-center mb-6 shadow-inner">
							<KeyRound className="w-8 h-8 text-[#e4007e]" />
						</div>

						<h3 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
							Masukkan pin
						</h3>
						<p className="text-sm text-slate-500 mt-2 max-w-md">
							Memastikan bahwa benar dompet ini milik kamu.
						</p>

						{pinError && (
							<Alert variant="destructive" className="mt-4 text-xs py-2 max-w-sm">
								<AlertDescription>{pinError}</AlertDescription>
							</Alert>
						)}

						<div className="my-8">
							<PinInput
								value={pinInputVal}
								onChange={(val) => {
									setPinInputVal(val)
									if (pinError) setPinError("")
								}}
								error={!!pinError}
								disabled={pinLoading}
							/>
						</div>

						<div className="flex items-center justify-between w-full pt-4 border-t border-slate-100">
							<Button
								type="button"
								variant="outline"
								onClick={() => setPinInputVal("")}
								className="rounded-xl border-slate-200 text-slate-600 hover:bg-slate-100"
							>
								Batal
							</Button>
							<Button
								type="button"
								onClick={handlePinSubmit}
								disabled={pinInputVal.length < 6 || pinLoading}
								className="rounded-xl bg-[#e4007e] hover:bg-[#c3006c] text-white px-8 font-semibold shadow-md hover:shadow-lg transition-all"
							>
								{pinLoading ? "Memverifikasi..." : "Selanjutnya"}
							</Button>
						</div>
					</div>
				</RojaCard>
			</div>
		)
	}

	// State 4: E-Wallet Core Dashboard (index.blade.php)
	return (
		<div className="flex flex-col gap-6">
			{/* Top Balance & Quick Action Row */}
			<div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
				{/* Balance Widget Card */}
				<div className="lg:col-span-6">
					<div className="bg-[#e4007e] text-white p-6 rounded-2xl shadow-lg relative overflow-hidden flex items-center justify-between">
						{/* Background Decorative Pattern */}
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
					</div>
				</div>

				{/* Quick Actions Row */}
				<div className="lg:col-span-6 flex items-center justify-start lg:justify-end gap-3 flex-wrap">
					<Button
						type="button"
						variant="outline"
						size="icon"
						onClick={() => navigate({ to: "/e-wallet/edit-pin" as any })}
						className="h-11 w-11 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100"
						title="Atur PIN"
					>
						<Settings className="w-5 h-5 text-slate-600" />
					</Button>

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								type="button"
								className="h-11 rounded-xl bg-[#e4007e] hover:bg-[#c3006c] text-white px-5 font-semibold shadow-sm hover:shadow-md flex items-center gap-2"
							>
								<PlusCircle className="w-4 h-4" />
								Isi Saldo
								<ChevronDown className="w-3.5 h-3.5 ml-1 opacity-80" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="w-44 rounded-xl">
							<DropdownMenuItem
								onSelect={() => {
									navigate({ to: "/e-wallet/top-up/cash" as any })
								}}
								className="cursor-pointer font-medium text-xs py-2"
							>
								Cash (Kasir)
							</DropdownMenuItem>
							<DropdownMenuItem
								onSelect={() => setIsTopUpOpen(true)}
								onClick={() => setIsTopUpOpen(true)}
								className="cursor-pointer font-medium text-xs py-2"
							>
								Bank Transfer
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>

					<Button
						type="button"
						variant="outline"
						onClick={() => navigate({ to: "/e-wallet/withdraw" as any })}
						className="h-11 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100 px-5 font-semibold flex items-center gap-2"
					>
						<ArrowUpRight className="w-4 h-4 text-slate-500" />
						Tarik Saldo
					</Button>
				</div>
			</div>

			{/* Transactions Card */}
			<RojaCard className="p-6 md:p-8 flex flex-col gap-6 rounded-2xl shadow-sm border-slate-100">
				{/* Section Header */}
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
					<div>
						<h3 className="text-lg font-bold text-slate-800">Transaksi</h3>
						<p className="text-xs text-slate-500">
							Dari total {transactions.length} transaksi
						</p>
					</div>
				</div>

				{/* Filter Controls Row */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
					{/* Date Range Start & End */}
					<div className="lg:col-span-5 flex items-center gap-2">
						<div className="relative flex-1">
							<Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
							<Input
								type="date"
								value={startDate}
								onChange={(e) => setStartDate(e.target.value)}
								className="pl-9 text-xs h-10 rounded-xl border-slate-200"
							/>
						</div>
						<span className="text-xs text-slate-400 font-medium">s/d</span>
						<div className="relative flex-1">
							<Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
							<Input
								type="date"
								value={endDate}
								onChange={(e) => setEndDate(e.target.value)}
								className="pl-9 text-xs h-10 rounded-xl border-slate-200"
							/>
						</div>
					</div>

					{/* Status Filter */}
					<div className="lg:col-span-3">
						<select
							value={statusFilter}
							onChange={(e) => setStatusFilter(e.target.value)}
							className="w-full text-xs h-10 px-3 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#e4007e]/20"
						>
							<option value="">Semua Status</option>
							<option value="valid">Berhasil</option>
							<option value="invalid">Gagal</option>
							<option value="waiting">Menunggu</option>
						</select>
					</div>

					{/* Search Input */}
					<div className="lg:col-span-4 relative">
						<Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
						<Input
							type="text"
							placeholder="Cari transaksi..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-9 text-xs h-10 rounded-xl border-slate-200"
						/>
					</div>
				</div>

				{/* Transactions Data Table */}
				<div className="overflow-x-auto rounded-xl border border-slate-100">
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
						<tbody className="divide-y divide-slate-100">
							{filteredTransactions.length === 0 ? (
								<tr>
									<td colSpan={8} className="py-8 text-center text-slate-400">
										Belum ada data transaksi.
									</td>
								</tr>
							) : (
								filteredTransactions.map((tx, idx) => (
									<tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
										<td className="py-3 px-4 text-slate-500 font-medium">{idx + 1}</td>
										<td className="py-3 px-4 font-mono font-semibold text-slate-800">
											{tx.code}
										</td>
										<td className="py-3 px-4 text-slate-700 font-medium">{tx.name}</td>
										<td className="py-3 px-4 text-slate-600">{tx.paymentMethod}</td>
										<td className="py-3 px-4 font-bold text-slate-800">
											<span
												className={
													tx.type === "income" ? "text-emerald-600" : "text-slate-800"
												}
											>
												{tx.type === "income" ? "+" : "-"} {formatRupiah(tx.amount)}
											</span>
										</td>
										<td className="py-3 px-4 text-slate-500">
											{new Date(tx.createdAt).toLocaleDateString("id-ID", {
												day: "numeric",
												month: "short",
												year: "numeric",
											})}
										</td>
										<td className="py-3 px-4">
											{tx.status === "valid" && (
												<Badge className="bg-emerald-50 text-emerald-600 border-emerald-200">
													Berhasil
												</Badge>
											)}
											{tx.status === "invalid" && (
												<Badge className="bg-rose-50 text-rose-600 border-rose-200">
													Gagal
												</Badge>
											)}
											{tx.status === "waiting" && (
												<Badge className="bg-amber-50 text-amber-600 border-amber-200">
													Menunggu
												</Badge>
											)}
										</td>
										<td className="py-3 px-4 text-right">
											<Button
												variant="ghost"
												size="icon"
												onClick={() =>
													navigate({
														to: "/e-wallet/transactions/$transactionId" as any,
														params: { transactionId: String(tx.id) },
													})
												}
												className="h-8 w-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
												title="Detail"
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

			{/* Top-Up Modal */}
			<TopUpModal
				isOpen={isTopUpOpen}
				onClose={() => setIsTopUpOpen(false)}
				onSuccess={(amount) => {
					setTotalSaldo((prev) => prev + amount)
				}}
			/>
		</div>
	)
}

export const Route = createFileRoute("/_member/e-wallet")({
	component: EwalletPage,
})

export default EwalletPage
