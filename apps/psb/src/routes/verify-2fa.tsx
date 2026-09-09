import type { JSX } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { psbApi } from "@/lib/api"
import useAuthStore from "@/stores/auth.store"
import { useNavigate, createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import PageLayout from "@/components/page-layout"
import { Button, Input, Label, Alert, AlertDescription, RojaCard } from "@roja/ui"

const schema = z.object({
	code: z.string().length(6, "Kode harus 6 digit angka"),
})

type InputType = z.infer<typeof schema>

const Verify2faPage = (): JSX.Element => {
	const navigate = useNavigate()
	const login = useAuthStore((s) => s.login)
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [isResending, setIsResending] = useState<boolean>(false)
	const [errorMsg, setErrorMsg] = useState<string | null>(null)
	const [infoMsg, setInfoMsg] = useState<string | null>(null)

	const email = localStorage.getItem("roja-2fa-email") || ""

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<InputType>({
		resolver: zodResolver(schema),
		defaultValues: { code: "" },
	})

	const onSubmit = async (data: InputType): Promise<void> => {
		if (!email) {
			navigate({ to: "/login" })
			return
		}
		setIsLoading(true)
		setErrorMsg(null)
		setInfoMsg(null)
		try {
			const res = await psbApi.verify2fa({ email, code: data.code })
			login(res.user)
			localStorage.removeItem("roja-2fa-email")
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
		<PageLayout maxWidth="max-w-md" variant="center">
			<RojaCard className="p-8 md:p-10 flex flex-col gap-6">
				<div className="flex flex-col gap-2 items-center text-center">
					<div className="text-xs font-bold text-[var(--primary)] tracking-wide m-0">
						Verifikasi Dua Faktor (2FA)
					</div>
					<p className="text-xs text-[var(--body-txt-inverse)] m-0 leading-relaxed">
						Masukkan 6 digit kode verifikasi yang telah dikirim ke email{" "}
						<strong className="text-slate-700">{email}</strong>.
					</p>
				</div>

				{errorMsg && (
					<Alert variant="destructive">
						<AlertDescription className="text-xs">{errorMsg}</AlertDescription>
					</Alert>
				)}

				{infoMsg && (
					<Alert variant="success">
						<AlertDescription className="text-xs">{infoMsg}</AlertDescription>
					</Alert>
				)}

				<form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
					<div className="flex flex-col gap-1.5 items-center">
						<Input
							id="code"
							type="text"
							maxLength={6}
							className="h-12 text-center tracking-widest text-lg font-bold w-full"
							placeholder="Kode Verifikasi (6 angka)"
							{...register("code")}
						/>
						{errors.code && <p className="text-xs text-destructive text-center mt-1">{errors.code.message}</p>}
					</div>

					<Button
						type="submit"
						variant="roja-primary"
						size="lg"
						className="w-full mt-2"
						disabled={isLoading}
					>
						{isLoading ? "Memproses..." : "Verifikasi"}
					</Button>
				</form>

				<div className="text-center text-xs text-[var(--grey)] border-t border-[var(--bg-form-border)] pt-4 flex justify-between items-center">
					<span>Tidak menerima kode?</span>
					<Button
						type="button"
						variant="link"
						onClick={handleResend}
						disabled={isResending}
						className="text-[var(--secondary)] p-0 h-auto font-semibold text-xs"
					>
						{isResending ? "Mengirim..." : "Kirim Ulang Kode"}
					</Button>
				</div>
			</RojaCard>
		</PageLayout>
	)
}

export const Route = createFileRoute("/verify-2fa")({
	component: Verify2faPage,
})

export default Verify2faPage
