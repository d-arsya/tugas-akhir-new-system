import type { JSX } from "react"
import { useNavigate, createFileRoute, useSearch } from "@tanstack/react-router"
import { useEffect, useState, useRef } from "react"
import { psbApi } from "@/lib/api"
import PageLayout from "@/components/page-layout"
import { z } from "zod"
import { VerifyEmailCard } from "@roja/ui"

const searchSchema = z.object({
	token: z.string().optional(),
	email: z.string().optional(),
})

const VerifyEmailPage = (): JSX.Element => {
	const navigate = useNavigate()
	const search = useSearch({ from: "/verify-email" }) as { token?: string; email?: string }
	const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying")
	const [message, setMessage] = useState<string>("")
	const hasCalledRef = useRef(false)

	useEffect(() => {
		const token = search?.token
		const email = search?.email
		if (!token) {
			setStatus("error")
			setMessage("Token verifikasi email tidak ditemukan.")
			return
		}

		if (hasCalledRef.current) return
		hasCalledRef.current = true

		psbApi
			.verifyEmail(token, email)
			.then((res: { message?: string }) => {
				setStatus("success")
				setMessage(res.message || "Alamat email Anda telah berhasil diverifikasi. Silakan masuk ke Member Area.")
			})
			.catch((err: unknown) => {
				setStatus("error")
				setMessage(err instanceof Error ? err.message : "Gagal memverifikasi email.")
			})
	}, [search?.token, search?.email])

	return (
		<PageLayout maxWidth="max-w-md" variant="center">
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
