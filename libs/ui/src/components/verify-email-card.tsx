import type { JSX } from "react"
import { CheckCircle2, XCircle } from "lucide-react"
import { Button } from "./ui/button"
import { Alert, AlertDescription } from "./ui/alert"
import { Skeleton } from "./ui/skeleton"
import { RojaCard } from "./roja-card"
import { Link } from "@tanstack/react-router"

export interface VerifyEmailCardProps {
	status: "verifying" | "success" | "error"
	message?: string
	onLoginClick?: () => void
	loginHref?: string
	className?: string
}

export const VerifyEmailCard = ({
	status,
	message,
	onLoginClick,
	loginHref = "/login",
	className = "",
}: VerifyEmailCardProps): JSX.Element => {
	return (
		<RojaCard className={`p-8 md:p-10 flex flex-col gap-6 items-center text-center w-full max-w-md mx-auto my-8 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 ${className}`}>
			{status === "verifying" && (
				<div className="flex flex-col gap-4 items-center w-full">
					<Skeleton className="w-12 h-12 rounded-full" />
					<div className="text-xs font-bold text-[var(--primary)] tracking-wide m-0">
						Memverifikasi Email...
					</div>
					<Skeleton className="h-4 w-3/4 rounded" />
				</div>
			)}

			{status === "success" && (
				<div className="flex flex-col gap-4 items-center w-full">
					<Alert variant="success" className="flex flex-col items-center text-center gap-2 border-emerald-200 bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-200">
						<CheckCircle2 className="w-8 h-8 text-emerald-600 mb-1" />
						<AlertDescription className="text-xs leading-relaxed font-medium">
							{message || "Alamat email Anda telah berhasil diverifikasi. Silakan masuk ke akun Anda."}
						</AlertDescription>
					</Alert>
					{onLoginClick ? (
						<Button
							onClick={onLoginClick}
							variant="roja-primary"
							size="lg"
							className="w-full mt-2 cursor-pointer"
						>
							Masuk Sekarang
						</Button>
					) : (
						<Button
							asChild
							variant="roja-primary"
							size="lg"
							className="w-full mt-2 cursor-pointer"
						>
							<Link to={loginHref as any}>Masuk Sekarang</Link>
						</Button>
					)}
				</div>
			)}

			{status === "error" && (
				<div className="flex flex-col gap-4 items-center w-full">
					<Alert variant="destructive" className="flex flex-col items-center text-center gap-2">
						<XCircle className="w-8 h-8 text-rose-600 mb-1" />
						<AlertDescription className="text-xs leading-relaxed font-medium">
							{message || "Gagal memverifikasi email atau token telah kadaluarsa."}
						</AlertDescription>
					</Alert>
					{onLoginClick ? (
						<Button
							onClick={onLoginClick}
							variant="outline"
							size="lg"
							className="w-full text-xs mt-2 cursor-pointer"
						>
							Kembali ke Halaman Login
						</Button>
					) : (
						<Button
							asChild
							variant="outline"
							size="lg"
							className="w-full text-xs mt-2 cursor-pointer"
						>
							<Link to={loginHref as any}>Kembali ke Halaman Login</Link>
						</Button>
					)}
				</div>
			)}
		</RojaCard>
	)
}

export default VerifyEmailCard
