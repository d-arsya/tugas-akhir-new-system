import { type JSX, useState } from "react"
import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router"
import { toast, TwoFactorCard, PageLayout, RojaHeader } from "@roja/ui"

import { hijackMerchantApi } from "@/lib/dev-hijack"
import { createMerchantApi } from "@roja/api-client"
import useAuthStore from "@/stores/authStore"

const merchantApi = hijackMerchantApi(createMerchantApi())

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
			const merchantIdNum = Number(search.merchantId) || 301
			const res = await merchantApi.verify2fa({ code }, merchantIdNum)
			login(res.user)
			toast.success("Verifikasi Berhasil", { description: "Selamat datang kembali!" })
			navigate({ to: "/e-wallet" })
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : "Kode verifikasi 2FA salah"
			toast.error("Verifikasi Gagal", { description: message })
		} finally {
			setIsLoading(false)
		}
	}

	const handleResend = async () => {
		setIsResending(true)
		try {
			const merchantIdNum = Number(search.merchantId) || 301
			const res = await merchantApi.resend2fa(merchantIdNum)
			toast.success("Kode Dikirim Ulang", { description: res.message })
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : "Gagal mengirim ulang kode"
			toast.error("Gagal Mengirim", { description: message })
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
