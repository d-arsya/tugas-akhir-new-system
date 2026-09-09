import type { JSX } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { santriApi } from "@/lib/api"
import { useNavigate, Link, createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import PageLayout from "@/components/page-layout"
import { Button, Input, Label, Alert, AlertDescription, RojaCard } from "@roja/ui"
import { isDevHijackMode } from "@/lib/dev-hijack"

const schema = z.object({
	email: z.string().email("Format email tidak valid"),
})

type InputType = z.infer<typeof schema>

const CheckEmailPage = (): JSX.Element => {
	const navigate = useNavigate()
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [errorMsg, setErrorMsg] = useState<string | null>(null)

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<InputType>({
		resolver: zodResolver(schema),
		defaultValues: { email: "" },
	})

	const onSubmit = async (data: InputType): Promise<void> => {
		setIsLoading(true)
		setErrorMsg(null)
		try {
			if (isDevHijackMode()) {
				await new Promise((res) => setTimeout(res, 500))
				navigate({ to: "/dashboard" })
				return
			}

			await santriApi.updateEmail(data)
			navigate({ to: "/dashboard" })
		} catch (err: unknown) {
			setErrorMsg(err instanceof Error ? err.message : "Gagal memperbarui email")
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<PageLayout maxWidth="max-w-md" variant="center">
			<RojaCard className="flex flex-col gap-6 p-8 md:p-10 w-full">
				<div className="flex flex-col gap-2 items-center text-center">
					<div className="text-xs font-bold text-[var(--primary)] tracking-wide m-0">Tambahkan Email</div>
					<p className="text-xs text-[var(--body-txt-inverse)] m-0 leading-relaxed">
						Jika suatu saat kamu ingin memulihkan akun, kami memerlukan alamat email kamu.
					</p>
				</div>

				{errorMsg && (
					<Alert variant="destructive">
						<AlertDescription className="text-xs">{errorMsg}</AlertDescription>
					</Alert>
				)}

				<form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
					<div className="flex flex-col gap-1.5">
					<Input
						id="email"
						type="email"
						className="h-11"
						placeholder="Email"
						{...register("email")}
					/>
						{errors.email && <p className="text-xs text-destructive mt-0.5">{errors.email.message}</p>}
					</div>

					<Button
						type="submit"
						variant="roja-primary"
						size="lg"
						className="w-full mt-2"
						disabled={isLoading}
					>
						{isLoading ? "Memproses..." : "Selanjutnya"}
					</Button>
				</form>

				<div className="text-center text-xs border-t border-[var(--bg-form-border)] pt-4">
					<Link to="/dashboard" className="text-[var(--grey)] hover:underline">
						Skip, lain kali saja
					</Link>
				</div>
			</RojaCard>
		</PageLayout>
	)
}

export const Route = createFileRoute("/check-email")({
	component: CheckEmailPage,
})

export default CheckEmailPage
