import { type JSX } from "react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useForm } from "react-hook-form"
import { RojaCard, Button, Input, Label } from "@roja/ui"
import { AdminPageHeader } from "@/components/layout/admin-page-header"
import { toast } from "sonner"
import { Store, ArrowLeft, Save } from "lucide-react"

export const Route = createFileRoute("/_auth/merchants/create")({
	component: CreateMerchantPage,
})

function CreateMerchantPage(): JSX.Element {
	const navigate = useNavigate()

	const form = useForm({
		defaultValues: {
			code: "MCH-" + Math.floor(100 + Math.random() * 900),
			name: "",
			ownerName: "",
			phone: "081234560000",
			category: "Kantin / Dapur",
			commissionRate: "2.5",
		},
	})

	const handleSave = (data: any) => {
		toast.success(`Merchant ${data.name || "Baru"} berhasil ditambahkan!`)
		navigate({ to: "/merchants" as any })
	}

	return (
		<div className="space-y-6">
			<AdminPageHeader
				title="Tambah Merchant Baru"
				subtitle="Pendaftaran unit usaha / kantin / toko mitra e-wallet Pondok Roja"
				actions={
					<Button
						variant="outline"
						onClick={() => navigate({ to: "/merchants" as any })}
						className="gap-2 bg-white text-xs"
					>
						<ArrowLeft className="w-4 h-4" /> Kembali
					</Button>
				}
			/>

			<RojaCard className="p-6 bg-white shadow-xs border-0 rounded-2xl max-w-lg mx-auto space-y-4">
				<h5 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100 flex items-center gap-2">
					<Store className="w-4 h-4 text-[var(--primary)]" /> Pendaftaran Merchant
				</h5>

				<form onSubmit={form.handleSubmit(handleSave)} className="space-y-4 text-xs">
					<div className="grid grid-cols-2 gap-4">
						<div>
							<Label>Kode Merchant</Label>
							<Input {...form.register("code")} required readOnly className="mt-1 font-mono bg-slate-50 text-xs" />
						</div>
						<div>
							<Label>Kategori Usaha</Label>
							<select {...form.register("category")} className="w-full mt-1 px-3 py-2 bg-slate-50 rounded-xl text-xs border border-slate-200">
								<option value="Kantin / Dapur">Kantin / Dapur</option>
								<option value="Koperasi / Toko">Koperasi / Toko</option>
								<option value="Laundry Santri">Laundry Santri</option>
								<option value="Fotokopi & Alat Tulis">Fotokopi & Alat Tulis</option>
							</select>
						</div>
					</div>

					<div>
						<Label>Nama Toko / Merchant</Label>
						<Input {...form.register("name")} required placeholder="cth: Kantin Putra Berkah" className="mt-1 text-xs" />
					</div>

					<div>
						<Label>Nama Pemilik / Penanggung Jawab</Label>
						<Input {...form.register("ownerName")} required placeholder="cth: Ustadz Ahmad" className="mt-1 text-xs" />
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div>
							<Label>No. Telepon / WhatsApp</Label>
							<Input {...form.register("phone")} required className="mt-1 font-mono text-xs" />
						</div>
						<div>
							<Label>Bagi Hasil / Komisi (%)</Label>
							<Input {...form.register("commissionRate")} required className="mt-1 font-mono text-xs" />
						</div>
					</div>

					<div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
						<Button type="button" variant="outline" onClick={() => navigate({ to: "/merchants" as any })}>
							Batal
						</Button>
						<Button type="submit" className="bg-[var(--primary)] text-white gap-2">
							<Save className="w-4 h-4" /> Simpan Merchant
						</Button>
					</div>
				</form>
			</RojaCard>
		</div>
	)
}
