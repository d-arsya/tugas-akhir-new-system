import { type JSX, useEffect, useState } from "react"
import { createFileRoute, Link, useNavigate, useLocation, Outlet } from "@tanstack/react-router"
import { Plus, Download, LogOut, Settings, Calendar, Eye } from "lucide-react"
import { RojaCard, Button, Input, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, PinChallengeGate } from "@roja/ui"
import { formatRupiah, formatDate } from "@roja/utils"

import useEwalletStore from "@/stores/ewalletStore"
import { hijackMerchantApi } from "@/lib/dev-hijack"
import { createMerchantApi } from "@roja/api-client"
import { mockEwallet, mockTransactions } from "@/lib/dev-hijack.fixtures"
import StatusBadge from "@/components/StatusBadge"
import TransactionModal from "@/components/transactions/TransactionModal"

const merchantApi = hijackMerchantApi(createMerchantApi())

export const Route = createFileRoute("/_member/e-wallet")({
	component: EwalletDashboardRouteComponent,
})

function EwalletDashboardRouteComponent(): JSX.Element {
	const navigate = useNavigate()
	const location = useLocation()
	const { setPinAuthenticated, isPinAuthenticated } = useEwalletStore()
	const [data, setData] = useState<{ totalSaldo: number } | null>(null)
	const [statusFilter, setStatusFilter] = useState("all")
	const [searchQuery, setSearchQuery] = useState("")
	const [isModalOpen, setIsModalOpen] = useState(false)

	const isSubRoute = location.pathname !== "/e-wallet" && location.pathname !== "/e-wallet/"

	useEffect(() => {
		if (!isPinAuthenticated || isSubRoute) return

		const loadData = async () => {
			try {
				const res = await merchantApi.getEwalletDashboard()
				setData(res)
			} catch (err) {
				// handled silently
			}
		}
		loadData()
	}, [isPinAuthenticated, isSubRoute])

	if (isSubRoute) {
		return <Outlet />
	}

	if (!isPinAuthenticated) {
		return (
			<PinChallengeGate
				title="Masukkan PIN E-Wallet Merchant"
				description="Memastikan bahwa benar dompet ini milik merchant Anda."
				onSubmitPin={async (pin) => {
					await merchantApi.loginEwalletPin(pin)
					setPinAuthenticated(true)
				}}
			/>
		)
	}

	const filteredTx = mockTransactions.filter((tx) => {
		const matchesStatus = statusFilter === "all" || tx.status === statusFilter
		const matchesSearch =
			tx.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			tx.code.toLowerCase().includes(searchQuery.toLowerCase())
		return matchesStatus && matchesSearch
	})



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
							{formatRupiah(data?.totalSaldo ?? mockEwallet.totalSaldo).replace("Rp", "").trim()}
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
				<div className="flex items-center gap-4">
					<div className="text-3xl font-extrabold text-slate-800 bg-slate-100 px-4 py-2 rounded-xl min-w-[50px] text-center font-mono">
						{filteredTx.length}
					</div>
					<div>
						<h2 className="text-lg font-bold text-slate-800">Transaksi</h2>
						<p className="text-xs text-slate-500">
							Dari total {mockTransactions.length} transaksi
						</p>
					</div>
				</div>

				{/* 1:1 Legacy Filter Controls Row */}
				<div className="grid grid-cols-1 md:grid-cols-12 gap-3">
					<div className="md:col-span-5 flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs">
						<Calendar className="w-4 h-4 text-slate-400 shrink-0" />
						<input type="date" className="bg-transparent text-slate-700 outline-none w-full text-xs" />
						<span className="text-slate-400">-</span>
						<input type="date" className="bg-transparent text-slate-700 outline-none w-full text-xs" />
					</div>

					<div className="md:col-span-3">
						<Select value={statusFilter} onValueChange={setStatusFilter}>
							<SelectTrigger className="h-10 text-xs rounded-xl bg-slate-50 border-slate-200">
								<SelectValue placeholder="Status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">Semua Status</SelectItem>
								<SelectItem value="success">Berhasil</SelectItem>
								<SelectItem value="failed">Gagal</SelectItem>
								<SelectItem value="pending">Menunggu</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="md:col-span-4">
						<Input
							placeholder="Search"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
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
							{filteredTx.map((tx, idx) => (
								<tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
									<td className="py-3 px-3 font-medium text-slate-500">{idx + 1}</td>
									<td className="py-3 px-3 font-mono font-semibold text-slate-800">{tx.code}</td>
									<td className="py-3 px-3 font-medium text-slate-700">{tx.name}</td>
									<td className="py-3 px-3 font-mono font-bold text-slate-800">
										{formatRupiah(tx.amount)}
									</td>
									<td className="py-3 px-3 text-slate-500 font-mono">{formatDate(tx.createdAt)}</td>
									<td className="py-3 px-3">
										<StatusBadge status={tx.status} />
									</td>
									<td className="py-3 px-3 text-right">
										<Link to="/transactions/$id/detail" params={{ id: String(tx.id) }}>
											<Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-[#8dc31e]">
												<Eye className="w-4 h-4" />
											</Button>
										</Link>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</RojaCard>

			{/* 1:1 Legacy Modal Item (`modalItem`) */}
			<TransactionModal open={isModalOpen} onOpenChange={setIsModalOpen} />
		</div>
	)
}

export default Route
