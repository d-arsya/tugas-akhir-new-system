import type { JSX } from "react"
import { createFileRoute, Link } from "@tanstack/react-router"
import { ArrowDownLeft, ArrowLeft, Building2, CheckCircle2 } from "lucide-react"
import { RojaCard } from "@roja/ui"

export const Route = createFileRoute("/_member/e-wallet/withdraw")({
	component: WithdrawRouteComponent,
})

function WithdrawRouteComponent(): JSX.Element {
	return (
		<div className="space-y-6 w-full mx-auto">
			<Link to="/e-wallet" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-medium">
				<ArrowLeft className="w-3.5 h-3.5" />
				Kembali ke Dompet Digital
			</Link>

			<RojaCard className="p-6 rounded-2xl border border-slate-200/80 space-y-4 shadow-sm text-xs leading-relaxed text-slate-600">
				<div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
					<Building2 className="w-4 h-4 text-[#1bc5bd]" />
					Prosedur Penarikan Saldo Keuangan:
				</div>

				<ol className="space-y-2.5 list-decimal list-inside font-medium">
					<li>Kunjungi loket kasir keuangan Bendahara Pesantren Pondok Roja.</li>
					<li>Informasikan nominal saldo merchant yang ingin ditarik/dicairkan.</li>
					<li>Kasir akan melakukan verifikasi identitas merchant dan autentikasi PIN E-Wallet.</li>
					<li>Setelah dikonfirmasi, saldo e-wallet merchant terpotong dan uang tunai diserahkan.</li>
				</ol>
			</RojaCard>
		</div>
	)
}

export default Route
