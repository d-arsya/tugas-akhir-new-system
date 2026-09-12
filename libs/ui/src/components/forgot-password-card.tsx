import type { JSX, ReactNode } from "react"
import { useState } from "react"
import { Link } from "@tanstack/react-router"
import { AuthCard } from "./auth-card"
import { Input } from "./ui/input"
import { Button } from "./ui/button"

export interface ForgotPasswordCardProps {
	title?: string
	description?: ReactNode
	logoSrc?: string
	emailPlaceholder?: string
	submitLabel?: string
	loginHref?: string
	isLoading?: boolean
	isSubmitSuccessful?: boolean
	successMsg?: string | null
	errorMsg?: string | null
	footer?: ReactNode
	className?: string
	onSubmit: (email: string) => void | Promise<void>
}

export const ForgotPasswordCard = ({
	title = "Lupa Password",
	description = "Masukkan alamat email terdaftar Anda untuk menerima link reset password.",
	logoSrc,
	emailPlaceholder = "Alamat Email",
	submitLabel = "Kirim Link Reset",
	loginHref = "/login",
	isLoading = false,
	isSubmitSuccessful = false,
	successMsg,
	errorMsg,
	footer,
	className = "",
	onSubmit,
}: ForgotPasswordCardProps): JSX.Element => {
	const [email, setEmail] = useState("")

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		if (email.trim()) {
			onSubmit(email.trim())
		}
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
			errorMsg={errorMsg}
			footer={footer ?? defaultFooter}
			className={className}
		>
			{isSubmitSuccessful ? (
				<div className="text-center py-2 space-y-4">
					<div className="p-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-medium">
						{successMsg || "Tautan reset password telah dikirimkan ke email Anda. Silakan periksa kotak masuk atau spam."}
					</div>
					<Button
						asChild
						variant="roja-primary"
						size="lg"
						className="w-full cursor-pointer"
					>
						<Link to={loginHref as any}>Kembali ke Login</Link>
					</Button>
				</div>
			) : (
				<form onSubmit={handleSubmit} className="flex flex-col gap-4">
					<div className="flex flex-col gap-1.5">
						<Input
							id="forgot-email"
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder={emailPlaceholder}
							className="h-11 text-xs rounded-xl border-slate-200"
							required
							autoFocus
						/>
					</div>

					<Button
						type="submit"
						variant="roja-primary"
						size="lg"
						disabled={isLoading || !email.trim()}
						className="w-full mt-2 cursor-pointer"
					>
						{isLoading ? "Mengirim..." : submitLabel}
					</Button>
				</form>
			)}
		</AuthCard>
	)
}

export default ForgotPasswordCard
