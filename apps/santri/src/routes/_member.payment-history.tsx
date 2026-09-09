import type { JSX } from "react"
import { useState, useEffect } from "react"
import { createFileRoute, useNavigate, useLocation, Outlet } from "@tanstack/react-router"
import { RojaCard, Badge, Button } from "@roja/ui"
import { formatRupiah } from "@roja/utils"
import { Wallet, FileText, Eye, WalletCards } from "lucide-react"
import useEwalletStore from "@/stores/ewalletStore"
import TableToolbar from "@/components/table-toolbar"
import TablePagination from "@/components/table-pagination"
import { useSantriPaymentSummary } from "@/hooks/use-santri-queries"
import { useDebounce } from "@/hooks/use-debounce"

const PaymentHistoryPage = (): JSX.Element => {
	const navigate = useNavigate()
	const location = useLocation()
	const { hasEwallet } = useEwalletStore()

	const isSubRoute = location.pathname !== "/payment-history" && location.pathname !== "/payment-history/"
	if (isSubRoute) return <Outlet />

	const [page, setPage] = useState<number>(1)
	const [entriesPerPage, setEntriesPerPage] = useState<number>(10)
	const [statusFilter, setStatusFilter] = useState<string>("")
	const [searchQuery, setSearchQuery] = useState<string>("")
	const [hideNotif, setHideNotif] = useState<boolean>(false)

	const debouncedSearch = useDebounce(searchQuery, 400)

	const { data: summary, isLoading } = useSantriPaymentSummary({
		page,
		limit: entriesPerPage,
		status: statusFilter,
		search: debouncedSearch,
	})

	const invoices = summary?.invoices || []
	const totalUnpaid = summary?.remaining ?? invoices
		.filter((inv) => inv.status !== "paid")
		.reduce((sum, inv) => sum + (inv.amount - (inv.paidAmount || 0)), 0)

	const countUnpaid = invoices.filter((inv) => inv.status === "unpaid").length
	const countInstallment = invoices.filter((inv) => inv.status === "installment").length

	const total = summary?.meta?.total ?? invoices.length
	const totalPages = summary?.meta?.totalPages ?? Math.max(1, Math.ceil(total / entriesPerPage))
	const displayedInvoices = invoices

	const isOverdue = (dueDateStr: string | null | undefined, status: string) => {
		if (!dueDateStr || status === "paid") return false
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

				<TableToolbar
					searchValue={searchQuery}
					onSearchChange={(val) => {
						setSearchQuery(val)
						setPage(1)
					}}
					searchPlaceholder="Cari tagihan..."
					filterValue={statusFilter}
					onFilterChange={(val) => {
						setStatusFilter(val)
						setPage(1)
					}}
					filterOptions={[
						{ value: "sudah", label: "Dibayar" },
						{ value: "belum", label: "Belum Dibayar" },
						{ value: "angsur", label: "Diangsur" },
					]}
					filterPlaceholder="Semua Status"
				/>

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
							{isLoading ? (
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
									const rowNum = (page - 1) * entriesPerPage + index + 1
									return (
										<tr
											key={inv.id}
											className={`transition-colors ${overdue ? "bg-rose-50/70 hover:bg-rose-100/50" : "hover:bg-slate-50/60"}`}
										>
											<td className="py-3 px-4 text-slate-500 font-medium">{rowNum}</td>
											<td className="py-3 px-4 font-semibold text-slate-800">{inv.name}</td>
											<td className="py-3 px-4 text-slate-600">
												{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-"}
											</td>
											<td className="py-3 px-4 font-medium text-slate-800">{formatRupiah(inv.amount)}</td>
											<td className="py-3 px-4 font-medium text-slate-800">{formatRupiah(inv.paidAmount || 0)}</td>
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

				<TablePagination
					page={page}
					limit={entriesPerPage}
					total={total}
					totalPages={totalPages}
					onPageChange={setPage}
					entriesValue={entriesPerPage}
					onEntriesChange={(val) => {
						setEntriesPerPage(val)
						setPage(1)
					}}
					entriesOptions={[10, 25, 50, 100]}
				/>
			</RojaCard>
		</div>
	)
}

export const Route = createFileRoute("/_member/payment-history")({
	component: PaymentHistoryPage,
})

export default PaymentHistoryPage
