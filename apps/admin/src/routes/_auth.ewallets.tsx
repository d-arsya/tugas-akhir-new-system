import { useState, type JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { adminApi } from "@/lib/api"
import { RojaCard, Button, Input, Label, PageLoader } from "@roja/ui"
import { AdminPageHeader } from "@/components/layout/admin-page-header"
import type { AdminEwalletItem } from "@roja/types"
import { formatRupiah } from "@roja/utils"
import { toast } from "sonner"
import { DollarSign, Key, Search, ArrowDownLeft, ArrowUpRight, QrCode, Printer, Wallet, Users, Store } from "lucide-react"

export const Route = createFileRoute("/_auth/ewallets")({
	component: EwalletsPage,
})

function EwalletsPage(): JSX.Element {
	const queryClient = useQueryClient()
	const [search, setSearch] = useState("")
	const [typeFilter, setTypeFilter] = useState("ALL")
	const [topUpItem, setTopUpItem] = useState<AdminEwalletItem | null>(null)
	const [topUpAmount, setTopUpAmount] = useState(50000)
	const [withdrawItem, setWithdrawItem] = useState<AdminEwalletItem | null>(null)
	const [withdrawAmount, setWithdrawAmount] = useState(50000)
	const [qrCardItem, setQrCardItem] = useState<AdminEwalletItem | null>(null)

	const { data, isLoading } = useQuery({
		queryKey: ["admin-ewallets", search, typeFilter],
		queryFn: () =>
			adminApi.getEwallets({
				...(search ? { search } : {}),
				...(typeFilter !== "ALL" ? { type: typeFilter } : {}),
			}),
	})

	const topUpMutation = useMutation({
		mutationFn: () => adminApi.topUpEwalletCash(topUpItem!.id, topUpAmount),
		onSuccess: (res) => {
			toast.success(res.message)
			queryClient.invalidateQueries({ queryKey: ["admin-ewallets"] })
			setTopUpItem(null)
		},
		onError: (err: Error) => toast.error(err.message),
	})

	const withdrawMutation = useMutation({
		mutationFn: () =>
			adminApi.withdrawEwalletCash({ ewalletAccountId: withdrawItem!.id, amount: withdrawAmount }),
		onSuccess: (res) => {
			toast.success(res.message)
			queryClient.invalidateQueries({ queryKey: ["admin-ewallets"] })
			setWithdrawItem(null)
		},
		onError: (err: Error) => toast.error(err.message),
	})

	const resetPinMutation = useMutation({
		mutationFn: (id: number) => adminApi.resetEwalletPin(id),
		onSuccess: (res) => toast.success(res.message),
	})

	const ewallets = data?.data?.items || []
	const totalBalance = ewallets.reduce((acc, e) => acc + e.balance, 0)
	const santriAccounts = ewallets.filter((e) => e.ownerType === "SANTRI").length
	const merchantAccounts = ewallets.filter((e) => e.ownerType === "MERCHANT").length

	if (isLoading) return <PageLoader />

	return (
		<div className="space-y-6">
			<AdminPageHeader
				title="Meja Kasir & E-Wallet Santri"
				subtitle="Pengelolaan saldo digital santri, loket setor & tarik tunai kasir koperasi, serta cetak kartu QR"
			/>

			{/* KPI Summary Cards */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<RojaCard className="p-4 bg-white shadow-xs border-0 rounded-2xl flex items-center gap-4">
					<div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
						<Wallet className="w-6 h-6" />
					</div>
					<div>
						<span className="text-xs text-slate-400 font-medium">Total Saldo Terhimpun</span>
						<div className="text-lg font-bold text-slate-900">{formatRupiah(totalBalance)}</div>
					</div>
				</RojaCard>

				<RojaCard className="p-4 bg-white shadow-xs border-0 rounded-2xl flex items-center gap-4">
					<div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
						<Users className="w-6 h-6" />
					</div>
					<div>
						<span className="text-xs text-slate-400 font-medium">Akun E-Wallet Santri</span>
						<div className="text-lg font-bold text-slate-900">{santriAccounts} Santri Terdaftar</div>
					</div>
				</RojaCard>

				<RojaCard className="p-4 bg-white shadow-xs border-0 rounded-2xl flex items-center gap-4">
					<div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
						<Store className="w-6 h-6" />
					</div>
					<div>
						<span className="text-xs text-slate-400 font-medium">Akun Merchant / Kantin</span>
						<div className="text-lg font-bold text-slate-900">{merchantAccounts} Merchant Aktif</div>
					</div>
				</RojaCard>
			</div>

			{/* Filter Toolbar */}
			<RojaCard className="p-4 bg-white shadow-xs border-0 rounded-2xl">
				<div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
					<div className="w-full sm:w-80">
						<Input
							placeholder="Cari No. Akun / Nama Pemilik..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="bg-slate-50 border-0"
						/>
					</div>

					<div className="flex items-center gap-2">
						{["ALL", "SANTRI", "MERCHANT"].map((t) => (
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
								{t === "ALL" ? "Semua Akun" : t}
							</button>
						))}
					</div>
				</div>
			</RojaCard>

			{/* Datatable */}
			<RojaCard className="bg-white shadow-xs border-0 rounded-2xl overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full text-left text-xs">
						<thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-100">
							<tr>
								<th className="p-4">No. Rekening E-Wallet</th>
								<th className="p-4">Pemilik Akun</th>
								<th className="p-4">Tipe Pemilik</th>
								<th className="p-4">Saldo Aktif</th>
								<th className="p-4">Status</th>
								<th className="p-4 text-right">Aksi Meja Kasir</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100 text-slate-700">
							{ewallets.map((item: AdminEwalletItem) => (
								<tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
									<td className="p-4 font-mono font-bold text-slate-900">{item.accountNumber}</td>
									<td className="p-4 font-semibold text-slate-900">{item.ownerName}</td>
									<td className="p-4 font-medium text-emerald-700">{item.ownerType}</td>
									<td className="p-4 font-bold text-slate-900 font-mono text-sm">{formatRupiah(item.balance)}</td>
									<td className="p-4">
										<span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
											{item.status}
										</span>
									</td>
									<td className="p-4 text-right">
										<div className="flex items-center justify-end gap-1.5">
											<Button
												size="sm"
												onClick={() => {
													setTopUpAmount(50000)
													setTopUpItem(item)
												}}
												className="bg-emerald-600 text-white hover:bg-emerald-700 gap-1 text-xs px-2.5 py-1"
											>
												<ArrowDownLeft className="w-3.5 h-3.5" /> Setor Tunai
											</Button>

											<Button
												size="sm"
												onClick={() => {
													setWithdrawAmount(50000)
													setWithdrawItem(item)
												}}
												className="bg-amber-600 text-white hover:bg-amber-700 gap-1 text-xs px-2.5 py-1"
											>
												<ArrowUpRight className="w-3.5 h-3.5" /> Tarik Tunai
											</Button>

											<button
												type="button"
												onClick={() => setQrCardItem(item)}
												className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
												title="Cetak Kartu Santri QR"
											>
												<QrCode className="w-3.5 h-3.5" />
											</button>

											<button
												type="button"
												onClick={() => {
													if (confirm(`Reset PIN e-wallet untuk ${item.ownerName}?`)) {
														resetPinMutation.mutate(item.id)
													}
												}}
												className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
												title="Reset PIN"
											>
												<Key className="w-3.5 h-3.5" />
											</button>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</RojaCard>

			{/* Modal: Top-Up Tunai Kasir */}
			{topUpItem && (
				<div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
					<div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl space-y-4">
						<div className="flex items-center justify-between border-b border-slate-100 pb-3">
							<h5 className="font-bold text-slate-900 text-base flex items-center gap-2">
								<ArrowDownLeft className="w-5 h-5 text-emerald-600" /> Setor Tunai Kasir (Top-Up)
							</h5>
							<button onClick={() => setTopUpItem(null)} className="text-slate-400 hover:text-slate-700">✕</button>
						</div>

						<div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
							<div className="font-bold text-slate-900">{topUpItem.ownerName}</div>
							<div className="text-slate-500 font-mono">{topUpItem.accountNumber}</div>
							<div className="text-emerald-700 font-bold">Saldo Saat Ini: {formatRupiah(topUpItem.balance)}</div>
						</div>

						<div className="space-y-2">
							<Label>Nominal Setoran Tunai (Rp)</Label>
							<Input
								type="number"
								value={topUpAmount}
								onChange={(e) => setTopUpAmount(Number(e.target.value))}
								className="font-bold text-slate-900 text-base font-mono"
							/>
							<div className="grid grid-cols-4 gap-1.5 pt-1">
								{[20000, 50000, 100000, 200000].map((amt) => (
									<button
										key={amt}
										type="button"
										onClick={() => setTopUpAmount(amt)}
										className="py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-semibold text-slate-700"
									>
										{amt / 1000}k
									</button>
								))}
							</div>
						</div>

						<div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
							<Button variant="outline" onClick={() => setTopUpItem(null)}>Batal</Button>
							<Button
								onClick={() => topUpMutation.mutate()}
								disabled={topUpMutation.isPending}
								className="bg-emerald-600 text-white hover:bg-emerald-700"
							>
								{topUpMutation.isPending ? "Memproses..." : "Konfirmasi Setor Tunai"}
							</Button>
						</div>
					</div>
				</div>
			)}

			{/* Modal: Tarik Tunai Kasir */}
			{withdrawItem && (
				<div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
					<div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl space-y-4">
						<div className="flex items-center justify-between border-b border-slate-100 pb-3">
							<h5 className="font-bold text-slate-900 text-base flex items-center gap-2">
								<ArrowUpRight className="w-5 h-5 text-amber-600" /> Tarik Tunai Meja Kasir
							</h5>
							<button onClick={() => setWithdrawItem(null)} className="text-slate-400 hover:text-slate-700">✕</button>
						</div>

						<div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
							<div className="font-bold text-slate-900">{withdrawItem.ownerName}</div>
							<div className="text-slate-500 font-mono">{withdrawItem.accountNumber}</div>
							<div className="text-emerald-700 font-bold">Saldo Tersedia: {formatRupiah(withdrawItem.balance)}</div>
						</div>

						<div className="space-y-2">
							<Label>Nominal Penarikan Tunai (Rp)</Label>
							<Input
								type="number"
								value={withdrawAmount}
								onChange={(e) => setWithdrawAmount(Number(e.target.value))}
								className="font-bold text-slate-900 text-base font-mono"
							/>
						</div>

						<div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
							<Button variant="outline" onClick={() => setWithdrawItem(null)}>Batal</Button>
							<Button
								onClick={() => withdrawMutation.mutate()}
								disabled={withdrawMutation.isPending}
								className="bg-amber-600 text-white hover:bg-amber-700"
							>
								{withdrawMutation.isPending ? "Memproses..." : "Serahkan Uang Tunai"}
							</Button>
						</div>
					</div>
				</div>
			)}

			{/* Modal: Cetak Kartu Santri QR */}
			{qrCardItem && (
				<div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
					<div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-4">
						<div className="flex items-center justify-between border-b border-slate-100 pb-3">
							<div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
								<QrCode className="w-4 h-4 text-emerald-600" /> Kartu E-Wallet Santri
							</div>
							<button onClick={() => setQrCardItem(null)} className="text-slate-400 hover:text-slate-700">✕</button>
						</div>

						<div className="p-5 bg-gradient-to-br from-emerald-600 to-teal-800 text-white rounded-2xl shadow-md space-y-4">
							<div className="flex justify-between items-center">
								<span className="font-bold text-xs tracking-wider uppercase">KARTU SANTRI DIGITAL</span>
								<span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-mono font-bold">ROJA WALLET</span>
							</div>

							<div className="bg-white p-3 rounded-xl flex items-center justify-center">
								<img
									src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${qrCardItem.accountNumber}`}
									alt="QR Code"
									className="w-32 h-32"
								/>
							</div>

							<div className="text-center">
								<div className="font-bold text-sm">{qrCardItem.ownerName}</div>
								<div className="text-xs font-mono text-emerald-100">{qrCardItem.accountNumber}</div>
							</div>
						</div>

						<div className="flex justify-end gap-2 pt-2">
							<Button variant="outline" onClick={() => setQrCardItem(null)}>Tutup</Button>
							<Button
								onClick={() => {
									window.print()
									toast.success("Mencetak kartu santri QR...")
								}}
								className="bg-emerald-600 text-white gap-1.5"
							>
								<Printer className="w-4 h-4" /> Cetak Kartu
							</Button>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}

