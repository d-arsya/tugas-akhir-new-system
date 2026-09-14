import { useState, type JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { adminApi } from "@/lib/api"
import { RojaCard, Button, Input, PageLoader } from "@roja/ui"
import { AdminPageHeader } from "@/components/layout/admin-page-header"
import { toast } from "sonner"
import {
	Receipt,
	Search,
	Filter,
	ArrowUpRight,
	ArrowDownLeft,
	Calendar,
	Download,
	Wallet,
} from "lucide-react"

export const Route = createFileRoute("/_auth/ewallet-transactions")({
	component: EWalletTransactionsPage,
})

function EWalletTransactionsPage(): JSX.Element {
	const [search, setSearch] = useState("")
	const [typeFilter, setTypeFilter] = useState("ALL")

	const { data, isLoading } = useQuery({
		queryKey: ["admin-ewallets"],
		queryFn: () => adminApi.getEWallets(),
	})

	const ewallets = data?.data || []

	// Mock transactions
	const transactions = [
		{
			id: "TRX-202609-001",
			studentName: "Muhammad Farhan",
			nisn: "0089123841",
			type: "TOPUP",
			amount: 500000,
			merchant: "Transfer Bank BCA",
			date: "14 Sep 2026, 14:32",
			status: "SUCCESS",
		},
		{
			id: "TRX-202609-002",
			studentName: "Ahmad Rizky",
			nisn: "0089123842",
			type: "PAYMENT",
			amount: 15000,
			merchant: "Kantin Putra Utama",
			date: "14 Sep 2026, 12:15",
			status: "SUCCESS",
		},
		{
			id: "TRX-202609-003",
			studentName: "Siti Fatimah",
			nisn: "0089123843",
			type: "PAYMENT",
			amount: 25000,
			merchant: "Koperasi Pondok Roja",
			date: "14 Sep 2026, 10:40",
			status: "SUCCESS",
		},
		{
			id: "TRX-202609-004",
			studentName: "Bilal Al-Habsyi",
			nisn: "0089123844",
			type: "WITHDRAWAL",
			amount: 100000,
			merchant: "Kasir Dompet Pusat",
			date: "13 Sep 2026, 16:20",
			status: "SUCCESS",
		},
	]

	if (isLoading) return <PageLoader />

	return (
		<div className="space-y-6">
			<AdminPageHeader
				title="Riwayat Transaksi Dompet"
				subtitle="Catatan seluruh transaksi saldo e-wallet santri, top-up kasir, dan belanja merchant"
				actions={
					<Button
						onClick={() => toast.success("Mengekspor riwayat transaksi ke Excel...")}
						className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
					>
						<Download className="w-4 h-4" />
						Export Excel (.xlsx)
					</Button>
				}
			/>

			{/* Filter Toolbar */}
			<RojaCard className="p-4 bg-white shadow-xs border-0 rounded-2xl">
				<div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
					<div className="w-full sm:w-80">
						<Input
							placeholder="Cari ID Transaksi / Nama Santri..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="bg-slate-50 border-0"
						/>
					</div>

					<div className="flex items-center gap-2 w-full sm:w-auto">
						<Filter className="w-4 h-4 text-slate-400" />
						<span className="text-xs text-slate-500 font-medium">Tipe:</span>
						{["ALL", "TOPUP", "PAYMENT", "WITHDRAWAL"].map((t) => (
							<button
								key={t}
								type="button"
								onClick={() => setTypeFilter(t)}
								className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
									typeFilter === t
										? "bg-[var(--primary)] text-white"
										: "bg-slate-100 text-slate-600 hover:bg-slate-200"
								}`}
							>
								{t}
							</button>
						))}
					</div>
				</div>
			</RojaCard>

			{/* Transactions Table */}
			<RojaCard className="bg-white shadow-xs border-0 rounded-2xl overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full text-left text-xs">
						<thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-100">
							<tr>
								<th className="p-4">No TRX</th>
								<th className="p-4">Santri</th>
								<th className="p-4">Jenis Transaksi</th>
								<th className="p-4">Merchant / Keterangan</th>
								<th className="p-4">Waktu</th>
								<th className="p-4 text-right">Nominal</th>
								<th className="p-4 text-right">Status</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100 text-slate-700">
							{transactions.map((trx) => (
								<tr key={trx.id} className="hover:bg-slate-50/60 transition-colors">
									<td className="p-4 font-mono font-medium text-slate-900">{trx.id}</td>
									<td className="p-4">
										<div className="font-semibold text-slate-900">{trx.studentName}</div>
										<div className="text-[10px] text-slate-400">{trx.nisn}</div>
									</td>
									<td className="p-4">
										{trx.type === "TOPUP" && (
											<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700">
												<ArrowDownLeft className="w-3 h-3" /> Top Up Saldo
											</span>
										)}
										{trx.type === "PAYMENT" && (
											<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700">
												<Receipt className="w-3 h-3" /> Belanja Merchant
											</span>
										)}
										{trx.type === "WITHDRAWAL" && (
											<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700">
												<ArrowUpRight className="w-3 h-3" /> Penarikan Saldo
											</span>
										)}
									</td>
									<td className="p-4 font-medium">{trx.merchant}</td>
									<td className="p-4 text-slate-500">{trx.date}</td>
									<td className="p-4 text-right font-mono font-semibold text-slate-900">
										Rp {trx.amount.toLocaleString("id-ID")}
									</td>
									<td className="p-4 text-right">
										<span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
											{trx.status}
										</span>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</RojaCard>
		</div>
	)
}
