import type { JSX, ReactNode } from "react"
import { useState } from "react"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { Alert, AlertDescription } from "./ui/alert"
import { RojaCard } from "./roja-card"

export interface TwoFactorCardProps {
	email?: string
	title?: string
	description?: ReactNode
	errorMsg?: string | null
	infoMsg?: string | null
	isLoading?: boolean
	isResending?: boolean
	onSubmit: (code: string) => void | Promise<void>
	onResend?: () => void | Promise<void>
	submitLabel?: string
	className?: string
}

export const TwoFactorCard = ({
	email,
	title = "Verifikasi Dua Faktor (2FA)",
	description,
	errorMsg,
	infoMsg,
	isLoading = false,
	isResending = false,
	onSubmit,
	onResend,
	submitLabel = "Verifikasi",
	className = "",
}: TwoFactorCardProps): JSX.Element => {
	const [code, setCode] = useState("")

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		if (code.trim()) {
			onSubmit(code.trim())
		}
	}

	return (
		<RojaCard className={`flex flex-col gap-6 p-8 md:p-10 w-full max-w-md mx-auto my-8 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 ${className}`}>
			{/* Logo & Header */}
			<div className="flex flex-col gap-2 items-center text-center">
				<img src="/assets/svg/etc/Logo.svg" alt="Pondok Roja" className="h-14 w-auto mb-2" />
				<div className="text-xs font-bold text-[var(--primary)] tracking-wide m-0">
					{title}
				</div>
				<div className="text-xs text-[var(--body-txt-inverse)] text-slate-500 dark:text-slate-400 m-0 leading-relaxed">
					{description ?? (
						<>
							Masukkan 6 digit kode verifikasi yang telah dikirim ke email{" "}
							{email ? (
								<strong className="text-slate-700 dark:text-slate-200">{email}</strong>
							) : (
								"Anda"
							)}
							.
						</>
					)}
				</div>
			</div>

			{/* Alerts */}
			{errorMsg && (
				<Alert variant="destructive" className="flex flex-col gap-2">
					<AlertDescription className="text-xs">{errorMsg}</AlertDescription>
				</Alert>
			)}

			{infoMsg && (
				<Alert variant="success">
					<AlertDescription className="text-xs">{infoMsg}</AlertDescription>
				</Alert>
			)}

			{/* Form */}
			<form onSubmit={handleSubmit} className="flex flex-col gap-4">
				<div className="flex flex-col gap-1.5 items-center">
					<Input
						id="two-factor-code"
						type="text"
						inputMode="numeric"
						maxLength={6}
						value={code}
						onChange={(e) => setCode(e.target.value)}
						placeholder="Kode OTP (6 digit)"
						className="h-12 text-center tracking-widest text-lg font-bold font-mono w-full rounded-xl border-slate-200 dark:border-slate-700"
						required
						autoFocus
					/>
				</div>

				<Button
					type="submit"
					variant="roja-primary"
					size="lg"
					disabled={isLoading || code.length < 4}
					className="w-full mt-2 cursor-pointer"
				>
					{isLoading ? "Memproses..." : submitLabel}
				</Button>
			</form>

			{/* Resend Action */}
			{onResend && (
				<div className="text-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-4 flex justify-between items-center">
					<span>Tidak menerima kode?</span>
					<Button
						type="button"
						variant="link"
						onClick={() => onResend()}
						disabled={isResending}
						className="text-[var(--secondary)] p-0 h-auto font-semibold text-xs cursor-pointer hover:underline"
					>
						{isResending ? "Mengirim..." : "Kirim Ulang Kode"}
					</Button>
				</div>
			)}
		</RojaCard>
	)
}

export default TwoFactorCard
