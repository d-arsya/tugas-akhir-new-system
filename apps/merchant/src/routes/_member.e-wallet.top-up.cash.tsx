import type { JSX } from "react"
import { createFileRoute, Link } from "@tanstack/react-router"
import { Coins, ArrowLeft, Store, CheckCircle } from "lucide-react"
import { RojaCard } from "@roja/ui"

export const Route = createFileRoute("/_member/e-wallet/top-up/cash")({
	component: CashTopUpRouteComponent,
})

function CashTopUpRouteComponent(): JSX.Element {
	return (
		<div className="space-y-6 w-full mx-auto">
			<Link to="/e-wallet" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-medium">
				<ArrowLeft className="w-3.5 h-3.5" />
				Kembali ke Dompet Digital
			</Link>

			<RojaCard className="p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-4 shadow-sm text-xs leading-relaxed text-slate-600 dark:text-slate-300">
				<div className="flex items-center gap-2 font-bold text-slate-800 dark:text-white text-sm">
					<Store className="w-4 h-4 text-[#ffa800]" />
					Prosedur Top-Up Kasir Pesantren:
				</div>

				<ol className="space-y-2.5 list-decimal list-inside font-medium">
					<li>Kunjungi loket kasir keuangan Pondok Roja pada jam kerja (08.00 - 15.00 WIB).</li>
					<li>Sebutkan <strong>Nomor Unik Merchant Anda (`MRC-2026-001`)</strong> atau tunjukkan Profil Merchant.</li>
					<li>Serahkan uang tunai nominal top-up yang diinginkan kepada petugas kasir.</li>
					<li>Petugas kasir akan memproses dan mengkonfirmasi penambahan saldo e-wallet merchant.</li>
					<li>Saldo e-wallet merchant akan langsung bertambah secara real-time dan bukti cetak struk diserahkan oleh kasir.</li>
				</ol>
			</RojaCard>
		</div>
	)
}

export default Route
