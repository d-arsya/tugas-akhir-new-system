import { type JSX, useState, useEffect } from "react"
import { Mail, CheckCircle2, RefreshCw } from "lucide-react"
import { RojaCard, Button, toast } from "@roja/ui"
import { hijackMerchantApi } from "@/lib/dev-hijack"
import { createMerchantApi } from "@roja/api-client"

const merchantApi = hijackMerchantApi(createMerchantApi())

export interface EmailVerifySectionProps {
	email?: string
	isVerified?: boolean
}

export const EmailVerifySection = ({
	email = "merchant@pondokroja.ac.id",
	isVerified = true,
}: EmailVerifySectionProps): JSX.Element => {
	const [cooldown, setCooldown] = useState(0)
	const [isSubmitting, setIsSubmitting] = useState(false)

	useEffect(() => {
		if (cooldown <= 0) return
		const timer = setInterval(() => setCooldown((prev) => prev - 1), 1000)
		return () => clearInterval(timer)
	}, [cooldown])

	const handleResend = async () => {
		if (cooldown > 0 || isSubmitting) return
		setIsSubmitting(true)

		try {
			const res = await merchantApi.resendVerification()
			toast.success("Verifikasi Terkirim", { description: res.message })
			setCooldown(60)
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : "Gagal mengiri email verifikasi"
			toast.error("Gagal", { description: msg })
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<div className="space-y-6">
			<div className="mb-6">
				<h5 className="text-base sm:text-lg font-bold text-slate-800">Email Akun</h5>
				<p className="text-xs text-slate-500 mt-0.5">
					Email resmi yang terhubung dengan akun merchant Anda.
				</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 items-start">
				<label className="md:col-span-4 text-xs font-semibold text-slate-600 md:text-right md:pt-2.5">
					Alamat Email
				</label>
				<div className="md:col-span-7 flex flex-col gap-1.5">
					<div className="flex items-center gap-2">
						<input
							type="email"
							readOnly
							value={email}
							className="h-10 w-full text-xs rounded-xl border border-slate-200 bg-slate-50 px-3 text-slate-700 cursor-not-allowed"
						/>
						<div className="shrink-0 flex items-center justify-center">
							{isVerified && email ? (
								<CheckCircle2 className="w-5 h-5 text-emerald-500" />
							) : (
								<Mail className="w-5 h-5 text-amber-500" />
							)}
						</div>
					</div>
					{!isVerified && email && (
						<p className="text-[11px] text-slate-500">
							Link verifikasi telah dikirimkan ke alamat email diatas.{" "}
							<button
								type="button"
								onClick={handleResend}
								disabled={cooldown > 0 || isSubmitting}
								className="text-[#e4007e] font-medium hover:underline ml-0.5"
							>
								{cooldown > 0 ? `Kirim Ulang (${cooldown}s)` : "Kirim Ulang Link"}
							</button>
						</p>
					)}
				</div>
			</div>
		</div>
	)
}

export default EmailVerifySection
