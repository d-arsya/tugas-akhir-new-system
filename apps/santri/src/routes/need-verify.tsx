import type { JSX } from "react"
import { useNavigate, createFileRoute, useSearch, Link } from "@tanstack/react-router"
import { useState } from "react"
import { santriApi } from "@/lib/api"
import PageLayout from "@/components/page-layout"
import { Mail, ArrowLeft } from "lucide-react"
import { z } from "zod"
import { Button, Alert, AlertDescription, RojaCard } from "@roja/ui"
import { isDevHijackMode } from "@/lib/dev-hijack"

const searchSchema = z.object({
	email: z.string().optional(),
})

const NeedVerifyPage = (): JSX.Element => {
	const navigate = useNavigate()
	const search = useSearch({ from: "/need-verify" }) as { email?: string }
	const email = search?.email || ""
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [infoMsg, setInfoMsg] = useState<string | null>(null)
	const [errorMsg, setErrorMsg] = useState<string | null>(null)

	const handleResend = async (): Promise<void> => {
		setIsLoading(true)
		setInfoMsg(null)
		setErrorMsg(null)
		try {
			if (isDevHijackMode()) {
				setInfoMsg(`Link verifikasi email baru telah berhasil dikirimkan ke ${email || "email Anda"}.`)
				return
			}
			const res = await santriApi.sendEmailVerification()
			setInfoMsg(res.message || `Link verifikasi email baru telah berhasil dikirimkan ke ${email}.`)
		} catch (err: unknown) {
			setErrorMsg(err instanceof Error ? err.message : "Gagal mengirim ulang email verifikasi")
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<PageLayout maxWidth="max-w-md">
			<RojaCard className="p-8 md:p-10 flex flex-col gap-6 items-center text-center">
				<div className="flex flex-col gap-3 items-center">
					<div className="w-14 h-14 rounded-full bg-amber-50 text-[var(--secondary)] flex items-center justify-center border border-amber-200">
						<Mail className="w-7 h-7 text-[var(--secondary)]" />
					</div>
					<div className="text-sm font-bold text-slate-800 dark:text-white tracking-wide m-0">
						Verifikasi Email Diperlukan
					</div>
					<p className="text-xs text-[var(--body-txt-inverse)] leading-relaxed m-0">
						Akun santri Anda belum diverifikasi. Silakan periksa kotak masuk email{" "}
						{email ? <strong className="text-slate-800 dark:text-slate-200">{email}</strong> : "Anda"} dan klik link verifikasi untuk mengaktifkan akun Anda.
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
					<Button
						onClick={handleResend}
						disabled={isLoading}
						variant="roja-primary"
						size="lg"
						className="w-full flex items-center justify-center gap-2"
					>
						<Mail className="w-4 h-4" />
						<span>{isLoading ? "Mengirim..." : "Kirim Ulang Email Verifikasi"}</span>
					</Button>

					<Button
						asChild
						variant="outline"
						className="w-full text-xs font-semibold py-2.5"
					>
						<Link to="/login" className="flex items-center justify-center gap-2">
							<ArrowLeft className="w-4 h-4" />
							<span>Kembali ke Halaman Login</span>
						</Link>
					</Button>
				</div>
			</RojaCard>
		</PageLayout>
	)
}

export const Route = createFileRoute("/need-verify")({
	validateSearch: searchSchema,
	component: NeedVerifyPage,
})

export default NeedVerifyPage
