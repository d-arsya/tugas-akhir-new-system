import { type JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { adminApi } from "@/lib/api"
import { RojaCard, Button, PageLoader } from "@roja/ui"
import { AdminPageHeader } from "@/components/layout/admin-page-header"
import { formatRupiah } from "@roja/utils"
import { toast } from "sonner"
import { CheckCircle2, XCircle } from "lucide-react"

export const Route = createFileRoute("/_auth/ewallet-confirmations")({
	component: BankConfirmationsPage,
})

function BankConfirmationsPage(): JSX.Element {
	const queryClient = useQueryClient()

	const { data, isLoading } = useQuery({
		queryKey: ["admin-bank-confirmations"],
		queryFn: () => adminApi.getBankTransferConfirmations(),
	})

	const approveMutation = useMutation({
		mutationFn: (id: number) => adminApi.approveBankTransfer(id),
		onSuccess: (res) => {
			toast.success(res.message)
			queryClient.invalidateQueries({ queryKey: ["admin-bank-confirmations"] })
			queryClient.invalidateQueries({ queryKey: ["admin-ewallets"] })
		},
	})

	const rejectMutation = useMutation({
		mutationFn: (id: number) => adminApi.rejectBankTransfer(id, "Bukti transfer tidak valid"),
		onSuccess: (res) => {
			toast.success(res.message)
			queryClient.invalidateQueries({ queryKey: ["admin-bank-confirmations"] })
		},
	})

	const items = data?.data?.items || []

	if (isLoading) return <PageLoader />

	return (
		<div className="space-y-6">
			<AdminPageHeader
				title="Konfirmasi Transfer Bank (Top-Up E-Wallet)"
				subtitle="Verifikasi bukti pengiriman uang via transfer bank oleh santri/wali"
			/>

			<RojaCard className="bg-white shadow-xs border-0 rounded-2xl overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full text-left text-xs">
						<thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-100">
							<tr>
								<th className="p-4">Nama Pemilik</th>
								<th className="p-4">Bank & Pengirim</th>
								<th className="p-4">Nominal Transfer</th>
								<th className="p-4">Waktu Pengajuan</th>
								<th className="p-4">Status</th>
								<th className="p-4 text-right">Keputusan Kasir</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100 text-slate-700">
							{items.map((item) => (
								<tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
									<td className="p-4 font-semibold text-slate-900">{item.ownerName}</td>
									<td className="p-4">
										<div className="font-bold text-slate-800">{item.bankName}</div>
										<div className="text-[10px] text-slate-400">a.n. {item.accountHolder}</div>
									</td>
									<td className="p-4 font-bold text-emerald-600">{formatRupiah(item.amount)}</td>
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
													<CheckCircle2 className="w-3.5 h-3.5" /> Setujui
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
