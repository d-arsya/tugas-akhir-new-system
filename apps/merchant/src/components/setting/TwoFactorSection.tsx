import { type JSX, useState, useEffect } from "react"
import { ShieldCheck } from "lucide-react"
import { RojaCard, Switch } from "@roja/ui"
import { toast } from "sonner"
import { useToggle2faMutation } from "@/hooks/use-merchant-queries"

export interface TwoFactorSectionProps {
	initialEnabled?: boolean
}

export const TwoFactorSection = ({ initialEnabled = true }: TwoFactorSectionProps): JSX.Element => {
	const [enabled, setEnabled] = useState(initialEnabled)
	const toggle2faMutation = useToggle2faMutation()

	useEffect(() => {
		setEnabled(initialEnabled)
	}, [initialEnabled])

	const handleToggle = (checked: boolean) => {
		const promise = toggle2faMutation.mutateAsync(checked).then((res) => {
			setEnabled(checked)
			return res
		})

		toast.promise(promise, {
			loading: "Memperbarui pengaturan 2FA...",
			success: (res) => res.message || "Pengaturan 2FA disimpan",
			error: (err: unknown) => (err instanceof Error ? err.message : "Gagal memperbarui 2FA"),
		})
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
								disabled={toggle2faMutation.isPending}
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
								disabled={toggle2faMutation.isPending}
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
