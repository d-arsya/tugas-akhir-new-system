import type { JSX } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { santriApi } from "@/lib/api"
import useAuthStore from "@/stores/auth.store"
import { useNavigate, createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import { TwoFactorCard, PageLayout, RojaHeader } from "@roja/ui"
import { isDevHijackMode, mockSantriAuth } from "@/lib/dev-hijack"

const Verify2faPage = (): JSX.Element => {
	const navigate = useNavigate()
	const login = useAuthStore((s) => s.login)
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [isResending, setIsResending] = useState<boolean>(false)
	const [errorMsg, setErrorMsg] = useState<string | null>(null)
	const [infoMsg, setInfoMsg] = useState<string | null>(null)

	const email = localStorage.getItem("roja-2fa-email") || ""
	const studentIdStr = localStorage.getItem("roja-2fa-student-id") || "1"
	const studentId = Number.parseInt(studentIdStr, 10) || 1

	const onSubmit = async (code: string): Promise<void> => {
		if (!email) {
			navigate({ to: "/login" })
			return
		}
		setIsLoading(true)
		setErrorMsg(null)
		setInfoMsg(null)
		try {
			if (isDevHijackMode()) {
				await new Promise((res) => setTimeout(res, 500))
				const mock = mockSantriAuth.verify2fa(code)
				if (mock.user) {
					login(mock.user as any)
					localStorage.removeItem("roja-2fa-email")
					localStorage.removeItem("roja-2fa-student-id")
					navigate({ to: "/dashboard" })
					return
				}
			}

			const res = await santriApi.verify2fa({ code }, studentId)
			if (!res.requires2fa && res.user) {
				login(res.user as any)
				localStorage.removeItem("roja-2fa-email")
				localStorage.removeItem("roja-2fa-student-id")
				navigate({ to: "/dashboard" })
			}
		} catch (err: unknown) {
			setErrorMsg(err instanceof Error ? err.message : "Kode verifikasi salah")
		} finally {
			setIsLoading(false)
		}
	}

	const handleResend = async (): Promise<void> => {
		if (!email) return
		setIsResending(true)
		setErrorMsg(null)
		setInfoMsg(null)
		try {
			if (isDevHijackMode()) {
				setInfoMsg("Kode verifikasi 2FA telah dikirim ulang ke email Anda.")
				return
			}

			const res = await santriApi.resend2fa(studentId)
			setInfoMsg(res.message || "Kode verifikasi 2FA telah dikirim ulang ke email Anda.")
		} catch (err: unknown) {
			setErrorMsg(err instanceof Error ? err.message : "Gagal mengirim ulang kode")
		} finally {
			setIsResending(false)
		}
	}

	return (
		<PageLayout header={<RojaHeader roleLabel="SANTRI" isAuthenticated={false} />} maxWidth="max-w-md" variant="center">
			<TwoFactorCard
				email={email}
				title="Verifikasi Dua Faktor (2FA)"
				description={
					<>
						Masukkan 6 digit kode verifikasi yang telah dikirim ke email{" "}
						<strong className="text-slate-700 dark:text-slate-200">{email}</strong>.
					</>
				}
				errorMsg={errorMsg}
				infoMsg={infoMsg}
				isLoading={isLoading}
				isResending={isResending}
				onSubmit={onSubmit}
				onResend={handleResend}
			/>
		</PageLayout>
	)
}

export const Route = createFileRoute("/verify-2fa")({
	component: Verify2faPage,
})

export default Verify2faPage
