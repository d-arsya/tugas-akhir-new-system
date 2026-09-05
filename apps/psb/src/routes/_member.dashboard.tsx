import type { JSX } from "react"
import { useNavigate, Link, createFileRoute } from "@tanstack/react-router"
import { psbApi } from "@/lib/api"
import { useQuery } from "@tanstack/react-query"
import { AlertTriangle, Download, CheckCircle, XCircle, Info, Calendar } from "lucide-react"
import {
	Button,
	Badge,
	Alert,
	AlertTitle,
	AlertDescription,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	Skeleton,
} from "@roja/ui"

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

const DashboardPage = (): JSX.Element => {
	const navigate = useNavigate()

	const { data, isLoading } = useQuery({
		queryKey: ["dashboard"],
		queryFn: () => psbApi.getDashboard(),
	})

	if (isLoading) {
		return (
			<div className="w-full flex flex-col gap-6">
				<div className="flex justify-between items-center pb-4 border-b">
					<div className="flex flex-col gap-2">
						<Skeleton className="h-8 w-64 rounded-lg" />
						<Skeleton className="h-4 w-48 rounded" />
					</div>
					<Skeleton className="h-10 w-36 rounded-lg" />
				</div>
				<Skeleton className="h-40 w-full rounded-2xl" />
			</div>
		)
	}

	const reg = data?.registrant
	const announcement = data?.announcement
	const statusInfo = data?.statusInfo

	// Determine active status: statusInfo.status -> reg.dataValidation -> reg.approvalStatus
	let rawStatus =
		statusInfo?.status ||
		(reg?.dataValidation && reg.dataValidation !== "valid" ? reg.dataValidation : reg?.approvalStatus) ||
		"wait"
	if (rawStatus === "reject") rawStatus = "failed"
	const status = rawStatus === "indent failed" ? "indent_failed" : rawStatus
	const validationNote = statusInfo?.description || reg?.dataValidationNote

	const levelLabel = reg?.levelId === 1 ? "Setingkat SMP" : reg?.levelId === 2 ? "Setingkat SMA" : "Pondok Roja"
	const printType =
		status === "approve"
			? "accepted"
			: status === "failed"
			? "rejected"
			: status === "indent_failed"
			? "indent-rejected"
			: "registration"
	const printLabel = status === "approve" ? "Cetak Surat Kelulusan" : "Cetak Bukti PSB"
	const registrantIdParam = reg?.id ? String(reg.id) : ""

	return (
		<div className="w-full flex flex-col gap-8">
			{/* Top Header Section */}
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--bg-form-border)] pb-6">
				<div>
					<div className="text-xl md:text-2xl font-bold text-slate-800 m-0">
						Hallo, <span className="text-[var(--primary)]">{reg?.fullname || reg?.fullName || ""}</span>
					</div>
					<div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs font-medium">
						<Badge variant="outline" className="font-mono text-slate-700 bg-slate-50 px-2.5 py-1">
							ID: {reg?.registrantId || "-"}
						</Badge>
						<Badge variant="outline" className="text-slate-700 bg-slate-50 px-2.5 py-1">
							Jenjang: {levelLabel}
						</Badge>
					</div>
				</div>

				{/* Print Action Button */}
				{registrantIdParam && (
					<Button asChild variant="roja-primary" size="sm" className="shrink-0">
						<Link
							to="/print/$type/$registrantId"
							params={{ type: printType, registrantId: registrantIdParam }}
							target="_blank"
							className="flex items-center gap-2"
						>
							<Download className="w-4 h-4" />
							<span>{printLabel}</span>
						</Link>
					</Button>
				)}
			</div>

			{/* Status Scenario Content */}

			{/* 1. Wait (Menunggu Verifikasi) */}
			{status === "wait" && (
				<Alert variant="default" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center p-6 border-slate-200 bg-slate-50/50">
					<div className="lg:col-span-7 flex flex-col gap-3">
						<div className="flex items-center gap-2">
							<Badge variant="wait">Menunggu Verifikasi</Badge>
							<AlertTitle className="text-sm font-bold text-slate-800 m-0">
								Status Pendaftaran: In Review
							</AlertTitle>
						</div>
						<AlertDescription className="text-xs md:text-sm text-slate-600 leading-relaxed font-medium">
							Data kamu sedang kami proses, mohon menunggu. Informasi penerimaan dan jika ada kelengkapan data akan kami tampilkan pada halaman ini.
						</AlertDescription>
					</div>
					<div className="lg:col-span-5 flex justify-center items-center">
						<img
							src="/assets/svg/illustration/No-Activity.svg"
							alt="Status Review"
							className="max-w-xs w-full h-auto object-contain select-none pointer-events-none"
						/>
					</div>
				</Alert>
			)}

			{/* 2. Fixed (Data Telah Diperbaiki) */}
			{status === "fixed" && (
				<Alert variant="info" className="flex flex-col gap-2 p-6">
					<div className="flex items-center gap-2.5 font-bold text-sm">
						<CheckCircle className="w-5 h-5 shrink-0" />
						<span>Perbaikan Data Tersimpan</span>
					</div>
					<AlertDescription className="text-xs md:text-sm leading-relaxed font-medium">
						Kamu berhasil melakukan update data. Silakan tunggu keputusan selanjutnya dari admin kami. Semoga proses pendaftaran kamu berjalan lancar ya.
					</AlertDescription>
				</Alert>
			)}

			{/* 3. Invalid (Data / Berkas Tidak Valid) */}
			{status === "invalid" && (
				<Alert variant="warning" className="flex flex-col gap-4 p-6">
					<div className="flex items-center gap-2.5 font-bold text-sm">
						<AlertTriangle className="w-5 h-5 shrink-0" />
						<span>Data / Berkas Tidak Valid!</span>
					</div>
					<AlertDescription className="text-xs leading-relaxed font-medium flex flex-col gap-3">
						<span>Panitia menemukan bahwa beberapa data/berkas yang Anda unggah tidak valid. Silakan lakukan perbaikan data.</span>
						{validationNote && (
							<div
								className="bg-white/90 p-3.5 rounded-xl border border-amber-200 text-xs italic text-amber-900"
								dangerouslySetInnerHTML={{ __html: validationNote }}
							/>
						)}
					</AlertDescription>
					<div>
						<Button
							onClick={() => navigate({ to: "/invalid" })}
							variant="roja-warning"
							size="sm"
							className="font-bold"
						>
							Perbaiki Data Saya
						</Button>
					</div>
				</Alert>
			)}

			{/* 4. Approve (Diterima) */}
			{status === "approve" && (
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
									{/* Keterangan Kelulusan */}
									{announcement.successDesc && (
										<>
											<div className="md:col-span-3 font-bold text-slate-600">Keterangan</div>
											<div
												className="md:col-span-9 text-slate-800 leading-relaxed font-medium"
												dangerouslySetInnerHTML={{ __html: announcement.successDesc }}
											/>
										</>
									)}

									{/* Jadwal Daftar Ulang */}
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

									{/* Berkas Daftar Ulang */}
									{announcement.information && (
										<>
											<div className="md:col-span-3 font-bold text-slate-600">Berkas Daftar Ulang</div>
											<div
												className="md:col-span-9 text-slate-800 leading-relaxed font-medium"
												dangerouslySetInnerHTML={{ __html: announcement.information }}
											/>
										</>
									)}

									{/* Pengumuman Tambahan */}
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
			)}

			{/* 5. Failed (Belum Lulus) */}
			{status === "failed" && (
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
			)}

			{/* 6. Indent Failed (Gagal Tes Indent) */}
			{status === "indent_failed" && (
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
									Keterangan
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
			)}
		</div>
	)
}

export const Route = createFileRoute("/_member/dashboard")({
	component: DashboardPage,
})

export default DashboardPage
