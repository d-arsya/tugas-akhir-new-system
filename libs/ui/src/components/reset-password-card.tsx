import type { JSX, ReactNode } from "react"
import { useState } from "react"
import { Link } from "@tanstack/react-router"
import { AuthCard } from "./auth-card"
import { Input } from "./ui/input"
import { Button } from "./ui/button"

export interface ResetPasswordSubmitValues {
	password: string
	passwordConfirmation: string
}

export interface ResetPasswordCardProps {
	title?: string
	description?: ReactNode
	logoSrc?: string
	passwordPlaceholder?: string
	confirmPasswordPlaceholder?: string
	submitLabel?: string
	loginHref?: string
	isLoading?: boolean
	successMsg?: string | null
	errorMsg?: string | null
	footer?: ReactNode
	className?: string
	onSubmit: (values: ResetPasswordSubmitValues) => void | Promise<void>
}

export const ResetPasswordCard = ({
	title = "Reset Password",
	description = "Buat password baru yang aman untuk akun Anda.",
	logoSrc,
	passwordPlaceholder = "Password Baru (min 8 karakter)",
	confirmPasswordPlaceholder = "Konfirmasi Password Baru",
	submitLabel = "Simpan Password Baru",
	loginHref = "/login",
	isLoading = false,
	successMsg,
	errorMsg,
	footer,
	className = "",
	onSubmit,
}: ResetPasswordCardProps): JSX.Element => {
	const [password, setPassword] = useState("")
	const [passwordConfirmation, setPasswordConfirmation] = useState("")
	const [validationError, setValidationError] = useState<string | null>(null)

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		setValidationError(null)

		if (password.length < 8) {
			setValidationError("Password minimal 8 karakter.")
			return
		}

		if (password !== passwordConfirmation) {
			setValidationError("Konfirmasi password tidak cocok.")
			return
		}

		onSubmit({ password, passwordConfirmation })
	}

	const defaultFooter = (
		<Link to={loginHref as any} className="text-[var(--secondary)] hover:underline font-semibold">
			Kembali ke Login
		</Link>
	)

	return (
		<AuthCard
			title={title}
			description={description}
			logoSrc={logoSrc}
			successMsg={successMsg}
			errorMsg={validationError || errorMsg}
			footer={footer ?? defaultFooter}
			className={className}
		>
			<form onSubmit={handleSubmit} className="flex flex-col gap-4">
				<div className="flex flex-col gap-1.5">
					<Input
						id="reset-password"
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						placeholder={passwordPlaceholder}
						className="h-11 text-xs rounded-xl border-slate-200"
						required
						autoFocus
					/>
				</div>

				<div className="flex flex-col gap-1.5">
					<Input
						id="reset-password-confirm"
						type="password"
						value={passwordConfirmation}
						onChange={(e) => setPasswordConfirmation(e.target.value)}
						placeholder={confirmPasswordPlaceholder}
						className="h-11 text-xs rounded-xl border-slate-200"
						required
					/>
				</div>

				<Button
					type="submit"
					variant="roja-primary"
					size="lg"
					disabled={isLoading || !password || !passwordConfirmation}
					className="w-full mt-2 cursor-pointer"
				>
					{isLoading ? "Menyimpan..." : submitLabel}
				</Button>
			</form>
		</AuthCard>
	)
}

export default ResetPasswordCard
