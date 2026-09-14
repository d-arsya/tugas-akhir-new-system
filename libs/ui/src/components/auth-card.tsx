import type { JSX, ReactNode } from "react"
import { RojaCard } from "./roja-card"
import { Alert, AlertDescription } from "./ui/alert"

export interface AuthCardProps {
	title: string
	description?: ReactNode | undefined
	logoSrc?: string | undefined
	errorMsg?: string | null | undefined
	successMsg?: string | null | undefined
	infoMsg?: string | null | undefined
	footer?: ReactNode | undefined
	className?: string | undefined
	children: ReactNode
}

export const AuthCard = ({
	title,
	description,
	logoSrc = "/assets/svg/etc/Logo.svg",
	errorMsg,
	successMsg,
	infoMsg,
	footer,
	className = "",
	children,
}: AuthCardProps): JSX.Element => {
	return (
		<RojaCard className={`flex flex-col gap-6 p-8 md:p-10 w-full max-w-md mx-auto my-8 bg-white rounded-2xl shadow-sm border border-slate-100 ${className}`}>
			{/* Logo & Header */}
			<div className="flex flex-col gap-2 items-center text-center">
				{logoSrc && (
					<img src={logoSrc} alt="Pondok Roja" className="h-14 w-auto mb-2" />
				)}
				<div className="text-xs font-bold text-[var(--primary)] tracking-wide m-0">
					{title}
				</div>
				{description && (
					<div className="text-xs text-[var(--body-txt-inverse)] text-slate-500 m-0 leading-relaxed">
						{description}
					</div>
				)}
			</div>

			{/* Alerts */}
			{errorMsg && (
				<Alert variant="destructive" className="flex flex-col gap-2">
					<AlertDescription className="text-xs">{errorMsg}</AlertDescription>
				</Alert>
			)}

			{successMsg && (
				<Alert variant="success">
					<AlertDescription className="text-xs">{successMsg}</AlertDescription>
				</Alert>
			)}

			{infoMsg && (
				<Alert variant="info">
					<AlertDescription className="text-xs">{infoMsg}</AlertDescription>
				</Alert>
			)}

			{/* Form / Content */}
			{children}

			{/* Footer */}
			{footer && (
				<div className="text-center text-xs border-t border-[var(--bg-form-border)] border-slate-100 pt-4 text-slate-500">
					{footer}
				</div>
			)}
		</RojaCard>
	)
}

export default AuthCard
