import type { JSX } from "react"
import { useNavigate, useParams, Link, createFileRoute } from "@tanstack/react-router"
import { psbApi } from "@/lib/api"
import { useQuery } from "@tanstack/react-query"
import useAuthStore from "@/stores/auth.store"
import Header from "@/components/header"
import { Mail } from "lucide-react"

const SuccessPage = (): JSX.Element => {
	const navigate = useNavigate()
	const { registrantId } = useParams({ strict: false }) as { registrantId?: string }
	const user = useAuthStore((s) => s.user)
	const currentUserId = user?.id || 0

	const { data: info, isLoading } = useQuery({
		queryKey: ["successInfo", currentUserId],
		queryFn: () => psbApi.getSuccess(currentUserId),
		enabled: !!currentUserId,
	})

	if (isLoading) {
		return <div className="min-h-screen flex items-center justify-center text-xs">Memuat data...</div>
	}

	return (
		<div className="roja_wizard_container min-h-screen flex flex-col relative overflow-hidden bg-[var(--bg-primary)] pt-[70px]">
			<Header />
			<div className="roja_bg_blobs" />

			<main className="flex-1 relative z-10 px-4 py-8 max-w-xl mx-auto w-full flex items-center justify-center">
				<div className="roja_card_wizard w-full relative overflow-hidden p-8 md:p-10 flex flex-col gap-6 items-center text-center">
					{/* Corner gradient glows inside card */}
					<div className="absolute -top-12 -left-12 w-48 h-48 bg-[var(--primary)] rounded-full blur-[50px] opacity-[0.12] pointer-events-none z-0" />
					<div className="absolute -top-12 -right-12 w-48 h-48 bg-[var(--secondary)] rounded-full blur-[50px] opacity-[0.12] pointer-events-none z-0" />

					<div className="relative z-10 w-14 h-14 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-2xl font-bold">
						✓
					</div>
					<div className="relative z-10 flex flex-col gap-1">
						<div className="text-xs font-bold text-[var(--success)] tracking-wide m-0">
							Pendaftaran Berhasil!
						</div>
						<p className="text-xs text-[var(--body-txt-inverse)] m-0">
							Formulir pendaftaran Anda telah berhasil dikirimkan ke panitia seleksi.
						</p>
					</div>

					<div className="relative z-10 w-full bg-slate-50/80 border border-slate-200 rounded-xl p-5 flex flex-col gap-3 text-left">
						<div className="flex justify-between text-xs border-b border-slate-100 pb-2">
							<span className="text-[var(--grey)]">Nama Lengkap</span>
							<span className="font-semibold text-slate-800">{info?.fullName}</span>
						</div>
						<div className="flex justify-between text-xs border-b border-slate-100 pb-2">
							<span className="text-[var(--grey)]">Nomor Pendaftaran</span>
							<span className="font-bold text-[var(--primary)] text-sm">{info?.registrantId || registrantId}</span>
						</div>
						<div className="flex justify-between text-xs border-b border-slate-100 pb-2">
							<span className="text-[var(--grey)]">Email Terdaftar</span>
							<span className="font-semibold text-slate-800">{info?.email || user?.email}</span>
						</div>
						<div className="flex flex-col gap-1.5 bg-emerald-50 border border-emerald-200 rounded-lg p-3.5 text-[11px] text-emerald-900 leading-relaxed mt-2">
							<div className="flex items-center gap-2 font-bold text-emerald-800">
								<Mail className="w-4 h-4 text-emerald-600 shrink-0" />
								<span>Informasi Akun & Kata Sandi</span>
							</div>
							<p className="m-0 text-emerald-800 text-[11px]">
								Kata sandi dan detail akun pendaftaran Anda telah dikirimkan ke email terdaftar (<strong>{info?.email || user?.email}</strong>). Silakan periksa kotak masuk atau folder spam email Anda.
							</p>
						</div>
					</div>

					<div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4 w-full mt-2">
						<Link
							to="/print/$type/$registrantId"
							params={{ type: "registration", registrantId: currentUserId.toString() }}
							target="_blank"
							className="roja_btn roja_btn-secondary py-2 flex items-center justify-center text-xs font-semibold text-[var(--primary)] border border-slate-300"
						>
							Cetak Bukti Pendaftaran
						</Link>
						<button
							onClick={() => navigate({ to: "/dashboard" })}
							className="roja_btn roja_btn-primary py-2 text-xs font-semibold text-white bg-[var(--primary)]"
						>
							Masuk ke Dashboard
						</button>
					</div>
				</div>
			</main>
		</div>
	)
}

export const Route = createFileRoute("/register/success/$registrantId")({
	component: SuccessPage,
})

export default SuccessPage
