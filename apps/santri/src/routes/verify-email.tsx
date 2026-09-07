import type { JSX } from "react"
import { useNavigate, createFileRoute, useSearch } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { santriApi } from "@/lib/api"
import PageLayout from "@/components/page-layout"
import { z } from "zod"
import { Button, Alert, AlertDescription, RojaCard, Skeleton } from "@roja/ui"
import { CheckCircle2, XCircle } from "lucide-react"

const searchSchema = z.object({
	id: z.coerce.number().optional(),
	hash: z.string().optional(),
	token: z.string().optional(),
})

const VerifyEmailPage = (): JSX.Element => {
	const navigate = useNavigate()
	const search = useSearch({ from: "/verify-email" }) as { id?: number; hash?: string; token?: string }
	const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying")
	const [message, setMessage] = useState<string>("")

	useEffect(() => {
		const hash = search?.hash || search?.token
		const id = search?.id || 1

		if (!hash) {
			setStatus("error")
			setMessage("Token verifikasi email tidak ditemukan.")
			return
		}

		santriApi
			.verifyEmail(id, hash)
			.then((res) => {
				setStatus("success")
				setMessage(res.message || "Alamat email Anda telah berhasil diverifikasi. Silakan masuk ke Member Area.")
			})
			.catch((err: unknown) => {
				setStatus("error")
				setMessage(err instanceof Error ? err.message : "Gagal memverifikasi email.")
			})
	}, [search?.hash, search?.token, search?.id])

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

export const Route = createFileRoute("/verify-email")({
	validateSearch: searchSchema,
	component: VerifyEmailPage,
})

export default VerifyEmailPage
