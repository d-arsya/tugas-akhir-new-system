import { type JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { useForm } from "react-hook-form"
import { RojaCard, Button, Input, Label } from "@roja/ui"
import { AdminPageHeader } from "@/components/layout/admin-page-header"
import { toast } from "sonner"
import { School, Save } from "lucide-react"

export const Route = createFileRoute("/_auth/settings/school")({
	component: SettingsSchoolPage,
})

function SettingsSchoolPage(): JSX.Element {
	const form = useForm({
		defaultValues: {
			schoolName: "Pondok Pesantren Roja Al-Islamiyyah",
			nspp: "510032010999",
			foundationName: "Yayasan Pendidikan Roja Indonesia",
			leaderName: "KH. Ahmad Dahlan Al-Hafidz",
			phone: "0251-8392011",
			email: "info@pondokroja.com",
			website: "https://pondokroja.com",
			address: "Jl. Raya Ciawi - Puncak KM 7, Desa Pandansari, Kec. Ciawi, Kabupaten Bogor, Jawa Barat 16720",
		},
	})

	const handleSave = (data: any) => {
		toast.success("Profil Lembaga Pondok Roja berhasil diperbarui!")
	}

	return (
		<div className="space-y-6">
			<AdminPageHeader
				title="Profil Lembaga Pondok Pesantren"
				subtitle="Identitas resmi pesantren, NSPP Kemenag, pimpinan yayasan, dan alamat kontak"
			/>

			<RojaCard className="p-6 bg-white shadow-xs border-0 rounded-2xl max-w-2xl space-y-4">
				<h5 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100 flex items-center gap-2">
					<School className="w-4 h-4 text-[var(--primary)]" /> Identitas Resmi Pondok Roja
				</h5>

				<form onSubmit={form.handleSubmit(handleSave)} className="space-y-4 text-xs">
					<div>
						<Label>Nama Resmi Pesantren</Label>
						<Input {...form.register("schoolName")} required className="mt-1 font-bold text-slate-900 text-xs" />
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div>
							<Label>NSPP (Nomor Statistik Pesantren)</Label>
							<Input {...form.register("nspp")} required className="mt-1 font-mono text-xs" />
						</div>
						<div>
							<Label>Nama Yayasan Naungan</Label>
							<Input {...form.register("foundationName")} required className="mt-1 text-xs" />
						</div>
					</div>

					<div>
						<Label>Pimpinan / Pengasuh Pesantren</Label>
						<Input {...form.register("leaderName")} required className="mt-1 font-semibold text-slate-900 text-xs" />
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div>
							<Label>Telepon Kantor</Label>
							<Input {...form.register("phone")} required className="mt-1 font-mono text-xs" />
						</div>
						<div>
							<Label>Email Resmi</Label>
							<Input type="email" {...form.register("email")} required className="mt-1 font-mono text-xs" />
						</div>
					</div>

					<div>
						<Label>Alamat Lengkap Pesantren</Label>
						<textarea
							{...form.register("address")}
							rows={3}
							required
							className="w-full mt-1 p-3 bg-slate-50 border-0 rounded-xl text-xs text-slate-800"
						/>
					</div>

					<div className="flex justify-end pt-4 border-t border-slate-100">
						<Button type="submit" className="bg-[var(--primary)] text-white gap-2">
							<Save className="w-4 h-4" /> Simpan Profil Pondok
						</Button>
					</div>
				</form>
			</RojaCard>
		</div>
	)
}
