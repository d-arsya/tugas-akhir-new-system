import type { JSX } from "react"
import { useNavigate, useParams, Link, createFileRoute } from "@tanstack/react-router"
import { psbApi } from "@/lib/api"
import { useQuery } from "@tanstack/react-query"
import useAuthStore from "@/stores/auth.store"
import { Button, RojaCard, PageLayout, RojaHeader } from "@roja/ui"
import { Mail, CheckCircle2, Printer, LayoutDashboard } from "lucide-react"

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

	const header = <RojaHeader roleLabel="PENDAFTAR" isAuthenticated={false} />

	if (isLoading) {
		return (
			<PageLayout header={header}>
				<div className="min-h-[60vh] flex items-center justify-center text-xs font-medium text-muted-foreground">
					Memuat data...
				</div>
			</PageLayout>
		)
	}

	return (
		<PageLayout header={header}>
			<main className="flex-1 relative z-10 px-4 py-8 max-w-xl mx-auto w-full flex items-center justify-center">
				<RojaCard className="w-full p-8 md:p-10 flex flex-col gap-6 items-center text-center">
					<div className="relative z-10 w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
						<CheckCircle2 className="w-8 h-8" />
					</div>
					<div className="relative z-10 flex flex-col gap-1">
						<div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 tracking-wide m-0">
							Pendaftaran Berhasil!
						</div>
						<p className="text-xs text-muted-foreground m-0">
							Formulir pendaftaran Anda telah berhasil dikirimkan ke panitia seleksi.
						</p>
					</div>

					<div className="relative z-10 w-full bg-muted/50 border border-border rounded-xl p-5 flex flex-col gap-3 text-left">
						<div className="flex justify-between text-xs border-b border-border/50 pb-2">
							<span className="text-muted-foreground">Nama Lengkap</span>
							<span className="font-semibold text-foreground">{info?.fullName}</span>
						</div>
						<div className="flex justify-between text-xs border-b border-border/50 pb-2">
							<span className="text-muted-foreground">Nomor Pendaftaran</span>
							<span className="font-bold text-primary text-sm">{info?.registrantId || registrantId}</span>
						</div>
						<div className="flex justify-between text-xs border-b border-border/50 pb-2">
							<span className="text-muted-foreground">Email Terdaftar</span>
							<span className="font-semibold text-foreground">{info?.email || user?.email}</span>
						</div>
						<div className="flex flex-col gap-1.5 bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-lg p-3.5 text-[11px] text-emerald-900 dark:text-emerald-200 leading-relaxed mt-2">
							<div className="flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-300">
								<Mail className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
								<span>Informasi Akun & Kata Sandi</span>
							</div>
							<p className="m-0 text-emerald-800 dark:text-emerald-300 text-[11px]">
								Kata sandi dan detail akun pendaftaran Anda telah dikirimkan ke email terdaftar (<strong>{info?.email || user?.email}</strong>). Silakan periksa kotak masuk atau folder spam email Anda.
							</p>
						</div>
					</div>

					<div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4 w-full mt-2">
						<Link
							to="/print/$type/$registrantId"
							params={{ type: "registration", registrantId: currentUserId.toString() }}
							target="_blank"
							className="w-full"
						>
							<Button variant="outline" className="w-full gap-2 text-xs">
								<Printer className="w-4 h-4" />
								<span>Cetak Bukti Pendaftaran</span>
							</Button>
						</Link>
						<Button
							onClick={() => navigate({ to: "/dashboard" })}
							variant="roja-primary"
							className="w-full gap-2 text-xs"
						>
							<LayoutDashboard className="w-4 h-4" />
							<span>Masuk ke Dashboard</span>
						</Button>
					</div>
				</RojaCard>
			</main>
		</PageLayout>
	)
}

export const Route = createFileRoute("/register/success/$registrantId")({
	component: SuccessPage,
})

export default SuccessPage
