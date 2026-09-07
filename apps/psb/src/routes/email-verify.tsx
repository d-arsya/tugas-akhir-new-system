import type { JSX } from "react"
import { useNavigate, createFileRoute, useSearch } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { psbApi } from "@/lib/api"
import PageLayout from "@/components/page-layout"
import { z } from "zod"
import { Button, Alert, AlertDescription, RojaCard, Skeleton } from "@roja/ui"
import { CheckCircle2, XCircle } from "lucide-react"

const searchSchema = z.object({
	token: z.string().optional(),
	email: z.string().optional(),
})

const EmailVerifyPage = (): JSX.Element => {
	const navigate = useNavigate()
	const search = useSearch({ from: "/email-verify" }) as { token?: string; email?: string }
	const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying")
	const [message, setMessage] = useState<string>("")

	useEffect(() => {
		const token = search?.token
		if (!token) {
			setStatus("error")
			setMessage("Token verifikasi email tidak ditemukan.")
			return
		}

		psbApi
			.verifyEmail(token)
			.then((res: { message?: string }) => {
				setStatus("success")
				setMessage(res.message || "Alamat email Anda telah berhasil diverifikasi. Silakan masuk ke Member Area.")
			})
			.catch((err: unknown) => {
				setStatus("error")
				setMessage(err instanceof Error ? err.message : "Gagal memverifikasi email.")
			})
	}, [search?.token])

	return (
		<PageLayout maxWidth="max-w-md">
			<RojaCard className="p-8 md:p-10 flex flex-col gap-6 items-center text-center">
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
						<Alert variant="success" className="flex flex-col items-center text-center gap-2 border-emerald-200">
							<CheckCircle2 className="w-8 h-8 text-emerald-600 mb-1" />
							<AlertDescription className="text-xs leading-relaxed font-medium">
								{message}
							</AlertDescription>
						</Alert>
						<Button
							onClick={() => navigate({ to: "/login" })}
							variant="roja-primary"
							size="lg"
							className="w-full mt-2"
						>
							Masuk Sekarang
						</Button>
					</div>
				)}

				{status === "error" && (
					<div className="flex flex-col gap-4 items-center w-full">
						<Alert variant="destructive" className="flex flex-col items-center text-center gap-2">
							<XCircle className="w-8 h-8 text-rose-600 mb-1" />
							<AlertDescription className="text-xs leading-relaxed font-medium">
								{message}
							</AlertDescription>
						</Alert>
						<Button
							onClick={() => navigate({ to: "/login" })}
							variant="outline"
							size="lg"
							className="w-full text-xs mt-2"
						>
							Kembali ke Halaman Login
						</Button>
					</div>
				)}
			</RojaCard>
		</PageLayout>
	)
}

export const Route = createFileRoute("/email-verify")({
	validateSearch: searchSchema,
	component: EmailVerifyPage,
})

export default EmailVerifyPage
