import type { JSX } from "react"
import { useNavigate, Link, createFileRoute } from "@tanstack/react-router"
import { psbApi } from "@/lib/api"
import { useQuery } from "@tanstack/react-query"
import { AlertTriangle, Download, CheckCircle, XCircle } from "lucide-react"

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
	const status = reg?.approvalStatus || "wait"
	const validationStatus = reg?.dataValidation || "valid"

	const levelLabel = reg?.levelId === 1 ? "Setingkat SMP" : "Setingkat SMA"

	return (
		<div className="w-full">
			{/* Grid container to allow text on left and illustration on right */}
			<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center min-h-[300px]">
				
				{/* Left Side: Status Info */}
				<div className="lg:col-span-7 flex flex-col gap-6">
					<div>
						<div className="text-xl md:text-2xl font-bold text-slate-800 m-0">
							Hallo, <span className="text-[var(--primary)]">{reg?.fullName || "Puji Padmi Laksmiwati"}</span>
						</div>
						<div className="mt-3 flex flex-col gap-1 text-xs text-[#abb4be] font-medium">
							<div>
								Nomor Pendaftaran : <span className="font-mono text-slate-700 font-bold">{reg?.registrantId || "PR20260028"}</span>
							</div>
							<div>
								Jenjang yang kamu pilih : <span className="text-slate-700 font-semibold">{levelLabel}</span>
							</div>
						</div>
					</div>

					{/* Custom descriptions based on registration approval status */}
					{status === "wait" && (
						<p className="text-xs md:text-sm text-slate-500 leading-relaxed font-medium m-0">
							Data kamu sedang kami proses, mohon menunggu. Informasi penerimaan dan jika ada kelengkapan data akan kami tampilkan pada halaman ini.
						</p>
					)}

					{status === "fixed" && (
						<div className="flex flex-col gap-2">
							<p className="text-xs md:text-sm text-slate-500 leading-relaxed font-medium m-0">
								Perbaikan data kamu telah tersimpan. Panitia sedang memeriksa kembali berkas pendaftaranmu. Mohon bersabar menunggu hasil verifikasi.
							</p>
							<div className="bg-blue-50 text-blue-700 p-3 rounded-lg border border-blue-200 text-xs font-semibold w-max">
								✓ Data Telah Diperbaiki
							</div>
						</div>
					)}

					{status === "invalid" && (
						<div className="bg-[#FFF4E5] border border-amber-200 p-5 rounded-xl flex flex-col gap-3">
							<div className="flex items-center gap-2 text-[#d98f00] font-bold text-sm">
								<AlertTriangle className="w-5 h-5 shrink-0" />
								<span>Perbaikan Berkas Pendaftaran Diperlukan</span>
							</div>
							<p className="text-xs text-amber-900 leading-relaxed m-0 font-medium">
								Panitia menemukan bahwa beberapa berkas yang Anda unggah tidak valid atau kurang lengkap. 
								{reg?.dataValidationNote && (
									<span className="block mt-2 bg-white/70 p-2.5 rounded-lg border border-amber-100 italic">
										&ldquo;{reg.dataValidationNote}&rdquo;
									</span>
								)}
							</p>
							<button
								onClick={() => navigate({ to: "/invalid/personal" })}
								className="roja_btn roja_btn-warning text-white bg-[#ffa800] hover:bg-[#e09400] text-xs font-bold w-max mt-2 shadow-lg shadow-[#ffa800]/20"
							>
								Mulai Perbaiki Data
							</button>
						</div>
					)}

					{status === "approve" && (
						<div className="bg-emerald-50 border border-emerald-200 p-5 rounded-xl flex flex-col gap-3">
							<div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
								<CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
								<span>Selamat! Pendaftaran Anda Diterima</span>
							</div>
							<p className="text-xs text-emerald-950 leading-relaxed m-0 font-medium">
								Selamat, Anda telah dinyatakan lulus seleksi administrasi dan diterima sebagai santri baru Pondok Roja. Silakan download Surat Kelulusan di bawah ini.
							</p>
							<div className="flex gap-3 mt-2">
								<Link
									to="/print/$type/$registrantId"
									params={{ type: "accepted", registrantId: reg?.id.toString() || "1" }}
									target="_blank"
									className="roja_btn roja_btn-success text-white bg-emerald-600 hover:bg-emerald-700 text-xs font-bold flex items-center gap-2"
								>
									<Download className="w-4 h-4" />
									<span>Download Surat Kelulusan</span>
								</Link>
							</div>
						</div>
					)}

					{status === "failed" && (
						<div className="bg-rose-50 border border-rose-200 p-5 rounded-xl flex flex-col gap-3">
							<div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
								<XCircle className="w-5 h-5 text-rose-600 shrink-0" />
								<span>Status Pendaftaran: Belum Lulus</span>
							</div>
							<p className="text-xs text-rose-950 leading-relaxed m-0 font-medium">
								Mohon maaf, pendaftaran Anda belum disetujui untuk gelombang ini. Terima kasih atas partisipasi Anda.
							</p>
						</div>
					)}

					{/* Action Buttons for download proofs */}
					<div className="flex gap-3 mt-4">
						<Link
							to="/print/$type/$registrantId"
							params={{ type: "registration", registrantId: reg?.id.toString() || "1" }}
							target="_blank"
							className="roja_btn roja_btn-secondary text-xs font-semibold flex items-center gap-2"
						>
							<Download className="w-4 h-4" />
							<span>Cetak Bukti Pendaftaran</span>
						</Link>
					</div>
				</div>

				{/* Right Side: Binoculars Illustration */}
				<div className="lg:col-span-5 flex justify-center items-center">
					<img
						src="/assets/svg/illustration/No-Activity.svg"
						alt="Status Review"
						className="max-w-xs md:max-w-md w-full h-auto object-contain select-none pointer-events-none"
					/>
				</div>
			</div>

			{/* Announcement Banner if any */}
			{announcement && (
				<div className="mt-8 border-t border-[var(--bg-form-border)] pt-6">
					<h4 className="text-xs font-bold text-[var(--primary)] tracking-wider uppercase m-0">
						Pengumuman Tambahan
					</h4>
					<p className="text-xs text-slate-500 leading-relaxed mt-2 m-0 font-medium">
						{announcement}
					</p>
				</div>
			)}
		</div>
	)
}

export const Route = createFileRoute("/_member/dashboard")({
	component: DashboardPage,
})

export default DashboardPage
