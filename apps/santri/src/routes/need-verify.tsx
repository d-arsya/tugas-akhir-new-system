import type { JSX } from "react"
import { createFileRoute, useSearch } from "@tanstack/react-router"
import { useState } from "react"
import { santriApi } from "@/lib/api"
import { z } from "zod"
import { NeedVerifyCard, PageLayout, RojaHeader } from "@roja/ui"
import { isDevHijackMode } from "@/lib/dev-hijack"

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
		<PageLayout header={<RojaHeader roleLabel="SANTRI" isAuthenticated={false} />} maxWidth="max-w-md">
			<NeedVerifyCard
				email={email}
				description={`Akun santri Anda belum diverifikasi. Silakan periksa kotak masuk email ${
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
