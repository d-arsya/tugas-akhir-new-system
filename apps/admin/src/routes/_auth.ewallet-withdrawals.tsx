import { type JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { adminApi } from "@/lib/api"
import { RojaCard, Button, PageLoader } from "@roja/ui"
import { AdminPageHeader } from "@/components/layout/admin-page-header"
import { formatRupiah } from "@roja/utils"
import { toast } from "sonner"
import { CheckCircle2, XCircle } from "lucide-react"

export const Route = createFileRoute("/_auth/ewallet-withdrawals")({
	component: WithdrawalsPage,
})

function WithdrawalsPage(): JSX.Element {
	const queryClient = useQueryClient()

	const { data, isLoading } = useQuery({
		queryKey: ["admin-withdrawals"],
		queryFn: () => adminApi.getWithdrawalRequests(),
	})

	const approveMutation = useMutation({
		mutationFn: (id: number) => adminApi.approveWithdrawal(id),
		onSuccess: (res) => {
			toast.success(res.message)
			queryClient.invalidateQueries({ queryKey: ["admin-withdrawals"] })
			queryClient.invalidateQueries({ queryKey: ["admin-ewallets"] })
		},
	})

	const rejectMutation = useMutation({
		mutationFn: (id: number) => adminApi.rejectWithdrawal(id, "Batas penarikan terlampaui"),
		onSuccess: (res) => {
			toast.success(res.message)
			queryClient.invalidateQueries({ queryKey: ["admin-withdrawals"] })
		},
	})

	const items = data?.data?.items || []

	if (isLoading) return <PageLoader />

	return (
		<div className="space-y-6">
			<AdminPageHeader
				title="Persetujuan Penarikan Saldo E-Wallet"
				subtitle="Verifikasi pencairan saldo tunai untuk merchant dan santri"
			/>

			<RojaCard className="bg-white shadow-xs border-0 rounded-2xl overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full text-left text-xs">
						<thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-100">
							<tr>
								<th className="p-4">Nama Merchant / Santri</th>
								<th className="p-4">Jumlah Penarikan</th>
								<th className="p-4">Kasir Bertanggung Jawab</th>
								<th className="p-4">Waktu Permintaan</th>
								<th className="p-4">Status</th>
								<th className="p-4 text-right">Aksi</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100 text-slate-700">
							{items.map((item) => (
								<tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
									<td className="p-4 font-semibold text-slate-900">{item.ownerName}</td>
									<td className="p-4 font-bold text-rose-600">{formatRupiah(item.amount)}</td>
									<td className="p-4 font-medium text-slate-600">{item.cashierName || "-"}</td>
									<td className="p-4 text-slate-500">{item.requestedAt}</td>
									<td className="p-4">
										<span
											className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
												item.status === "APPROVED"
													? "bg-emerald-50 text-emerald-700"
													: item.status === "REJECTED"
													? "bg-rose-50 text-rose-700"
													: "bg-amber-50 text-amber-700"
											}`}
										>
											{item.status}
										</span>
									</td>
									<td className="p-4 text-right space-x-2">
										{item.status === "PENDING" && (
											<>
												<Button
													size="sm"
													variant="outline"
													onClick={() => rejectMutation.mutate(item.id)}
													className="text-rose-700 hover:bg-rose-50 gap-1"
												>
													<XCircle className="w-3.5 h-3.5" /> Tolak
												</Button>
												<Button
													size="sm"
													onClick={() => approveMutation.mutate(item.id)}
													className="bg-emerald-600 text-white hover:bg-emerald-700 gap-1"
												>
													<CheckCircle2 className="w-3.5 h-3.5" /> Setujui & Cairkan
												</Button>
											</>
										)}
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
