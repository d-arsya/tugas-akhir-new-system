import type { JSX } from "react"
import { useState, useEffect } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { RojaCard, Button, Input, Label, Alert, AlertDescription } from "@roja/ui"
import useAuthStore from "@/stores/auth.store"
import { CheckCircle2, AlertCircle } from "lucide-react"
import {
	useSantriSetting,
	useChangePasswordMutation,
	useToggle2faMutation,
	useResendSettingEmailVerificationMutation,
} from "@/hooks/use-santri-queries"

const SettingPage = (): JSX.Element => {
	const { user } = useAuthStore()
	const { data: settingData, isLoading } = useSantriSetting()

	const changePasswordMutation = useChangePasswordMutation()
	const toggle2faMutation = useToggle2faMutation()
	const resendVerificationMutation = useResendSettingEmailVerificationMutation()

	const [email, setEmail] = useState<string>("")
	const [password, setPassword] = useState<string>("")
	const [passwordConfirmation, setPasswordConfirmation] = useState<string>("")
	const [isVerified, setIsVerified] = useState<boolean>(true)
	const [accountMessage, setAccountMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

	const [enabled2fa, setEnabled2fa] = useState<boolean>(true)
	const [securityMessage, setSecurityMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

	useEffect(() => {
		if (settingData) {
			setEmail(settingData.email || user?.email || "")
			setIsVerified(!!settingData.emailVerifiedAt)
			setEnabled2fa(settingData.enabled2fa)
		} else if (user?.email) {
			setEmail(user.email)
			setIsVerified(true)
		}
	}, [settingData, user])

	const handleAccountSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setAccountMessage(null)
		if (!password) {
			setAccountMessage({ type: "error", text: "Masukkan password baru jika ingin mengubah password." })
			return
		}
		if (password !== passwordConfirmation) {
			setAccountMessage({ type: "error", text: "Konfirmasi password tidak cocok." })
			return
		}

		changePasswordMutation.mutate(
			{ password, passwordConfirmation },
			{
				onSuccess: (res) => {
					setAccountMessage({ type: "success", text: res.message || "Password berhasil diperbarui." })
					setPassword("")
					setPasswordConfirmation("")
				},
				onError: (err: any) => {
					setAccountMessage({ type: "error", text: err.message || "Gagal memperbarui password." })
				},
			},
		)
	}

	const handleSecuritySubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setSecurityMessage(null)
		toggle2faMutation.mutate(
			{ enabled: enabled2fa },
			{
				onSuccess: (res) => {
					setSecurityMessage({ type: "success", text: res.message || "Pengaturan 2FA berhasil diperbarui." })
				},
				onError: (err: any) => {
					setSecurityMessage({ type: "error", text: err.message || "Gagal memperbarui 2FA." })
				},
			},
		)
	}

	const handleResendVerification = async () => {
		resendVerificationMutation.mutate(undefined, {
			onSuccess: (res) => {
				setAccountMessage({ type: "success", text: res.message || "Link verifikasi telah dikirim ke email." })
			},
			onError: (err: any) => {
				setAccountMessage({ type: "error", text: err.message || "Gagal mengirim link verifikasi." })
			},
		})
	}

	if (isLoading) {
		return (
			<div className="py-12 text-center text-slate-400 text-sm font-medium">
				Memuat pengaturan akun...
			</div>
		)
	}

	return (
		<div className="flex flex-col gap-6 w-full">
			<RojaCard className="p-6 md:p-8 rounded-2xl shadow-sm border-slate-100 bg-white">
				<div className="mb-6">
					<h3 className="text-base sm:text-lg font-bold text-slate-800">Akun aplikasi</h3>
					<p className="text-xs text-slate-500 mt-0.5">Kamu dapat mengganti password akun setiap saat.</p>
				</div>

				{accountMessage && (
					<Alert
						variant={accountMessage.type === "error" ? "destructive" : "default"}
						className={`mb-6 text-xs py-2.5 ${accountMessage.type === "success" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : ""}`}
					>
						<AlertDescription>{accountMessage.text}</AlertDescription>
					</Alert>
				)}

				<form onSubmit={handleAccountSubmit} className="flex flex-col gap-5 w-full">
					<div className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 items-start">
						<Label className="md:col-span-4 text-xs font-semibold text-slate-600 md:text-right md:pt-2.5">
							Email
						</Label>
						<div className="md:col-span-7 flex flex-col gap-1.5">
							<div className="flex items-center gap-2">
								<Input
									type="email"
									readOnly
									value={email}
									className="h-10 text-xs rounded-xl border-slate-200 bg-slate-50 cursor-not-allowed"
								/>
								<div className="shrink-0 flex items-center justify-center">
									{isVerified && email ? (
										<CheckCircle2 className="w-5 h-5 text-emerald-500" />
									) : email ? (
										<AlertCircle className="w-5 h-5 text-amber-500" />
									) : (
										<AlertCircle className="w-5 h-5 text-rose-500" />
									)}
								</div>
							</div>
							{!isVerified && email && (
								<p className="text-[11px] text-slate-500">
									Kami sudah mengirimkan link verifikasi ke alamat diatas.{" "}
									<button
										type="button"
										onClick={handleResendVerification}
										disabled={resendVerificationMutation.isPending}
										className="text-[#e4007e] font-medium hover:underline ml-0.5"
									>
										{resendVerificationMutation.isPending ? "Mengirim..." : "Kirim Ulang"}
									</button>
								</p>
							)}
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 items-start">
						<Label className="md:col-span-4 text-xs font-semibold text-slate-600 md:text-right md:pt-2.5">
							Password Baru
						</Label>
						<div className="md:col-span-7 flex flex-col gap-1">
							<Input
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="h-10 text-xs rounded-xl border-slate-200 bg-white"
							/>
							<span className="text-[11px] text-slate-400">Kosongkan jika tidak ingin mengganti password.</span>
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 items-start">
						<Label className="md:col-span-4 text-xs font-semibold text-slate-600 md:text-right md:pt-2.5">
							Konfirmasi Password
						</Label>
						<div className="md:col-span-7 flex flex-col gap-1">
							<Input
								type="password"
								value={passwordConfirmation}
								onChange={(e) => setPasswordConfirmation(e.target.value)}
								className="h-10 text-xs rounded-xl border-slate-200 bg-white"
							/>
							<span className="text-[11px] text-slate-400">Kosongkan jika tidak ingin mengganti password.</span>
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-12 gap-4">
						<div className="md:col-start-5 md:col-span-7">
							<Button
								type="submit"
								disabled={changePasswordMutation.isPending}
								className="rounded-xl bg-[#e4007e] hover:bg-[#c3006c] text-white px-8 font-semibold text-xs shadow-sm"
							>
								{changePasswordMutation.isPending ? "Menyimpan..." : "Update Password"}
							</Button>
						</div>
					</div>
				</form>
			</RojaCard>

			<RojaCard className="p-6 md:p-8 rounded-2xl shadow-sm border-slate-100 bg-white">
				<div className="mb-6">
					<h3 className="text-base sm:text-lg font-bold text-slate-800">Keamanan</h3>
					<p className="text-xs text-slate-500 mt-0.5">
						Amankan akun kamu dengan fitur ini. Atau jika fitur ini mengganggu, kamu dapat mematikannya.
					</p>
				</div>

				{securityMessage && (
					<Alert
						variant={securityMessage.type === "error" ? "destructive" : "default"}
						className={`mb-6 text-xs py-2.5 ${securityMessage.type === "success" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : ""}`}
					>
						<AlertDescription>{securityMessage.text}</AlertDescription>
					</Alert>
				)}

				<form onSubmit={handleSecuritySubmit} className="flex flex-col gap-5 w-full">
					<div className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 items-center">
						<Label className="md:col-span-4 text-xs font-semibold text-slate-600 md:text-right">
							Two Factor Authentication
						</Label>
						<div className="md:col-span-7 flex items-center gap-6">
							<label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
								<input
									type="radio"
									name="enabled2fa"
									checked={enabled2fa}
									onChange={() => setEnabled2fa(true)}
									className="text-[#e4007e] focus:ring-[#e4007e] accent-[#e4007e] w-4 h-4 cursor-pointer"
								/>
								Aktif
							</label>
							<label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
								<input
									type="radio"
									name="enabled2fa"
									checked={!enabled2fa}
									onChange={() => setEnabled2fa(false)}
									className="text-[#e4007e] focus:ring-[#e4007e] accent-[#e4007e] w-4 h-4 cursor-pointer"
								/>
								Nonaktif
							</label>
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-2">
						<div className="md:col-start-5 md:col-span-7">
							<Button
								type="submit"
								disabled={toggle2faMutation.isPending}
								className="rounded-xl bg-[#e4007e] hover:bg-[#c3006c] text-white px-8 font-semibold text-xs shadow-sm"
							>
								{toggle2faMutation.isPending ? "Menyimpan..." : "Update Keamanan"}
							</Button>
						</div>
					</div>
				</form>
			</RojaCard>
		</div>
	)
}

export const Route = createFileRoute("/_member/setting")({
	component: SettingPage,
})

export default SettingPage
