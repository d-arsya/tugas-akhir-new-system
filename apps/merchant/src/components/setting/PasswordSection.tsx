import { type JSX, useState } from "react"
import { Lock, KeyRound } from "lucide-react"
import { RojaCard, Input, Button, toast } from "@roja/ui"
import { hijackMerchantApi } from "@/lib/dev-hijack"
import { createMerchantApi } from "@roja/api-client"

const merchantApi = hijackMerchantApi(createMerchantApi())

export const PasswordSection = (): JSX.Element => {
	const [password, setPassword] = useState("")
	const [passwordConfirmation, setPasswordConfirmation] = useState("")
	const [isSubmitting, setIsSubmitting] = useState(false)

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (password.length < 8) {
			toast.error("Password Terlalu Pendek", { description: "Password minimal 8 karakter." })
			return
		}
		if (password !== passwordConfirmation) {
			toast.error("Konfirmasi Tidak Cocok", { description: "Konfirmasi password baru tidak cocok." })
			return
		}

		setIsSubmitting(true)
		try {
			const res = await merchantApi.changePassword({ password, passwordConfirmation })
			setPassword("")
			setPasswordConfirmation("")
			toast.success("Password Diperbarui", { description: res.message })
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : "Gagal mengubah password"
			toast.error("Gagal", { description: msg })
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<div className="space-y-6">
			<div className="mb-6">
				<h5 className="text-base sm:text-lg font-bold text-slate-800">Ubah Password Akun</h5>
				<p className="text-xs text-slate-500 mt-0.5">
					Perbarui kata sandi untuk menjaga keamanan akun merchant Anda.
				</p>
			</div>

			<form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full">
				<div className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 items-start">
					<label className="md:col-span-4 text-xs font-semibold text-slate-600 md:text-right md:pt-2.5">
						Password Baru
					</label>
					<div className="md:col-span-7 flex flex-col gap-1">
						<Input
							type="password"
							placeholder="Minimal 8 karakter"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							className="h-10 text-xs rounded-xl border-slate-200 bg-white"
						/>
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 items-start">
					<label className="md:col-span-4 text-xs font-semibold text-slate-600 md:text-right md:pt-2.5">
						Konfirmasi Password
					</label>
					<div className="md:col-span-7 flex flex-col gap-1">
						<Input
							type="password"
							placeholder="Ulangi password baru"
							value={passwordConfirmation}
							onChange={(e) => setPasswordConfirmation(e.target.value)}
							className="h-10 text-xs rounded-xl border-slate-200 bg-white"
						/>
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-2">
					<div className="md:col-start-5 md:col-span-7">
						<Button
							type="submit"
							disabled={isSubmitting || !password || !passwordConfirmation}
							className="rounded-xl bg-[#e4007e] hover:bg-[#c3006c] text-white px-8 h-10 font-semibold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer"
						>
							{isSubmitting ? "Menyimpan..." : "Ubah Password"}
							<KeyRound className="w-4 h-4" />
						</Button>
					</div>
				</div>
			</form>
		</div>
	)
}

export default PasswordSection
