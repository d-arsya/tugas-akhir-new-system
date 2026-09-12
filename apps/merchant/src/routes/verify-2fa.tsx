import { type JSX, useState } from "react"
import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router"
import { TwoFactorCard, PageLayout, RojaHeader } from "@roja/ui"
import { toast } from "sonner"

import { merchantApi } from "@/lib/api"
import useAuthStore from "@/stores/auth.store"

type Verify2faSearch = {

	merchantId?: string
}

export const Route = createFileRoute("/verify-2fa")({
	validateSearch: (search: Record<string, unknown>): Verify2faSearch => ({
		merchantId: typeof search.merchantId === "string" ? search.merchantId : undefined,
	}),
	component: Verify2faRouteComponent,
})

function Verify2faRouteComponent(): JSX.Element {
	const navigate = useNavigate()
	const search = useSearch({ from: "/verify-2fa" })
	const { login } = useAuthStore()
	const [isLoading, setIsLoading] = useState(false)
	const [isResending, setIsResending] = useState(false)

	const onSubmit = async (code: string) => {
		setIsLoading(true)
		try {
			const merchantIdNum = Number(search.merchantId) || 0
			const res = await merchantApi.verify2fa({ code }, merchantIdNum)
			if (!res.requires2fa && res.user) {
				login(res.user)
				toast.success("Verifikasi 2FA Berhasil", { description: "Selamat datang kembali!" })
				navigate({ to: "/e-wallet" })
			}

		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : "Kode verifikasi 2FA salah"
			toast.error("Verifikasi 2FA Gagal", { description: message })
		} finally {
			setIsLoading(false)
		}
	}

	const handleResend = async () => {
		setIsResending(true)
		try {
			const merchantIdNum = Number(search.merchantId) || 301
			const res = await merchantApi.resend2fa(merchantIdNum)
			toast.success("Kode 2FA Berhasil Dikirim Ulang", { description: res.message || "Cek kotak masuk email Anda." })
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : "Gagal mengirim ulang kode"
			toast.error("Gagal Mengirim Ulang Kode 2FA", { description: message })
		} finally {
			setIsResending(false)
		}
	}

	return (
		<PageLayout header={<RojaHeader roleLabel="MERCHANT" isAuthenticated={false} />} maxWidth="max-w-md" variant="center">
			<TwoFactorCard
				title="Verifikasi 2FA"
				isLoading={isLoading}
				isResending={isResending}
				onSubmit={onSubmit}
				onResend={handleResend}
			/>
		</PageLayout>
	)
}

export default Route
