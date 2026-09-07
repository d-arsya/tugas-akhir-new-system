import type { JSX } from "react"
import { Calendar, Info, CheckCircle, XCircle, AlertTriangle } from "lucide-react"
import { Alert, AlertDescription, Card, CardHeader, CardTitle, CardContent } from "@roja/ui"

export interface AnnouncementResultCardProps {
	status: string
	announcement?: any
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

export const AnnouncementResultCard = ({ status, announcement }: AnnouncementResultCardProps): JSX.Element | null => {
	if (status === "approve") {
		return (
			<div className="flex flex-col gap-6">
				<Alert variant="success" className="flex flex-col gap-2 p-6">
					<div className="flex items-center gap-2.5 font-bold text-base">
						<CheckCircle className="w-6 h-6 shrink-0" />
						<span>Selamat! Anda Diterima Sebagai Santri Baru</span>
					</div>
					<AlertDescription className="text-xs md:text-sm leading-relaxed font-medium">
						Berikut kami umumkan hasil penerimaan santri baru Pondok Roja.
					</AlertDescription>
				</Alert>

				{announcement && (
					<Card className="border-slate-200 shadow-sm">
						<CardHeader className="border-b border-slate-100 pb-3">
							<CardTitle className="text-xs font-bold text-[var(--primary)] tracking-wider uppercase flex items-center gap-2">
								<Info className="w-4 h-4" />
								<span>Detail Hasil Seleksi & Daftar Ulang</span>
							</CardTitle>
						</CardHeader>
						<CardContent className="pt-5">
							<div className="grid grid-cols-1 md:grid-cols-12 gap-y-4 gap-x-6 text-xs">
								{announcement.successDesc && (
									<>
										<div className="md:col-span-3 font-bold text-slate-600">Keterangan</div>
										<div
											className="md:col-span-9 text-slate-800 leading-relaxed font-medium"
											dangerouslySetInnerHTML={{ __html: announcement.successDesc }}
										/>
									</>
								)}

								{(announcement.dateStart || announcement.dateEnd) && (
									<>
										<div className="md:col-span-3 font-bold text-slate-600 flex items-center gap-1.5">
											<Calendar className="w-3.5 h-3.5 text-slate-400" />
											<span>Jadwal Daftar Ulang</span>
										</div>
										<div className="md:col-span-9 text-slate-800 font-semibold">
											{formatDate(announcement.dateStart)} s/d {formatDate(announcement.dateEnd)}
										</div>
									</>
								)}

								{announcement.information && (
									<>
										<div className="md:col-span-3 font-bold text-slate-600">Berkas Daftar Ulang</div>
										<div
											className="md:col-span-9 text-slate-800 leading-relaxed font-medium"
											dangerouslySetInnerHTML={{ __html: announcement.information }}
										/>
									</>
								)}

								{announcement.additionalInformation && (
									<>
										<div className="md:col-span-3 font-bold text-slate-600">Pengumuman Lainnya</div>
										<div
											className="md:col-span-9 text-slate-800 leading-relaxed font-medium"
											dangerouslySetInnerHTML={{ __html: announcement.additionalInformation }}
										/>
									</>
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
			<div className="flex flex-col gap-6">
				<Alert variant="destructive" className="flex flex-col gap-2 p-6">
					<div className="flex items-center gap-2.5 font-bold text-base">
						<XCircle className="w-6 h-6 shrink-0" />
						<span>Hasil Seleksi: Belum Diterima</span>
					</div>
					<AlertDescription className="text-xs md:text-sm leading-relaxed font-medium">
						Berikut kami umumkan hasil penerimaan santri baru Pondok Roja.
					</AlertDescription>
				</Alert>

				{announcement?.failedDesc && (
					<Card className="border-slate-200 shadow-sm">
						<CardHeader className="border-b border-slate-100 pb-3">
							<CardTitle className="text-xs font-bold text-slate-600 tracking-wider uppercase">
								Keterangan
							</CardTitle>
						</CardHeader>
						<CardContent className="pt-4">
							<div
								className="text-xs text-slate-700 leading-relaxed font-medium"
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
			<div className="flex flex-col gap-6">
				<Alert variant="warning" className="flex flex-col gap-2 p-6">
					<div className="flex items-center gap-2.5 font-bold text-base">
						<AlertTriangle className="w-6 h-6 shrink-0" />
						<span>Hasil Tes Indent: Belum Lulus</span>
					</div>
					<AlertDescription className="text-xs md:text-sm leading-relaxed font-medium">
						Berikut kami umumkan hasil tes indent pendaftaran santri baru.
					</AlertDescription>
				</Alert>

				{announcement?.failedIndentTestDesc && (
					<Card className="border-slate-200 shadow-sm">
						<CardHeader className="border-b border-slate-100 pb-3">
							<CardTitle className="text-xs font-bold text-slate-600 tracking-wider uppercase">
								Keterangan Tes Indent
							</CardTitle>
						</CardHeader>
						<CardContent className="pt-4">
							<div
								className="text-xs text-slate-700 leading-relaxed font-medium"
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
