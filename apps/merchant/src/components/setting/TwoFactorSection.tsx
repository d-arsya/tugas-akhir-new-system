import { type JSX, useState } from "react"
import { ShieldCheck } from "lucide-react"
import { RojaCard, Switch, toast } from "@roja/ui"
import { hijackMerchantApi } from "@/lib/dev-hijack"
import { createMerchantApi } from "@roja/api-client"

const merchantApi = hijackMerchantApi(createMerchantApi())

export interface TwoFactorSectionProps {
	initialEnabled?: boolean
}

export const TwoFactorSection = ({ initialEnabled = true }: TwoFactorSectionProps): JSX.Element => {
	const [enabled, setEnabled] = useState(initialEnabled)
	const [isSubmitting, setIsSubmitting] = useState(false)

	const handleToggle = async (checked: boolean) => {
		setIsSubmitting(true)
		try {
			const res = await merchantApi.toggle2fa(checked)
			setEnabled(checked)
			toast.success("Pengaturan 2FA Disimpan", { description: res.message })
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : "Gagal memperbarui 2FA"
			toast.error("Gagal", { description: msg })
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<div className="space-y-6">
			<div className="mb-6">
				<h5 className="text-base sm:text-lg font-bold text-slate-800">Keamanan</h5>
				<p className="text-xs text-slate-500 mt-0.5">
					Amankan akun kamu dengan fitur ini. Atau jika fitur ini mengganggu, kamu dapat mematikannya.
				</p>
			</div>

			<div className="flex flex-col gap-5 w-full">
				<div className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 items-center">
					<label className="md:col-span-4 text-xs font-semibold text-slate-600 md:text-right">
						Two Factor Authentication
					</label>
					<div className="md:col-span-7 flex items-center gap-6">
						<label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
							<input
								type="radio"
								name="enabled2fa"
								checked={enabled}
								onChange={() => handleToggle(true)}
								disabled={isSubmitting}
								className="text-[#e4007e] focus:ring-[#e4007e] accent-[#e4007e] w-4 h-4 cursor-pointer"
							/>
							Aktif
						</label>
						<label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
							<input
								type="radio"
								name="enabled2fa"
								checked={!enabled}
								onChange={() => handleToggle(false)}
								disabled={isSubmitting}
								className="text-[#e4007e] focus:ring-[#e4007e] accent-[#e4007e] w-4 h-4 cursor-pointer"
							/>
							Nonaktif
						</label>
					</div>
				</div>
			</div>
		</div>
	)
}

export default TwoFactorSection
