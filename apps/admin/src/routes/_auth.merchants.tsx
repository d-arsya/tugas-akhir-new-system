import { useState, type JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { adminApi } from "@/lib/api"
import { RojaCard, Button, Input, Label, PageLoader } from "@roja/ui"
import { AdminPageHeader } from "@/components/layout/admin-page-header"
import type { AdminMerchantItem, CreateMerchantDto } from "@roja/types"
import { toast } from "sonner"
import { Store, Plus, QrCode, Search } from "lucide-react"

export const Route = createFileRoute("/_auth/merchants")({
	component: MerchantsPage,
})

function MerchantsPage(): JSX.Element {
	const queryClient = useQueryClient()
	const [search, setSearch] = useState("")
	const [showModal, setShowModal] = useState(false)

	const { data, isLoading } = useQuery({
		queryKey: ["admin-merchants", search],
		queryFn: () => adminApi.getMerchants({ ...(search ? { search } : {}) }),
	})

	const form = useForm<CreateMerchantDto>({
		defaultValues: { businessName: "", ownerName: "", email: "", phone: "" },
	})

	const createMutation = useMutation({
		mutationFn: (dto: CreateMerchantDto) => adminApi.createMerchant(dto),
		onSuccess: (res) => {
			toast.success(res.message)
			queryClient.invalidateQueries({ queryKey: ["admin-merchants"] })
			setShowModal(false)
			form.reset()
		},
	})

	const toggleStatusMutation = useMutation({
		mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) => adminApi.toggleMerchantStatus(id, isActive),
		onSuccess: (res) => {
			toast.success(res.message)
			queryClient.invalidateQueries({ queryKey: ["admin-merchants"] })
		},
	})

	const merchants = data?.data?.items || []

	if (isLoading) return <PageLoader />

	return (
		<div className="space-y-6">
			<AdminPageHeader
				title="Kelola Merchant & Kantin"
				subtitle="Daftar unit usaha terdaftar di lingkungan pesantren, QR payment payload, dan status aktivasi"
				actions={
					<Button onClick={() => setShowModal(true)} className="gap-2 bg-[var(--primary)] text-white hover:bg-emerald-700">
						<Plus className="w-4 h-4" />
						Tambah Merchant Baru
					</Button>
				}
			/>

			<RojaCard className="p-4 bg-white shadow-xs border-0 rounded-2xl">
				<div className="w-full sm:w-80">
					<Input
						placeholder="Cari Nama Merchant / Pemilik..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="bg-slate-50 border-0"
					/>
				</div>
			</RojaCard>

			{/* Datatable */}
			<RojaCard className="bg-white shadow-xs border-0 rounded-2xl overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full text-left text-xs">
						<thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-100">
							<tr>
								<th className="p-4">Nama Usaha / Toko</th>
								<th className="p-4">Pemilik Toko</th>
								<th className="p-4">Email & Kontak</th>
								<th className="p-4">QR Payload ID</th>
								<th className="p-4">Status</th>
								<th className="p-4 text-right">Aksi</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100 text-slate-700">
							{merchants.map((m: AdminMerchantItem) => (
								<tr key={m.id} className="hover:bg-slate-50/60 transition-colors">
									<td className="p-4 font-bold text-slate-900">{m.businessName}</td>
									<td className="p-4 font-semibold text-slate-800">{m.ownerName}</td>
									<td className="p-4 text-slate-600">
										<div>{m.email}</div>
										<div className="text-[10px] text-slate-400">{m.phone}</div>
									</td>
									<td className="p-4 font-mono text-emerald-700 flex items-center gap-1.5 font-bold">
										<QrCode className="w-3.5 h-3.5 text-slate-400" />
										{m.qrCodePayload}
									</td>
									<td className="p-4">
										<span
											className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
												m.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
											}`}
										>
											{m.isActive ? "AKTIF" : "NON-AKTIF"}
										</span>
									</td>
									<td className="p-4 text-right">
										<Button
											size="sm"
											variant="outline"
											onClick={() => toggleStatusMutation.mutate({ id: m.id, isActive: !m.isActive })}
											className={m.isActive ? "text-rose-600 hover:bg-rose-50" : "text-emerald-600 hover:bg-emerald-50"}
										>
											{m.isActive ? "Non-aktifkan" : "Aktifkan"}
										</Button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</RojaCard>

			{/* Create Merchant Modal */}
			{showModal && (
				<div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
					<div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl space-y-4">
						<h5 className="font-bold text-slate-900 text-base flex items-center gap-2">
							<Store className="w-5 h-5 text-[var(--primary)]" /> Pendaftaran Merchant Baru
						</h5>

						<form onSubmit={form.handleSubmit((d) => createMutation.mutate(d))} className="space-y-3">
							<div>
								<Label>Nama Usaha / Toko</Label>
								<Input {...form.register("businessName")} required placeholder="cth: Kantin Utama" className="mt-1" />
							</div>
							<div>
								<Label>Nama Pemilik Toko</Label>
								<Input {...form.register("ownerName")} required placeholder="cth: H. Ridwan" className="mt-1" />
							</div>
							<div>
								<Label>Email</Label>
								<Input type="email" {...form.register("email")} required className="mt-1" />
							</div>
							<div>
								<Label>No. HP / WhatsApp</Label>
								<Input {...form.register("phone")} required className="mt-1" />
							</div>

							<div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
								<Button type="button" variant="outline" onClick={() => setShowModal(false)}>
									Batal
								</Button>
								<Button type="submit" disabled={createMutation.isPending} className="bg-[var(--primary)] text-white">
									{createMutation.isPending ? "Mendaftarkan..." : "Daftarkan Merchant"}
								</Button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	)
}
