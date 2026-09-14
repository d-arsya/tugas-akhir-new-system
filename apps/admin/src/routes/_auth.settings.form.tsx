import { type JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { RojaCard, Button } from "@roja/ui"
import { AdminPageHeader } from "@/components/layout/admin-page-header"
import { toast } from "sonner"
import { Sliders, Save, CheckSquare, Square } from "lucide-react"

export const Route = createFileRoute("/_auth/settings/form")({
	component: SettingsFormPage,
})

function SettingsFormPage(): JSX.Element {
	const fields = [
		{ id: 1, label: "Nama Lengkap Santri", section: "Data Diri", required: true, enabled: true },
		{ id: 2, label: "NISN", section: "Data Diri", required: true, enabled: true },
		{ id: 3, label: "NIK (Nomor Induk Kependudukan)", section: "Data Diri", required: true, enabled: true },
		{ id: 4, label: "Tempat & Tanggal Lahir", section: "Data Diri", required: true, enabled: true },
		{ id: 5, label: "Ukuran Seragam & Pechi", section: "Perlengkapan", required: false, enabled: true },
		{ id: 6, label: "Riwayat Penyakit & Alergi", section: "Kesehatan", required: false, enabled: true },
		{ id: 7, label: "Penghasilan Orang Tua / Bulan", section: "Data Wali", required: false, enabled: true },
		{ id: 8, label: "Upload Berkas Kartu Keluarga (KK)", section: "Dokumen", required: true, enabled: true },
		{ id: 9, label: "Upload Ijazah Terakhir / SKL", section: "Dokumen", required: true, enabled: true },
	]

	return (
		<div className="space-y-6">
			<AdminPageHeader
				title="Pengaturan Form Data Santri"
				subtitle="Konfigurasi bidang isian formulir pendaftaran santri baru (PSB) & kelengkapan dokumen"
			/>

			<RojaCard className="bg-white shadow-xs border-0 rounded-2xl overflow-hidden">
				<div className="p-4 border-b border-slate-100 flex items-center justify-between">
					<h5 className="font-bold text-slate-900 text-sm flex items-center gap-2">
						<Sliders className="w-4 h-4 text-[var(--primary)]" /> Bidang Formulir Isian (Form Fields)
					</h5>
					<Button
						onClick={() => toast.success("Pengaturan bidang formulir berhasil disimpan!")}
						className="bg-[var(--primary)] text-white gap-2 text-xs"
					>
						<Save className="w-4 h-4" /> Simpan Konfigurasi Form
					</Button>
				</div>

				<div className="overflow-x-auto">
					<table className="w-full text-left text-xs">
						<thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-100">
							<tr>
								<th className="p-4 w-12">No</th>
								<th className="p-4">Nama Bidang Isian (Field)</th>
								<th className="p-4">Kategori / Kelompok</th>
								<th className="p-4">Wajib Diisi (Required)</th>
								<th className="p-4 text-right">Status Aktif</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100 text-slate-700">
							{fields.map((f, idx) => (
								<tr key={f.id} className="hover:bg-slate-50/60 transition-colors">
									<td className="p-4 font-semibold text-slate-900">{idx + 1}</td>
									<td className="p-4 font-bold text-slate-900">{f.label}</td>
									<td className="p-4">
										<span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
											{f.section}
										</span>
									</td>
									<td className="p-4">
										<span
											className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
												f.required ? "bg-rose-50 text-rose-700" : "bg-slate-100 text-slate-500"
											}`}
										>
											{f.required ? "Wajib" : "Opsional"}
										</span>
									</td>
									<td className="p-4 text-right">
										<input type="checkbox" defaultChecked={f.enabled} className="rounded text-[var(--primary)]" />
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
