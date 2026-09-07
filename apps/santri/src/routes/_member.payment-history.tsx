import type { JSX } from "react"
import { useState, useEffect } from "react"
import { createFileRoute, useNavigate, useLocation, Outlet } from "@tanstack/react-router"
import { RojaCard, Badge, Button, Input } from "@roja/ui"
import { Wallet, FileText, Eye, WalletCards } from "lucide-react"
import { santriApi } from "@/lib/api"
import useEwalletStore from "@/stores/ewalletStore"
import type { StudentInvoice } from "@roja/types"

const PaymentHistoryPage = (): JSX.Element => {
	const navigate = useNavigate()
	const location = useLocation()
	const { hasEwallet } = useEwalletStore()

	const isSubRoute = location.pathname !== "/payment-history" && location.pathname !== "/payment-history/"
	if (isSubRoute) return <Outlet />

	const [invoices, setInvoices] = useState<StudentInvoice[]>([])
	const [loading, setLoading] = useState<boolean>(true)
	const [hideNotif, setHideNotif] = useState<boolean>(false)

	const [statusFilter, setStatusFilter] = useState<string>("")
	const [searchQuery, setSearchQuery] = useState<string>("")
	const [entriesPerPage, setEntriesPerPage] = useState<number>(10)

	useEffect(() => {
		const fetchInvoices = async () => {
			setLoading(true)
			try {
				const res = await santriApi.getInvoices()
				setInvoices(res)
			} catch {
				// Fallback
			} finally {
				setLoading(false)
			}
		}
		fetchInvoices()
	}, [])

	const formatRupiah = (num: number): string => {
		return new Intl.NumberFormat("id-ID", {
			style: "currency",
			currency: "IDR",
			minimumFractionDigits: 0,
		}).format(num)
	}

	const totalUnpaid = invoices
		.filter((inv) => inv.status !== "paid")
		.reduce((sum, inv) => sum + (inv.amount - inv.amountPaid), 0)

	const countUnpaid = invoices.filter((inv) => inv.status === "unpaid").length
	const countInstallment = invoices.filter((inv) => inv.status === "installment").length

	const filteredInvoices = invoices.filter((inv) => {
		const matchSearch =
			!searchQuery ||
			inv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			inv.status.toLowerCase().includes(searchQuery.toLowerCase())
		const matchStatus =
			!statusFilter ||
			(statusFilter === "sudah" && inv.status === "paid") ||
			(statusFilter === "belum" && inv.status === "unpaid") ||
			(statusFilter === "angsur" && inv.status === "installment")
		return matchSearch && matchStatus
	})

	const displayedInvoices = filteredInvoices.slice(0, entriesPerPage)

	const isOverdue = (dueDateStr: string, status: string) => {
		if (status === "paid") return false
		return new Date(dueDateStr) < new Date()
	}

	return (
		<div className="flex flex-col w-full gap-6">
			{!hasEwallet && !hideNotif && (
				<RojaCard className="p-5 bg-pink-50/60 border-pink-100 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
					<div className="flex items-center gap-3">
						<div className="p-3 rounded-2xl bg-[#e4007e] text-white">
							<WalletCards className="w-6 h-6" />
						</div>
						<div>
							<h4 className="font-bold text-slate-800 text-sm">Sekarang sudah ada dompet digital</h4>
							<p className="text-xs text-slate-600 mt-0.5">Gunakan dompet digital kamu agar dapat melakukan transaksi.</p>
						</div>
					</div>
					<div className="flex items-center gap-2 self-end sm:self-auto">
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={() => setHideNotif(true)}
							className="rounded-xl border-slate-200 text-slate-600 hover:bg-slate-100 text-xs"
						>
							Sembunyikan
						</Button>
						<Button
							type="button"
							size="sm"
							onClick={() => navigate({ to: "/e-wallet" as any })}
							className="rounded-xl bg-[#e4007e] hover:bg-[#c3006c] text-white text-xs font-semibold"
						>
							Aktifkan Sekarang
						</Button>
					</div>
				</RojaCard>
			)}

			<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
				<div className="bg-[#e4007e] p-5 rounded-2xl text-white shadow-md flex items-center gap-4 relative overflow-hidden">
					<div className="p-3 rounded-2xl bg-white/20 shrink-0">
						<Wallet className="w-7 h-7 text-white" />
					</div>
					<div className="flex flex-col">
						<span className="text-2xl font-extrabold tracking-tight">{formatRupiah(totalUnpaid)}</span>
						<span className="text-xs text-white/90 font-medium mt-0.5">Total belum dibayar</span>
					</div>
				</div>

				<div className="bg-[#dc3545] p-5 rounded-2xl text-white shadow-md flex items-center gap-4 relative overflow-hidden">
					<div className="p-3 rounded-2xl bg-white/20 shrink-0">
						<FileText className="w-7 h-7 text-white" />
					</div>
					<div className="flex flex-col">
						<span className="text-2xl font-extrabold tracking-tight">{countUnpaid}</span>
						<span className="text-xs text-white/90 font-medium mt-0.5">Item belum dibayar</span>
					</div>
				</div>

				<div className="bg-[#ffc107] p-5 rounded-2xl text-slate-900 shadow-md flex items-center gap-4 relative overflow-hidden">
					<div className="p-3 rounded-2xl bg-black/10 shrink-0">
						<FileText className="w-7 h-7 text-slate-900" />
					</div>
					<div className="flex flex-col">
						<span className="text-2xl font-extrabold tracking-tight">{countInstallment}</span>
						<span className="text-xs text-slate-800 font-medium mt-0.5">Item diangsur</span>
					</div>
				</div>
			</div>

			<RojaCard className="p-6 md:p-8 flex flex-col gap-6 rounded-2xl shadow-sm border-slate-100 bg-white">
				<h3 className="text-lg font-bold text-slate-800">Pembayaran Santri</h3>

				<div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
					<div className="sm:col-span-2">
						<select
							value={entriesPerPage}
							onChange={(e) => setEntriesPerPage(Number(e.target.value))}
							className="w-full text-xs h-10 px-3 rounded-xl border border-slate-200 bg-white text-slate-700"
						>
							<option value={10}>10</option>
							<option value={25}>25</option>
							<option value={50}>50</option>
							<option value={100}>100</option>
						</select>
					</div>

					<div className="sm:col-span-4 sm:col-start-6">
						<select
							value={statusFilter}
							onChange={(e) => setStatusFilter(e.target.value)}
							className="w-full text-xs h-10 px-3 rounded-xl border border-slate-200 bg-white text-slate-700"
						>
							<option value="">Status</option>
							<option value="sudah">Dibayar</option>
							<option value="belum">Belum Dibayar</option>
							<option value="angsur">Diangsur</option>
						</select>
					</div>

					<div className="sm:col-span-3">
						<Input
							type="text"
							placeholder="Search"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="h-10 text-xs rounded-xl border-slate-200"
						/>
					</div>
				</div>

				<div className="overflow-x-auto rounded-xl border border-slate-100">
					<table className="w-full text-left text-xs">
						<thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100 uppercase tracking-wider text-[11px]">
							<tr>
								<th className="py-3 px-4 w-12">No</th>
								<th className="py-3 px-4">Uraian Biaya</th>
								<th className="py-3 px-4">Ditagihkan</th>
								<th className="py-3 px-4">Biaya</th>
								<th className="py-3 px-4">Dibayar</th>
								<th className="py-3 px-4">Status</th>
								<th className="py-3 px-4 text-right w-16">Action</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100">
							{loading ? (
								<tr>
									<td colSpan={7} className="py-8 text-center text-slate-400">Memuat data...</td>
								</tr>
							) : displayedInvoices.length === 0 ? (
								<tr>
									<td colSpan={7} className="py-8 text-center text-slate-400">Belum ada tagihan.</td>
								</tr>
							) : (
								displayedInvoices.map((inv, index) => {
									const overdue = isOverdue(inv.dueDate, inv.status)
									return (
										<tr
											key={inv.id}
											className={`transition-colors ${overdue ? "bg-rose-50/70 hover:bg-rose-100/50" : "hover:bg-slate-50/60"}`}
										>
											<td className="py-3 px-4 text-slate-500 font-medium">{index + 1}</td>
											<td className="py-3 px-4 font-semibold text-slate-800">{inv.name}</td>
											<td className="py-3 px-4 text-slate-600">
												{new Date(inv.dueDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
											</td>
											<td className="py-3 px-4 font-medium text-slate-800">{formatRupiah(inv.amount)}</td>
											<td className="py-3 px-4 font-medium text-slate-800">{formatRupiah(inv.amountPaid)}</td>
											<td className="py-3 px-4">
												{inv.status === "paid" && <Badge className="bg-emerald-50 text-emerald-600 border-emerald-200">Lunas</Badge>}
												{inv.status === "unpaid" && <Badge className="bg-rose-50 text-rose-600 border-rose-200">Belum Dibayar</Badge>}
												{inv.status === "installment" && <Badge className="bg-amber-50 text-amber-600 border-amber-200">Diangsur</Badge>}
											</td>
											<td className="py-3 px-4 text-right">
												<Button
													type="button"
													variant="ghost"
													size="icon"
													onClick={() => navigate({ to: "/payment-history/detail/$invoiceId" as any, params: { invoiceId: String(inv.id) } })}
													className="h-8 w-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
												>
													<Eye className="w-4 h-4" />
												</Button>
											</td>
										</tr>
									)
								})
							)}
						</tbody>
					</table>
				</div>
			</RojaCard>
		</div>
	)
}

export const Route = createFileRoute("/_member/payment-history")({
	component: PaymentHistoryPage,
})

export default PaymentHistoryPage

