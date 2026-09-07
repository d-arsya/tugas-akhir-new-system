import type { JSX } from "react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { RojaCard, Alert, AlertDescription, Button } from "@roja/ui"
import { Info, AlertTriangle, ArrowLeft, Store, Banknote, CheckCircle2 } from "lucide-react"

const EwalletWithdrawPage = (): JSX.Element => {
	const navigate = useNavigate()

	return (
		<div className="w-full">
			<RojaCard className="p-6 md:p-8 flex flex-col gap-6 rounded-2xl shadow-sm border-slate-100 bg-white">
				{/* Info Header Banner */}
				<div className="bg-sky-50 border border-sky-100 text-sky-800 p-4 rounded-xl text-center font-bold text-lg">
					Tarik saldo via loket kasir
				</div>

				{/* Warning Notice Banner */}
				<Alert className="bg-amber-50/80 border-amber-200 text-amber-900 rounded-xl flex items-start gap-3 p-4">
					<AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
					<AlertDescription className="font-bold text-xs sm:text-sm">
						Tarik saldo hanya bisa dilakukan pada saat perpulangan ya.
					</AlertDescription>
				</Alert>

				{/* Step 1 & Step 2 Content */}
				<div className="flex flex-col gap-8 my-2">
					{/* Step 1 */}
					<div className="flex flex-col md:flex-row items-start gap-6 bg-slate-50/60 p-6 rounded-2xl border border-slate-100">
						<div className="w-16 h-16 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
							<Store className="w-8 h-8" />
						</div>
						<div className="flex gap-4">
							<div className="w-8 h-8 rounded-full bg-sky-600 text-white font-bold text-sm flex items-center justify-center shrink-0">
								1
							</div>
							<div className="flex flex-col gap-2">
								<h4 className="text-base font-bold text-slate-800">Datang ke kasir kami</h4>
								<p className="text-xs text-slate-600">
									Ada beberapa hal yang kamu perhatikan saat akan datang ke kasir kami:
								</p>
								<ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4 mt-1">
									<li>Rencanakan terlebih dahulu. Kamu ingin mengambil uang berapa.</li>
									<li>Membawa kartu dompet digital atau bila belum punya, pastikan kamu ingat dengan NISP kamu.</li>
									<li>Dan pastikan juga ingat dengan PIN kamu.</li>
								</ul>
							</div>
						</div>
					</div>

					{/* Step 2 */}
					<div className="flex flex-col md:flex-row items-start gap-6 bg-slate-50/60 p-6 rounded-2xl border border-slate-100">
						<div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
							<Banknote className="w-8 h-8" />
						</div>
						<div className="flex gap-4">
							<div className="w-8 h-8 rounded-full bg-sky-600 text-white font-bold text-sm flex items-center justify-center shrink-0">
								2
							</div>
							<div className="flex flex-col gap-1.5">
								<h4 className="text-base font-bold text-slate-800">Cek jumlah uang tunai</h4>
								<p className="text-xs text-slate-600 leading-relaxed">
									Pastikan uang yang kamu terima dari petugas kasir, jumlah atau nominalnya sudah sesuai.
								</p>
							</div>
						</div>
					</div>
				</div>
			</RojaCard>
		</div>
	)
}

export const Route = createFileRoute("/_member/e-wallet/withdraw")({
	component: EwalletWithdrawPage,
})

export default EwalletWithdrawPage
