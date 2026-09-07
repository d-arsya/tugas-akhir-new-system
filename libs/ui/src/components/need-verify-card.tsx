import type { JSX } from "react"
import { Mail, ArrowLeft } from "lucide-react"
import { Button } from "./ui/button"
import { Alert, AlertDescription } from "./ui/alert"
import { RojaCard } from "./roja-card"
import { Link } from "@tanstack/react-router"

export interface NeedVerifyCardProps {
	email?: string
	title?: string
	description?: string
	infoMsg?: string | null
	errorMsg?: string | null
	isLoading?: boolean
	onResend?: () => void | Promise<void>
	loginHref?: string
	className?: string
}

export const NeedVerifyCard = ({
	email,
	title = "Verifikasi Email Diperlukan",
	description,
	infoMsg,
	errorMsg,
	isLoading = false,
	onResend,
	loginHref = "/login",
	className = "",
}: NeedVerifyCardProps): JSX.Element => {
	const defaultDesc = `Akun Anda belum diverifikasi. Silakan periksa kotak masuk email ${
		email ? "" : "Anda"
	} dan klik link verifikasi untuk mengaktifkan akun Anda.`

	return (
		<RojaCard className={`p-8 md:p-10 flex flex-col gap-6 items-center text-center ${className}`}>
			<div className="flex flex-col gap-3 items-center">
				<div className="w-14 h-14 rounded-full bg-amber-50 text-[var(--secondary)] flex items-center justify-center border border-amber-200">
					<Mail className="w-7 h-7 text-[var(--secondary)]" />
				</div>
				<div className="text-sm font-bold text-slate-800 dark:text-white tracking-wide m-0">
					{title}
				</div>
				<p className="text-xs text-[var(--body-txt-inverse)] leading-relaxed m-0">
					{description || (
						<>
							Akun Anda belum diverifikasi. Silakan periksa kotak masuk email{" "}
							{email ? <strong className="text-slate-800 dark:text-slate-200">{email}</strong> : "Anda"} dan klik link verifikasi untuk mengaktifkan akun Anda.
						</>
					)}
				</p>
			</div>

			{errorMsg && (
				<Alert variant="destructive" className="w-full text-left">
					<AlertDescription className="text-xs">{errorMsg}</AlertDescription>
				</Alert>
			)}

			{infoMsg && (
				<Alert variant="success" className="w-full text-left">
					<AlertDescription className="text-xs">{infoMsg}</AlertDescription>
				</Alert>
			)}

			<div className="flex flex-col gap-3 w-full pt-2 border-t border-[var(--bg-form-border)]">
				{onResend && (
					<Button
						onClick={onResend}
						disabled={isLoading}
						variant="roja-primary"
						size="lg"
						className="w-full flex items-center justify-center gap-2"
					>
						<Mail className="w-4 h-4" />
						<span>{isLoading ? "Mengirim..." : "Kirim Ulang Email Verifikasi"}</span>
					</Button>
				)}

				<Button
					asChild
					variant="outline"
					className="w-full text-xs font-semibold py-2.5"
				>
					<Link to={loginHref as any} className="flex items-center justify-center gap-2">
						<ArrowLeft className="w-4 h-4" />
						<span>Kembali ke Halaman Login</span>
					</Link>
				</Button>
			</div>
		</RojaCard>
	)
}

export default NeedVerifyCard
