import type { JSX } from "react"
import { Calendar, CheckCircle2, XCircle, AlertTriangle, FileText, Bell, Sparkles, ExternalLink, KeyRound } from "lucide-react"
import { Badge, Card, CardHeader, CardTitle, CardContent, Button } from "@roja/ui"
import { getRuntimeEnv } from "@roja/utils"

export interface AnnouncementResultCardProps {
	status: string
	announcement?: any
	nis?: string | null
}

const formatDate = (dateStr?: string | null): string => {
	if (!dateStr) return ""
	try {
		const d = new Date(dateStr)
		return d.toLocaleDateString("id-ID", {
			day: "numeric",
			month: "long",
			year: "numeric",
		})
	} catch {
		return dateStr
	}
}

export const AnnouncementResultCard = ({ status, announcement, nis }: AnnouncementResultCardProps): JSX.Element | null => {
	const santriUrl = getRuntimeEnv("VITE_SANTRI_URL", "https://santri.pondokroja.com")

	if (status === "approve") {
		return (
			<div className="flex flex-col gap-5">
				{/* Celebratory Hero Header - Clean White Surface with High Contrast */}
				<div className="rounded-xl border border-emerald-200 bg-white p-5 md:p-6 shadow-2xs">
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
						<div className="flex items-start">
							<div className="flex flex-col gap-1">
								<div className="flex items-center flex-wrap">
									<Badge variant="approve" className="px-2.5 py-0.5 text-[10px] font-bold gap-1">
										<Sparkles className="w-3 h-3" />
										<span>Pengumuman Kelulusan</span>
									</Badge>

								</div>
								<h5 className="text-sm md:text-base font-bold text-slate-900 tracking-tight mt-0.5">
									Selamat! Anda Dinyatakan Diterima Sebagai Santri Baru
								</h5>
								<p className="text-xs text-slate-600 leading-relaxed font-normal max-w-2xl">
									Pondok Roja mengucapkan selamat atas kelulusan ananda. Silakan mencermati informasi jadwal daftar ulang, akses Portal Santri, dan persyaratan berkas di bawah ini.
								</p>
							</div>
						</div>
					</div>
				</div>

				{/* Akses Portal Santri Announcement Box */}
				<div className="rounded-xl border border-sky-200 bg-linear-to-r from-sky-50/80 via-white to-sky-50/30 p-4 md:p-5 shadow-2xs">
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
						<div className="flex items-start gap-3">
							<div className="flex flex-col gap-1">
								<div className="flex items-center gap-2">
									<span className="text-[11px] font-bold text-sky-900 uppercase tracking-wider">
										Akses Portal Santri Baru
									</span>
								</div>
								<div className="flex items-center gap-2 flex-wrap">
									<span className="text-xs text-slate-600 font-medium">Nomor Induk Santri (NIS):</span>
									<span className="text-xs font-extrabold text-sky-900 bg-white px-2.5 py-0.5 rounded-md border border-sky-200 tracking-wide font-mono">
										{nis || "-"}
									</span>
								</div>
								<p className="text-xs text-slate-600 leading-relaxed font-normal mt-0.5">
									Selanjutnya Anda dapat login ke <strong>Portal Santri</strong> menggunakan <strong>NIS</strong> di atas serta <strong>password</strong> yang sama dengan akun PSB.
								</p>
							</div>
						</div>

						<Button
							asChild
							variant="roja-primary"
							size="sm"
							className="font-bold shadow-2xs gap-1.5 shrink-0 self-start sm:self-auto"
						>
							<a href={santriUrl} target="_blank" rel="noopener noreferrer">
								<span>Buka Portal Santri</span>
								<ExternalLink className="w-3.5 h-3.5" />
							</a>
						</Button>
					</div>
				</div>

				{/* Detail Kelulusan & Jadwal Daftar Ulang */}
				{announcement && (
					<Card className="border-slate-200 bg-white shadow-2xs overflow-hidden">
						<CardHeader className="bg-slate-50 border-b border-slate-200/80 py-3 px-5">
							<CardTitle className="text-xs font-bold text-slate-800 tracking-wider uppercase flex items-center gap-1.5">
								<FileText className="w-3.5 h-3.5 text-emerald-700" />
								<span>Detail Hasil Seleksi & Ketentuan Daftar Ulang</span>
							</CardTitle>
						</CardHeader>
						<CardContent className="p-5">
							<div className="grid grid-cols-1 md:grid-cols-12 gap-4">
								{/* Keterangan Kelulusan */}
								{announcement.successDesc && (
									<div className="md:col-span-12 bg-slate-50 p-4 rounded-lg border border-slate-200">
										<span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
											Keterangan Resmi Panitia:
										</span>
										<div
											className="text-xs text-slate-800 leading-relaxed font-normal prose prose-slate max-w-none"
											dangerouslySetInnerHTML={{ __html: announcement.successDesc }}
										/>
									</div>
								)}

								{/* Jadwal Daftar Ulang */}
								{(announcement.dateStart || announcement.dateEnd) && (
									<div className="md:col-span-6 flex flex-col gap-1.5 p-4 rounded-lg border border-slate-200 bg-white shadow-2xs">
										<div className="flex items-center gap-1.5 text-slate-700">
											<Calendar className="w-3.5 h-3.5 text-emerald-700" />
											<span className="text-[11px] font-bold uppercase tracking-wider">Jadwal Daftar Ulang</span>
										</div>
										<div className="text-xs font-bold text-slate-900 mt-0.5">
											{formatDate(announcement.dateStart)} <span className="text-slate-400 font-normal">s/d</span> {formatDate(announcement.dateEnd)}
										</div>
										<span className="text-[10px] text-slate-500 font-normal">
											Harap melakukan daftar ulang sebelum batas waktu yang ditentukan.
										</span>
									</div>
								)}

								{/* Pengumuman Tambahan */}
								{announcement.additionalInformation && (
									<div className="md:col-span-6 flex flex-col gap-1.5 p-4 rounded-lg border border-slate-200 bg-white shadow-2xs">
										<div className="flex items-center gap-1.5 text-slate-700">
											<Bell className="w-3.5 h-3.5 text-amber-600" />
											<span className="text-[11px] font-bold uppercase tracking-wider">Informasi Pertemuan Wali</span>
										</div>
										<div
											className="text-xs text-slate-700 leading-relaxed font-normal"
											dangerouslySetInnerHTML={{ __html: announcement.additionalInformation }}
										/>
									</div>
								)}

								{/* Berkas Daftar Ulang */}
								{announcement.information && (
									<div className="md:col-span-12 flex flex-col gap-1.5 pt-2 border-t border-slate-100">
										<span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">
											Persyaratan & Berkas Fisik Daftar Ulang:
										</span>
										<div
											className="text-xs text-slate-700 leading-relaxed font-normal bg-slate-50 p-4 rounded-lg border border-slate-200"
											dangerouslySetInnerHTML={{ __html: announcement.information }}
										/>
									</div>
								)}
							</div>
						</CardContent>
					</Card>
				)}
			</div>
		)
	}

	if (status === "failed") {
		return (
			<div className="flex flex-col gap-5">
				<div className="rounded-xl border border-rose-200 bg-white p-5 md:p-6 shadow-2xs">
					<div className="flex items-start gap-3.5">
						<div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 border border-rose-200">
							<XCircle className="w-6 h-6" />
						</div>
						<div className="flex flex-col gap-1">
							<div className="flex items-center gap-2">
								<Badge variant="destructive" className="px-2 py-0.5 text-[10px] font-bold">
									Hasil Seleksi Akhir
								</Badge>
							</div>
							<h3 className="text-sm md:text-base font-bold text-slate-900">
								Pengumuman Hasil Seleksi Santri Baru
							</h3>
							<p className="text-xs text-slate-600 leading-relaxed font-normal max-w-2xl">
								Berikut kami umumkan hasil penetapan penerimaan santri baru Pondok Roja.
							</p>
						</div>
					</div>
				</div>

				{announcement?.failedDesc && (
					<Card className="border-slate-200 bg-white shadow-2xs">
						<CardHeader className="bg-slate-50 border-b border-slate-200/80 py-3 px-5">
							<CardTitle className="text-xs font-bold text-slate-700 tracking-wider uppercase">
								Keterangan Resmi Panitia
							</CardTitle>
						</CardHeader>
						<CardContent className="p-5">
							<div
								className="text-xs text-slate-700 leading-relaxed font-normal prose prose-slate max-w-none"
								dangerouslySetInnerHTML={{ __html: announcement.failedDesc }}
							/>
						</CardContent>
					</Card>
				)}
			</div>
		)
	}

	if (status === "indent_failed") {
		return (
			<div className="flex flex-col gap-5">
				<div className="rounded-xl border border-amber-200 bg-white p-5 md:p-6 shadow-2xs">
					<div className="flex items-start gap-3.5">
						<div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200">
							<AlertTriangle className="w-6 h-6" />
						</div>
						<div className="flex flex-col gap-1">
							<div className="flex items-center gap-2">
								<Badge variant="warning" className="px-2 py-0.5 text-[10px] font-bold">
									Hasil Tes Jalur Indent
								</Badge>
							</div>
							<h3 className="text-sm md:text-base font-bold text-slate-900">
								Hasil Ujian Tes Jalur Indent
							</h3>
							<p className="text-xs text-slate-600 leading-relaxed font-normal max-w-2xl">
								Berikut kami umumkan hasil evaluasi tes seleksi pendaftaran santri baru jalur indent.
							</p>
						</div>
					</div>
				</div>

				{announcement?.failedIndentTestDesc && (
					<Card className="border-slate-200 bg-white shadow-2xs">
						<CardHeader className="bg-slate-50 border-b border-slate-200/80 py-3 px-5">
							<CardTitle className="text-xs font-bold text-slate-700 tracking-wider uppercase">
								Keterangan & Rekomendasi
							</CardTitle>
						</CardHeader>
						<CardContent className="p-5">
							<div
								className="text-xs text-slate-700 leading-relaxed font-normal prose prose-slate max-w-none"
								dangerouslySetInnerHTML={{ __html: announcement.failedIndentTestDesc }}
							/>
						</CardContent>
					</Card>
				)}
			</div>
		)
	}

	return null
}

export default AnnouncementResultCard

