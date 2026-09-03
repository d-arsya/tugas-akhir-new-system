import type { JSX } from "react"
import { useNavigate, Link, createFileRoute } from "@tanstack/react-router"
import { psbApi } from "@/lib/api"
import { useQuery } from "@tanstack/react-query"
import { AlertTriangle, Download, CheckCircle, XCircle, Info, Calendar } from "lucide-react"

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
		return <div className="text-center py-10 text-xs font-medium text-[var(--grey)]">Memuat data dashboard...</div>
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
					<div className="mt-2 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-xs text-[#abb4be] font-medium">
						<div>
							Nomor Pendaftaran: <span className="font-mono text-slate-700 font-bold">{reg?.registrantId || "-"}</span>
						</div>
						<div>
							Jenjang: <span className="text-slate-700 font-semibold">{levelLabel}</span>
						</div>
					</div>
				</div>

				{/* Print Action Button */}
				{registrantIdParam && (
					<Link
						to="/print/$type/$registrantId"
						params={{ type: printType, registrantId: registrantIdParam }}
						target="_blank"
						className="roja_btn roja_btn-primary text-white bg-[var(--primary)] font-semibold text-xs flex items-center gap-2 w-max shrink-0"
					>
						<Download className="w-4 h-4" />
						<span>{printLabel}</span>
					</Link>
				)}
			</div>

			{/* Status Scenario Content */}

			{/* 1. Wait (Menunggu Verifikasi) */}
			{status === "wait" && (
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center min-h-[250px]">
					<div className="lg:col-span-7 flex flex-col gap-4">
						<div className="text-sm font-bold text-slate-700">Status Pendaftaran: Menunggu Verifikasi</div>
						<p className="text-xs md:text-sm text-slate-500 leading-relaxed font-medium m-0">
							Data kamu sedang kami proses, mohon menunggu. Informasi penerimaan dan jika ada kelengkapan data akan kami tampilkan pada halaman ini.
						</p>
					</div>
					<div className="lg:col-span-5 flex justify-center items-center">
						<img
							src="/assets/svg/illustration/No-Activity.svg"
							alt="Status Review"
							className="max-w-xs w-full h-auto object-contain select-none pointer-events-none"
						/>
					</div>
				</div>
			)}

			{/* 2. Fixed (Data Telah Diperbaiki) */}
			{status === "fixed" && (
				<div className="bg-blue-50/80 border border-blue-200 p-6 rounded-2xl flex flex-col gap-3">
					<div className="flex items-center gap-2.5 text-blue-800 font-bold text-sm">
						<CheckCircle className="w-5 h-5 text-blue-600 shrink-0" />
						<span>Perbaikan Data Tersimpan</span>
					</div>
					<p className="text-xs md:text-sm text-blue-950 leading-relaxed font-medium m-0">
						Kamu berhasil melakukan update data. Silakan tunggu keputusan selanjutnya dari admin kami. Semoga proses pendaftaran kamu berjalan lancar ya.
					</p>
				</div>
			)}

			{/* 3. Invalid (Data / Berkas Tidak Valid) */}
			{status === "invalid" && (
				<div className="bg-amber-50/80 border border-amber-200 p-6 rounded-2xl flex flex-col gap-4">
					<div className="flex items-center gap-2.5 text-amber-800 font-bold text-sm">
						<AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
						<span>Data / Berkas Tidak Valid!</span>
					</div>
					<div className="text-xs text-amber-950 leading-relaxed font-medium">
						Panitia menemukan bahwa beberapa data/berkas yang Anda unggah tidak valid. Silakan lakukan perbaikan data.
						{validationNote && (
							<div
								className="mt-3 bg-white/80 p-3.5 rounded-xl border border-amber-200 text-xs italic text-amber-900"
								dangerouslySetInnerHTML={{ __html: validationNote }}
							/>
						)}
					</div>
					<div>
						<button
							onClick={() => navigate({ to: "/invalid" })}
							className="roja_btn roja_btn-warning text-white bg-[#ffa800] hover:bg-[#e09400] text-xs font-bold shadow-lg shadow-[#ffa800]/20 flex items-center gap-2"
						>
							<span>Perbaiki Data Saya</span>
						</button>
					</div>
				</div>
			)}

			{/* 4. Approve (Diterima) */}
			{status === "approve" && (
				<div className="flex flex-col gap-6">
					<div className="bg-emerald-50/80 border border-emerald-200 p-6 rounded-2xl flex flex-col gap-3">
						<div className="flex items-center gap-2.5 text-emerald-800 font-bold text-base">
							<CheckCircle className="w-6 h-6 text-emerald-600 shrink-0" />
							<span>Selamat! Anda Diterima Sebagai Santri Baru</span>
						</div>
						<p className="text-xs md:text-sm text-emerald-950 leading-relaxed font-medium m-0">
							Berikut kami umumkan hasil penerimaan santri baru Pondok Roja.
						</p>
					</div>

					{announcement && (
						<div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-5">
							<div className="text-xs font-bold text-[var(--primary)] tracking-wider uppercase flex items-center gap-2 border-b border-slate-100 pb-3">
								<Info className="w-4 h-4" />
								<span>Detail Hasil Seleksi & Daftar Ulang</span>
							</div>

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
						</div>
					)}
				</div>
			)}

			{/* 5. Failed (Selection Failed / Belum Lulus) */}
			{status === "failed" && (
				<div className="flex flex-col gap-6">
					<div className="bg-rose-50/80 border border-rose-200 p-6 rounded-2xl flex flex-col gap-3">
						<div className="flex items-center gap-2.5 text-rose-800 font-bold text-base">
							<XCircle className="w-6 h-6 text-rose-600 shrink-0" />
							<span>Hasil Seleksi: Belum Diterima</span>
						</div>
						<p className="text-xs md:text-sm text-rose-950 leading-relaxed font-medium m-0">
							Berikut kami umumkan hasil penerimaan santri baru Pondok Roja.
						</p>
					</div>

					{announcement?.failedDesc && (
						<div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-3">
							<div className="text-xs font-bold text-slate-600 tracking-wider uppercase border-b border-slate-100 pb-3">
								Keterangan
							</div>
							<div
								className="text-xs text-slate-700 leading-relaxed font-medium"
								dangerouslySetInnerHTML={{ __html: announcement.failedDesc }}
							/>
						</div>
					)}
				</div>
			)}

			{/* 6. Indent Failed (Gagal Tes Indent) */}
			{status === "indent_failed" && (
				<div className="flex flex-col gap-6">
					<div className="bg-orange-50/80 border border-orange-200 p-6 rounded-2xl flex flex-col gap-3">
						<div className="flex items-center gap-2.5 text-orange-800 font-bold text-base">
							<AlertTriangle className="w-6 h-6 text-orange-600 shrink-0" />
							<span>Hasil Tes Indent: Belum Lulus</span>
						</div>
						<p className="text-xs md:text-sm text-orange-950 leading-relaxed font-medium m-0">
							Berikut kami umumkan hasil tes indent pendaftaran santri baru.
						</p>
					</div>

					{announcement?.failedIndentTestDesc && (
						<div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-3">
							<div className="text-xs font-bold text-slate-600 tracking-wider uppercase border-b border-slate-100 pb-3">
								Keterangan
							</div>
							<div
								className="text-xs text-slate-700 leading-relaxed font-medium"
								dangerouslySetInnerHTML={{ __html: announcement.failedIndentTestDesc }}
							/>
						</div>
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
