import { useState, type JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { adminApi } from "@/lib/api"
import { RojaCard, Button, Input, Label, PageLoader } from "@roja/ui"
import { AdminPageHeader } from "@/components/layout/admin-page-header"
import { formatDate } from "@roja/utils"
import type { CreateBannedIpDto } from "@roja/types"
import { toast } from "sonner"
import { Ban, Search, Trash2 } from "lucide-react"

export const Route = createFileRoute("/_auth/ip-bans")({
	component: IpBansPage,
})

function IpBansPage(): JSX.Element {
	const queryClient = useQueryClient()
	const [search, setSearch] = useState("")
	const [showAddModal, setShowAddModal] = useState(false)

	const { data, isLoading } = useQuery({
		queryKey: ["admin-ip-bans", search],
		queryFn: () => adminApi.getBannedIps({ search }),
	})

	const form = useForm<CreateBannedIpDto>({
		defaultValues: { ipAddress: "", reason: "" },
	})

	const banMutation = useMutation({
		mutationFn: (dto: CreateBannedIpDto) => adminApi.createBannedIp(dto),
		onSuccess: (res) => {
			toast.success(res.message || "IP Address berhasil diblokir.")
			setShowAddModal(false)
			form.reset()
			queryClient.invalidateQueries({ queryKey: ["admin-ip-bans"] })
		},
		onError: (err: any) => toast.error(err.message || "Gagal memblokir IP Address."),
	})

	const deleteMutation = useMutation({
		mutationFn: (id: number) => adminApi.deleteBannedIp(id),
		onSuccess: (res) => {
			toast.success(res.data.message || "Blokir IP dihapus.")
			queryClient.invalidateQueries({ queryKey: ["admin-ip-bans"] })
		},
	})

	if (isLoading) return <PageLoader />

	const bannedIps = data?.data.items || []

	return (
		<div className="space-y-6">
			<AdminPageHeader
				title="Daftar IP Diblokir"
				subtitle="Daftar alamat IP yang dicekal dari mengakses seluruh portal dan API Roja."
				actions={
					<Button
						onClick={() => setShowAddModal(true)}
						className="bg-red-600 hover:bg-red-700 text-white gap-2 shadow-xs border-0"
					>
						<Ban className="w-4 h-4" />
						<span>Blokir IP Baru</span>
					</Button>
				}
			/>

			<RojaCard className="p-4 border-0 shadow-xs">
				<div className="w-full sm:w-80">
					<Input
						placeholder="Cari alamat IP atau alasan..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="bg-slate-50 border-0"
					/>
				</div>
			</RojaCard>

			<RojaCard className="overflow-x-auto p-0 border-0 shadow-xs">
				<table className="w-full text-left text-xs">
					<thead>
						<tr className="bg-slate-50/80 text-slate-600 font-semibold uppercase tracking-wider">
							<th className="py-3.5 px-4">Alamat IP</th>
							<th className="py-3.5 px-4">Alasan Pemblokiran</th>
							<th className="py-3.5 px-4">Oleh Administrator</th>
							<th className="py-3.5 px-4">Tanggal Pemblokiran</th>
							<th className="py-3.5 px-4 text-right">Aksi</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-slate-100/60">
						{bannedIps.map((b) => (
							<tr key={b.id} className="hover:bg-slate-50/50 transition">
								<td className="py-3 px-4 font-mono font-bold text-red-600">{b.ipAddress}</td>
								<td className="py-3 px-4 text-slate-700">{b.reason}</td>
								<td className="py-3 px-4 text-slate-600">{b.bannedBy}</td>
								<td className="py-3 px-4 text-slate-500">{formatDate(b.createdAt, "dd MMM yyyy HH:mm")}</td>
								<td className="py-3 px-4 text-right">
									<Button
										size="sm"
										variant="ghost"
										onClick={() => deleteMutation.mutate(b.id)}
										className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 gap-1"
									>
										<Trash2 className="w-3.5 h-3.5" /> Hapus Blokir
									</Button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</RojaCard>

			{/* Add Ban Modal */}
			{showAddModal && (
				<div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
					<div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4 shadow-xl">
						<h5 className="text-base font-bold text-slate-900">Blokir Alamat IP Baru</h5>
						<form onSubmit={form.handleSubmit((val) => banMutation.mutate(val))} className="space-y-3">
							<div className="space-y-1">
								<Label htmlFor="ipAddress">Alamat IP (IPv4 / IPv6)</Label>
								<Input id="ipAddress" {...form.register("ipAddress", { required: true })} placeholder="Contoh: 198.51.100.44" className="bg-slate-50 border-0" />
							</div>
							<div className="space-y-1">
								<Label htmlFor="reason">Alasan Pemblokiran</Label>
								<Input id="reason" {...form.register("reason", { required: true })} placeholder="Contoh: Terdeteksi Brute Force login" className="bg-slate-50 border-0" />
							</div>

							<div className="flex justify-end gap-2 pt-3">
								<Button type="button" variant="ghost" onClick={() => setShowAddModal(false)}>Batal</Button>
								<Button type="submit" className="bg-red-600 text-white border-0" disabled={banMutation.isPending}>Blokir Alamat IP</Button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	)
}

export default IpBansPage
