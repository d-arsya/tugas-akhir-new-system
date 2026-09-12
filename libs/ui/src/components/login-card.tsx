import type { JSX, ReactNode } from "react"
import { useState } from "react"
import { Link } from "@tanstack/react-router"
import { AuthCard } from "./auth-card"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { Checkbox } from "./ui/checkbox"

export interface LoginSubmitValues {
	identifier: string
	password: string
	remember?: boolean
}

export interface LoginCardProps {
	title: string
	description?: ReactNode
	logoSrc?: string
	identifierLabel?: string
	identifierPlaceholder?: string
	identifierType?: "text" | "email"
	defaultIdentifier?: string
	passwordPlaceholder?: string
	showRememberMe?: boolean
	forgotPasswordHref?: string
	submitLabel?: string
	isLoading?: boolean
	errorMsg?: string | null
	infoMsg?: string | null
	extraAlertContent?: ReactNode
	footer?: ReactNode
	className?: string
	onSubmit: (values: LoginSubmitValues) => void | Promise<void>
}

export const LoginCard = ({
	title,
	description,
	logoSrc,
	identifierPlaceholder = "Email / Nomor Akun",
	identifierType = "text",
	defaultIdentifier = "",
	passwordPlaceholder = "Password",
	showRememberMe = false,
	forgotPasswordHref = "/forgot-password",
	submitLabel = "Masuk",
	isLoading = false,
	errorMsg,
	infoMsg,
	extraAlertContent,
	footer,
	className = "",
	onSubmit,
}: LoginCardProps): JSX.Element => {
	const [identifier, setIdentifier] = useState(defaultIdentifier)
	const [password, setPassword] = useState("")
	const [remember, setRemember] = useState(false)
	const [validationError, setValidationError] = useState<string | null>(null)

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		setValidationError(null)

		if (!identifier.trim()) {
			setValidationError("Mohon isi kolom akun / identifier.")
			return
		}
		if (!password) {
			setValidationError("Password wajib diisi.")
			return
		}

		onSubmit({ identifier: identifier.trim(), password, remember })
	}

	return (
		<AuthCard
			title={title}
			description={description}
			logoSrc={logoSrc}
			errorMsg={validationError || errorMsg}
			infoMsg={infoMsg}
			footer={footer}
			className={className}
		>
			{extraAlertContent}

			<form onSubmit={handleSubmit} className="flex flex-col gap-4">
				<div className="flex flex-col gap-1.5">
					<Input
						id="login-identifier"
						type={identifierType}
						value={identifier}
						onChange={(e) => setIdentifier(e.target.value)}
						placeholder={identifierPlaceholder}
						className="h-11 text-xs rounded-xl border-slate-200"
						required
						autoFocus
					/>
				</div>

				<div className="flex flex-col gap-1.5">
					<Input
						id="login-password"
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						placeholder={passwordPlaceholder}
						className="h-11 text-xs rounded-xl border-slate-200"
						required
					/>
					<div className="flex justify-between items-center text-xs pt-0.5">
						{showRememberMe ? (
							<div className="flex items-center space-x-2">
								<Checkbox
									id="login-remember"
									checked={remember}
									onCheckedChange={(checked) => setRemember(Boolean(checked))}
								/>
								<label htmlFor="login-remember"className="text-slate-600 font-medium cursor-pointer text-xs">
									Remember Me
								</label>
							</div>
						) : (
							<div />
						)}

						{forgotPasswordHref && (
							<Link
								to={forgotPasswordHref as any}
								className="text-[11px] text-[var(--secondary)] hover:underline font-medium ml-auto"
							>
								Lupa Password?
							</Link>
						)}
					</div>
				</div>

				<Button
					type="submit"
					variant="roja-primary"
					size="lg"
					disabled={isLoading}
					className="w-full mt-2 cursor-pointer"
				>
					{isLoading ? "Memproses..." : submitLabel}
				</Button>
			</form>
		</AuthCard>
	)
}

export default LoginCard
