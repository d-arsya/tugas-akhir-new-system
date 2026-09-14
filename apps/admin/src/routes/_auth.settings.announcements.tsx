import { type JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { useForm } from "react-hook-form"
import { RojaCard, Button, Input, Label } from "@roja/ui"
import { AdminPageHeader } from "@/components/layout/admin-page-header"
import { toast } from "sonner"
import { Megaphone, Save } from "lucide-react"

export const Route = createFileRoute("/_auth/settings/announcements")({
	component: SettingsAnnouncementsPage,
})

function SettingsAnnouncementsPage(): JSX.Element {
	const form = useForm({
		defaultValues: {
			title: "Pengumuman Hasil Seleksi Gelombang 1 PSB 2026/2027",
			content:
				"Selamat kepada calon santri yang dinyatakan lolos seleksi gelombang 1. Silakan lakukan daftar ulang dan verifikasi dokumen sebelum 30 September 2026.",
			isPublished: true,
			publishDate: "2026-09-01",
		},
	})

	const handleSave = (data: any) => {
		toast.success("Pengumuman PSB berhasil diperbarui!")
	}

	return (
		<div className="space-y-6">
			<AdminPageHeader
				title="Pengaturan Pengumuman PSB"
				subtitle="Kelola pengumuman kelulusan dan informasi penting pendaftaran santri baru"
			/>

			<RojaCard className="p-6 bg-white shadow-xs border-0 rounded-2xl max-w-2xl space-y-4">
				<h5 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100 flex items-center gap-2">
					<Megaphone className="w-4 h-4 text-[var(--primary)]" /> Banner Pengumuman Website PSB
				</h5>

				<form onSubmit={form.handleSubmit(handleSave)} className="space-y-4 text-xs">
					<div>
						<Label>Judul Pengumuman</Label>
						<Input {...form.register("title")} required className="mt-1 font-bold text-slate-900 text-xs" />
					</div>

					<div>
						<Label>Isi Pengumuman / Pesan</Label>
						<textarea
							{...form.register("content")}
							rows={5}
							required
							className="w-full mt-1 p-3 bg-slate-50 border-0 rounded-xl text-xs text-slate-800"
						/>
					</div>

					<div>
						<Label>Tanggal Tayang Pengumuman</Label>
						<Input type="date" {...form.register("publishDate")} required className="mt-1 text-xs" />
					</div>

					<label className="flex items-center gap-2 pt-2 cursor-pointer">
						<input type="checkbox" {...form.register("isPublished")} className="rounded text-[var(--primary)]" />
						<span className="font-semibold text-slate-800">Tampilkan Banner Pengumuman Ini di Halaman Utama PSB</span>
					</label>

					<div className="flex justify-end pt-4 border-t border-slate-100">
						<Button type="submit" className="bg-[var(--primary)] text-white gap-2">
							<Save className="w-4 h-4" /> Simpan Pengumuman
						</Button>
					</div>
				</form>
			</RojaCard>
		</div>
	)
}
