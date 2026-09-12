import type { JSX } from "react"
import { createFileRoute, Link } from "@tanstack/react-router"
import { ShieldAlert, ArrowLeft, Mail } from "lucide-react"
import { RojaCard, Button } from "@roja/ui"

export const Route = createFileRoute("/_member/e-wallet/inactive")({
	component: InactiveEwalletRouteComponent,
})

function InactiveEwalletRouteComponent(): JSX.Element {
	return (
		<div className="space-y-6 w-full mx-auto py-6">
			<Link to="/profile" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-medium">
				<ArrowLeft className="w-3.5 h-3.5" />
				Kembali ke Profil
			</Link>

			<RojaCard className="p-6 md:p-8 rounded-2xl border border-rose-200/80 dark:border-rose-900/40 text-center space-y-4 shadow-sm">
				<div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-500 mb-1">
					<ShieldAlert className="w-7 h-7" />
				</div>

				<div>
					<h5 className="text-lg font-bold text-slate-800 dark:text-white">E-Wallet Merchant Non-Aktif</h5>
					<p className="text-xs text-slate-500 mt-1 leading-relaxed">
						Layanan dompet digital merchant Anda saat ini sedang dinonaktifkan oleh administrator sistem.
					</p>
				</div>

				<div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs text-slate-600 dark:text-slate-300">
					Silakan hubungi bagian Sekretariat / Keuangan Pondok Roja untuk mengaktifkan kembali status dompet digital Anda.
				</div>

				<a href="mailto:support@pondokroja.ac.id">
					<Button className="w-full h-10 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer">
						<Mail className="w-4 h-4" />
						Hubungi Admin Sistem
					</Button>
				</a>
			</RojaCard>
		</div>
	)
}

export default Route
