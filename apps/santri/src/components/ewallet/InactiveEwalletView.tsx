import type { JSX } from "react"
import { RojaCard } from "@roja/ui"
import { Button } from "@roja/ui"
import { ShieldOff } from "lucide-react"
import { useNavigate } from "@tanstack/react-router"

export const InactiveEwalletView = (): JSX.Element => {
	const navigate = useNavigate()

	return (
		<RojaCard className="p-8 sm:p-12 text-center max-w-xl mx-auto shadow-xl rounded-2xl border-slate-100 bg-white">
			<div className="flex flex-col items-center">
				<div className="w-24 h-24 rounded-full bg-rose-50 flex items-center justify-center mb-6">
					<ShieldOff className="w-12 h-12 text-rose-500" />
				</div>

				<h3 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
					Sementara, dompet kamu sedang di <span className="text-rose-600">nonaktifkan</span>
				</h3>

				<div className="w-full sm:w-4/5 my-4">
					<p className="text-sm text-slate-600 leading-relaxed">
						Ada beberapa hal yang menyebabkan akun dompetmu kami nonaktifkan.
						Bisa diaktifkan kembali bila ada kesepakatan antara Pondok ROJA dengan kamu.
						Segera hubungi pihak Pondok ROJA ya.
					</p>
				</div>

				<Button
					type="button"
					onClick={() => navigate({ to: "/payment-history" as any })}
					className="mt-4 rounded-xl bg-[#e4007e] hover:bg-[#c3006c] text-white px-8 font-semibold shadow-md hover:shadow-lg transition-all"
				>
					Kembali
				</Button>
			</div>
		</RojaCard>
	)
}

export default InactiveEwalletView
