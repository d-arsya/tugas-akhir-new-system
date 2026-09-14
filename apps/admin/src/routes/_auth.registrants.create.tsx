import { type JSX } from "react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useForm } from "react-hook-form"
import { RojaCard, Button, Input, Label } from "@roja/ui"
import { AdminPageHeader } from "@/components/layout/admin-page-header"
import { toast } from "sonner"
import { UserPlus, ArrowLeft, Save } from "lucide-react"

export const Route = createFileRoute("/_auth/registrants/create")({
	component: CreateRegistrantPage,
})

function CreateRegistrantPage(): JSX.Element {
	const navigate = useNavigate()

	const form = useForm({
		defaultValues: {
			registrationNumber: "PSB-2026-" + Math.floor(1000 + Math.random() * 9000),
			fullName: "",
			gender: "L",
			pob: "Jakarta",
			dob: "2011-05-10",
			phone: "081298765432",
			parentName: "",
			chosenLevel: "SMP (Tsanawiyah)",
			chosenMajor: "Tahfidz & Kitab",
		},
	})

	const handleSave = (data: any) => {
		toast.success(`Calon Santri ${data.fullName || "Baru"} berhasil didaftarkan!`)
		navigate({ to: "/registrants" as any })
	}

	return (
		<div className="space-y-6">
			<AdminPageHeader
				title="Pendaftaran Manual Calon Santri PSB"
				subtitle="Input berkas formulir calon santri baru secara langsung oleh panitia PSB"
				actions={
					<Button
						variant="outline"
						onClick={() => navigate({ to: "/registrants" as any })}
						className="gap-2 bg-white text-xs"
					>
						<ArrowLeft className="w-4 h-4" /> Kembali
					</Button>
				}
			/>

			<RojaCard className="p-6 bg-white shadow-xs border-0 rounded-2xl max-w-2xl mx-auto space-y-4">
				<h5 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100 flex items-center gap-2">
					<UserPlus className="w-4 h-4 text-[var(--primary)]" /> Formulir Calon Santri
				</h5>

				<form onSubmit={form.handleSubmit(handleSave)} className="space-y-4 text-xs">
					<div>
						<Label>Nomor Registrasi PSB</Label>
						<Input {...form.register("registrationNumber")} required readOnly className="mt-1 font-mono bg-slate-50 text-xs" />
					</div>

					<div>
						<Label>Nama Lengkap Calon Santri</Label>
						<Input {...form.register("fullName")} required placeholder="cth: Ahmad Fauzi" className="mt-1 text-xs" />
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div>
							<Label>Jenis Kelamin</Label>
							<select {...form.register("gender")} className="w-full mt-1 px-3 py-2 bg-slate-50 rounded-xl text-xs border border-slate-200">
								<option value="L">Laki-laki</option>
								<option value="P">Perempuan</option>
							</select>
						</div>
						<div>
							<Label>No. WhatsApp Orang Tua</Label>
							<Input {...form.register("phone")} required className="mt-1 font-mono text-xs" />
						</div>
					</div>

					<div>
						<Label>Nama Orang Tua / Wali</Label>
						<Input {...form.register("parentName")} required placeholder="Nama Ayah/Ibu" className="mt-1 text-xs" />
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div>
							<Label>Pilihan Jenjang</Label>
							<select {...form.register("chosenLevel")} className="w-full mt-1 px-3 py-2 bg-slate-50 rounded-xl text-xs border border-slate-200">
								<option value="SMP (Tsanawiyah)">SMP (Tsanawiyah)</option>
								<option value="SMA (Aliyah)">SMA (Aliyah)</option>
							</select>
						</div>
						<div>
							<Label>Pilihan Jurusan / Program</Label>
							<select {...form.register("chosenMajor")} className="w-full mt-1 px-3 py-2 bg-slate-50 rounded-xl text-xs border border-slate-200">
								<option value="Tahfidz & Kitab">Tahfidz & Kitab</option>
								<option value="IPA & Keagamaan">IPA & Keagamaan</option>
								<option value="IPS & Bahasa">IPS & Bahasa</option>
							</select>
						</div>
					</div>

					<div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
						<Button type="button" variant="outline" onClick={() => navigate({ to: "/registrants" as any })}>
							Batal
						</Button>
						<Button type="submit" className="bg-[var(--primary)] text-white gap-2">
							<Save className="w-4 h-4" /> Simpan Pendaftar
						</Button>
					</div>
				</form>
			</RojaCard>
		</div>
	)
}
