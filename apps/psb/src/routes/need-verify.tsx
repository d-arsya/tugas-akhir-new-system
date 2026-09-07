import type { JSX } from "react"
import { createFileRoute, useSearch } from "@tanstack/react-router"
import { useState } from "react"
import { psbApi } from "@/lib/api"
import PageLayout from "@/components/page-layout"
import { z } from "zod"
import { NeedVerifyCard } from "@roja/ui"

const searchSchema = z.object({
	email: z.string().optional(),
})

const NeedVerifyPage = (): JSX.Element => {
	const search = useSearch({ from: "/need-verify" }) as { email?: string }
	const email = search?.email || ""
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [infoMsg, setInfoMsg] = useState<string | null>(null)
	const [errorMsg, setErrorMsg] = useState<string | null>(null)

	const handleResend = async (): Promise<void> => {
		if (!email) {
			setErrorMsg("Alamat email tidak ditemukan. Silakan masuk kembali.")
			return
		}
		setIsLoading(true)
		setInfoMsg(null)
		setErrorMsg(null)
		try {
			const res = await psbApi.resendVerification(email)
			setInfoMsg(res.message || `Link verifikasi email baru telah berhasil dikirimkan ke ${email}.`)
		} catch (err: unknown) {
			setErrorMsg(err instanceof Error ? err.message : "Gagal mengirim ulang email verifikasi")
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<PageLayout maxWidth="max-w-md">
			<NeedVerifyCard
				email={email}
				description={`Akun pendaftaran Anda belum diverifikasi. Silakan periksa kotak masuk email ${
					email ? "" : "Anda"
				} dan klik link verifikasi untuk mengaktifkan akun Anda.`}
				infoMsg={infoMsg}
				errorMsg={errorMsg}
				isLoading={isLoading}
				onResend={handleResend}
				loginHref="/login"
			/>
		</PageLayout>
	)
}

export const Route = createFileRoute("/need-verify")({
	validateSearch: searchSchema,
	component: NeedVerifyPage,
})

export default NeedVerifyPage
