import type { JSX } from "react"
import { useNavigate } from "@tanstack/react-router"
import {
	AlertTriangle,
	CheckCircle2,
	Clock,
	Award,
	HelpCircle,
	ArrowRight,
	Sparkles,
	ShieldCheck,
} from "lucide-react"
import { Button, Badge } from "@roja/ui"

export interface StatusHeroCardProps {
	status: string
	validationNote?: string | null
	registrationPath?: string | null
	registrantName?: string | null
}

export const StatusHeroCard = ({
	status,
	validationNote,
	registrationPath,
	registrantName,
}: StatusHeroCardProps): JSX.Element | null => {
	const navigate = useNavigate()
	const isIndent = registrationPath === "indent"

	// 1. Wait (Menunggu Verifikasi Berkas Awal)
	if (status === "wait") {
		return (
			<div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 md:p-6 shadow-2xs">
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
					<div className="lg:col-span-8 flex flex-col gap-2">
						<div className="flex items-center gap-2">
							<Badge variant="wait" className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
								In Review
							</Badge>
							<span className="text-[11px] text-slate-400 font-medium">Tahap 01: Verifikasi Berkas</span>
						</div>
						<h4 className="text-sm md:text-base font-bold text-slate-900 tracking-tight">
							Berkas Pendaftaran Sedang Diverifikasi
						</h4>
						<p className="text-xs text-slate-600 leading-relaxed font-normal">
							Data formulir dan lampiran dokumen pendaftaran atas nama{" "}
							<strong className="text-slate-900 font-semibold">{registrantName || "calon santri"}</strong> saat ini sedang dalam
							antrean verifikasi oleh panitia PSB Pondok Roja. Mohon menunggu pemberitahuan selanjutnya.
						</p>
					</div>
					<div className="lg:col-span-4 flex justify-center items-center">
						<img
							src="/assets/svg/illustration/No-Activity.svg"
							alt="Status Review"
							className="max-w-[150px] w-full h-auto object-contain select-none pointer-events-none drop-shadow-2xs"
						/>
					</div>
				</div>
			</div>
		)
	}

	// 2. Fixed (Data Perbaikan Telah Terkirim)
	if (status === "fixed") {
		return (
			<div className="rounded-xl border border-sky-200 bg-white p-5 md:p-6 shadow-2xs">
				<div className="flex items-start gap-3.5">
					<div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0 border border-sky-200">
						<CheckCircle2 className="w-6 h-6" />
					</div>
					<div className="flex flex-col gap-1">
						<div className="flex items-center gap-2">
							<Badge variant="info" className="px-2 py-0.5 text-[10px] font-bold">
								Perbaikan Terkirim
							</Badge>
							<span className="text-[11px] text-slate-400 font-medium">Menunggu Verifikasi Ulang</span>
						</div>
						<h4 className="text-sm md:text-base font-bold text-slate-900">
							Perubahan Data Berhasil Disimpan
						</h4>
						<p className="text-xs text-slate-600 leading-relaxed font-normal max-w-2xl">
							Terima kasih telah memperbarui berkas/data pendaftaran Anda. Panitia PSB akan segera melakukan verifikasi ulang terhadap data yang Anda kirimkan.
						</p>
					</div>
				</div>
			</div>
		)
	}

	// 3. Invalid (Data / Berkas Perlu Diperbaiki)
	if (status === "invalid") {
		return (
			<div className="rounded-xl border border-amber-300 bg-white p-5 md:p-6 shadow-2xs">
				<div className="flex flex-col gap-4">
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200">
								<AlertTriangle className="w-6 h-6" />
							</div>
							<div>
								<Badge variant="warning" className="px-2 py-0.5 text-[10px] font-bold mb-0.5">
									Perlu Tindakan
								</Badge>
								<h4 className="text-sm md:text-base font-bold text-amber-950">
									Data atau Berkas Tidak Valid
								</h4>
							</div>
						</div>

						<Button
							onClick={() => navigate({ to: "/invalid" })}
							variant="roja-warning"
							size="sm"
							className="font-bold shadow-2xs gap-1.5 self-start sm:self-auto"
						>
							<span>Perbaiki Data</span>
							<ArrowRight className="w-3.5 h-3.5" />
						</Button>
					</div>

					<p className="text-xs text-slate-600 leading-relaxed font-normal">
						Panitia menemukan beberapa data atau dokumen yang belum sesuai. Silakan periksa catatan di bawah dan perbaiki data Anda:
					</p>

					{validationNote && (
						<div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 shadow-2xs">
							<span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
								Catatan dari Panitia:
							</span>
							<div
								className="text-xs text-slate-800 leading-relaxed font-normal prose prose-slate max-w-none"
								dangerouslySetInnerHTML={{ __html: validationNote }}
							/>
						</div>
					)}
				</div>
			</div>
		)
	}

	// 4. Data Valid (Berkas Lengkap & Siap Ujian)
	if (status === "data_valid") {
		return (
			<div className="rounded-xl border border-emerald-200 bg-white p-5 md:p-6 shadow-2xs">
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
					<div className="lg:col-span-8 flex flex-col gap-2.5">
						<div className="flex items-center gap-2 flex-wrap">
							<Badge variant="approve" className="px-2.5 py-0.5 text-[10px] font-bold gap-1 shadow-2xs">
								<ShieldCheck className="w-3 h-3" />
								<span>Berkas Terverifikasi</span>
							</Badge>
							<span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
								Siap Mengikuti Ujian
							</span>
						</div>

						<h4 className="text-sm md:text-base font-bold text-slate-900 tracking-tight">
							Seluruh Berkas Dinyatakan Valid
						</h4>

						<p className="text-xs text-slate-600 leading-relaxed font-normal">
							Alhamdulillah, data dan kelengkapan dokumen pendaftaran Anda telah disetujui. Anda berhak mengikuti tahapan{" "}
							<strong className="text-emerald-900 font-semibold">
								{isIndent ? "Tes Seleksi Jalur Indent" : "Ujian Seleksi Masuk (Reguler)"}
							</strong>
							.
						</p>

						<div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-0.5">
							<Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
							<span>Cetak Bukti Pendaftaran PSB sebagai kartu identitas saat tes.</span>
						</div>
					</div>

					<div className="lg:col-span-4 flex flex-col items-center justify-center bg-slate-50 p-4 rounded-xl border border-slate-200 text-center gap-1.5">
						<div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
							<Clock className="w-4 h-4" />
						</div>
						<div className="flex flex-col">
							<span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
								Tahap Berikutnya
							</span>
							<span className="text-xs font-bold text-slate-800 mt-0.5">
								{isIndent ? "Ujian Seleksi Indent" : "Ujian Seleksi Reguler"}
							</span>
							<span className="text-[11px] text-emerald-700 font-medium">
								Pantau jadwal di halaman ini
							</span>
						</div>
					</div>
				</div>
			</div>
		)
	}

	// 5. Lolos Ujian Seleksi Masuk (Reguler / Indent)
	if (status === "regular_test_passed" || status === "indent_test_passed") {
		return (
			<div className="rounded-xl border border-emerald-200 bg-white p-5 md:p-6 shadow-2xs">
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
					<div className="lg:col-span-8 flex flex-col gap-2.5">
						<div className="flex items-center gap-2 flex-wrap">
							<Badge variant="approve" className="px-2.5 py-0.5 text-[10px] font-bold gap-1 shadow-2xs">
								<Award className="w-3 h-3" />
								<span>Lulus Ujian Seleksi</span>
							</Badge>
							<span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
								Tahap 02 Selesai
							</span>
						</div>

						<h4 className="text-sm md:text-base font-bold text-slate-900 tracking-tight">
							Barakallahu Fiikum! Anda Lolos Ujian Seleksi
						</h4>

						<p className="text-xs text-slate-600 leading-relaxed font-normal">
							Hasil tes seleksi menunjukkan calon santri telah memenuhi kriteria kelulusan akademik dan keagamaan. Panitia sedang memproses penetapan Surat Keputusan & Pengumuman Akhir.
						</p>
					</div>

					<div className="lg:col-span-4 flex flex-col items-center justify-center bg-slate-50 p-4 rounded-xl border border-slate-200 text-center gap-1.5">
						<div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-2xs">
							<CheckCircle2 className="w-4 h-4" />
						</div>
						<div className="flex flex-col">
							<span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
								Hasil Seleksi Masuk
							</span>
							<span className="text-xs font-bold text-emerald-900 mt-0.5">
								DINYATAKAN LULUS TES
							</span>
							<span className="text-[10px] text-slate-500 font-medium">
								Menunggu Pengumuman Akhir
							</span>
						</div>
					</div>
				</div>
			</div>
		)
	}

	// 6. Evaluasi Hasil Tes Seleksi Reguler (Belum tentu tidak diterima)
	if (status === "regular_test_failed") {
		return (
			<div className="rounded-xl border border-amber-200 bg-white p-5 md:p-6 shadow-2xs">
				<div className="flex items-start gap-3.5">
					<div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200">
						<Clock className="w-6 h-6" />
					</div>
					<div className="flex flex-col gap-1">
						<div className="flex items-center gap-2">
							<Badge variant="warning" className="px-2 py-0.5 text-[10px] font-bold">
								Dalam Evaluasi Panitia
							</Badge>
							<span className="text-[11px] text-slate-400 font-medium">Sidang Pleno Kelulusan</span>
						</div>
						<h4 className="text-sm md:text-base font-bold text-slate-900">
							Hasil Ujian Seleksi Dalam Peninjauan Dewan Penguji
						</h4>
						<p className="text-xs text-slate-600 leading-relaxed font-normal max-w-2xl">
							Hasil tes seleksi ananda saat ini sedang dalam proses peninjauan dan evaluasi lebih lanjut oleh dewan penguji serta pimpinan pondok. Penetapan keputusan akhir (diterima, cadangan, atau pertimbangan khusus) akan diumumkan secara resmi pada tahapan pengumuman kelulusan akhir.
						</p>
					</div>
				</div>
			</div>
		)
	}

	// 7. Cadangan
	if (status === "reserve") {
		return (
			<div className="rounded-xl border border-amber-200 bg-white p-5 md:p-6 shadow-2xs">
				<div className="flex items-start gap-3.5">
					<div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200">
						<HelpCircle className="w-6 h-6" />
					</div>
					<div className="flex flex-col gap-1">
						<div className="flex items-center gap-2">
							<Badge variant="warning" className="px-2 py-0.5 text-[10px] font-bold">
								Status Cadangan
							</Badge>
						</div>
						<h4 className="text-sm md:text-base font-bold text-slate-900">
							Masuk Dalam Kuota Cadangan Santri Baru
						</h4>
						<p className="text-xs text-slate-600 leading-relaxed font-normal max-w-2xl">
							Calon santri saat ini masuk dalam kuota cadangan santri baru. Apabila terdapat calon santri utama yang mengundurkan diri, panitia akan segera menghubungi pihak wali santri.
						</p>
					</div>
				</div>
			</div>
		)
	}

	return null
}

export default StatusHeroCard
