import type { JSX } from "react"
import { useNavigate, createFileRoute, useSearch } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { santriApi } from "@/lib/api"
import { z } from "zod"
import { VerifyEmailCard, PageLayout, RojaHeader } from "@roja/ui"

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
		<PageLayout header={<RojaHeader roleLabel="SANTRI" isAuthenticated={false} />} maxWidth="max-w-md" variant="center">
			<VerifyEmailCard
				status={status}
				message={message}
				onLoginClick={() => navigate({ to: "/login" })}
			/>
		</PageLayout>
	)
}

export const Route = createFileRoute("/verify-email")({
	validateSearch: searchSchema,
	component: VerifyEmailPage,
})

export default VerifyEmailPage
