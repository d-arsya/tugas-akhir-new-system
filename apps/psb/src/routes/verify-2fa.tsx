import type { JSX } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { psbApi } from "@/lib/api"
import useAuthStore from "@/stores/auth.store"
import { useNavigate, createFileRoute, useSearch } from "@tanstack/react-router"
import { useState } from "react"
import { TwoFactorCard, PageLayout, RojaHeader } from "@roja/ui"

type Verify2faSearch = {
	email?: string
}

const Verify2faPage = (): JSX.Element => {
	const navigate = useNavigate()
	const search = useSearch({ from: "/verify-2fa" })
	const email = search.email || ""
	const login = useAuthStore((s) => s.login)
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [isResending, setIsResending] = useState<boolean>(false)
	const [errorMsg, setErrorMsg] = useState<string | null>(null)
	const [infoMsg, setInfoMsg] = useState<string | null>(null)

	const onSubmit = async (code: string): Promise<void> => {
		if (!email) {
			navigate({ to: "/login" })
			return
		}
		setIsLoading(true)
		setErrorMsg(null)
		setInfoMsg(null)
		try {
			const res = await psbApi.verify2fa({ email, code })
			login(res.user)
			navigate({ to: "/dashboard" })
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
			const res = await psbApi.resend2fa(email)
			setInfoMsg(res.message || "Kode verifikasi 2FA telah dikirim ulang ke email Anda.")
		} catch (err: unknown) {
			setErrorMsg(err instanceof Error ? err.message : "Gagal mengirim ulang kode")
		} finally {
			setIsResending(false)
		}
	}

	return (
		<PageLayout header={<RojaHeader roleLabel="PENDAFTAR" isAuthenticated={false} />} maxWidth="max-w-md" variant="center">
			<TwoFactorCard
				email={email}
				title="Verifikasi Dua Faktor (2FA)"
				description={
					<>
						Masukkan 6 digit kode verifikasi yang telah dikirim ke email{" "}
						<strong className="text-slate-700">{email}</strong>.
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
	validateSearch: (search: Record<string, unknown>): Verify2faSearch => ({
		email: typeof search.email === "string" ? search.email : "",
	}),
	component: Verify2faPage,
})

export default Verify2faPage
