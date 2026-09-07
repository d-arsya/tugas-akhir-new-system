import type { JSX } from "react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { RojaCard, Button } from "@roja/ui"
import { ArrowLeft, Banknote, Store } from "lucide-react"

const EwalletTopUpCashPage = (): JSX.Element => {
	const navigate = useNavigate()

	return (
		<div className="w-full">
			<RojaCard className="p-6 md:p-8 flex flex-col gap-6 rounded-2xl shadow-sm border-slate-100 bg-white">
				{/* Info Header Banner */}
				<div className="bg-sky-50 border border-sky-100 text-sky-800 p-4 rounded-xl text-center font-bold text-lg">
					Isi saldo via cash
				</div>

				{/* Step 1 & Step 2 Content */}
				<div className="flex flex-col gap-8 my-2">
					{/* Step 1 */}
					<div className="flex flex-col md:flex-row items-start gap-6 bg-slate-50/60 p-6 rounded-2xl border border-slate-100">
						<div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
							<Banknote className="w-8 h-8" />
						</div>
						<div className="flex gap-4">
							<div className="w-8 h-8 rounded-full bg-sky-600 text-white font-bold text-sm flex items-center justify-center shrink-0">
								1
							</div>
							<div className="flex flex-col gap-1.5">
								<h4 className="text-base font-bold text-slate-800">Uang sudah siap</h4>
								<p className="text-xs text-slate-600 leading-relaxed">
									Pastikan uang kamu sudah tersedia secara cash atau secara tunai.
									Dan sesuai dengan nominal yang kamu kehendaki.
								</p>
							</div>
						</div>
					</div>

					{/* Step 2 */}
					<div className="flex flex-col md:flex-row items-start gap-6 bg-slate-50/60 p-6 rounded-2xl border border-slate-100">
						<div className="w-16 h-16 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
							<Store className="w-8 h-8" />
						</div>
						<div className="flex gap-4">
							<div className="w-8 h-8 rounded-full bg-sky-600 text-white font-bold text-sm flex items-center justify-center shrink-0">
								2
							</div>
							<div className="flex flex-col gap-2">
								<h4 className="text-base font-bold text-slate-800">Datang ke kasir kami</h4>
								<p className="text-xs text-slate-600">
									Ada beberapa hal yang kamu perhatikan saat akan datang ke kasir kami:
								</p>
								<ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4 mt-1">
									<li>Membawa uang yang sudah kamu sediakan sebelumnya.</li>
									<li>Membawa kartu dompet digital atau bila belum punya, pastikan kamu ingat NISP kamu.</li>
								</ul>
							</div>
						</div>
					</div>
				</div>
			</RojaCard>
		</div>
	)
}

export const Route = createFileRoute("/_member/e-wallet/top-up/cash")({
	component: EwalletTopUpCashPage,
})

export default EwalletTopUpCashPage
