import type { JSX } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { psbApi } from "@/lib/api"
import { useNavigate, Link, createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import { Button, Input, Label, Alert, AlertDescription, RojaCard } from "@roja/ui"

const schema = z.object({
	email: z.string().email("Email tidak valid"),
})

type InputType = z.infer<typeof schema>

const ForgotPasswordPage = (): JSX.Element => {
	const navigate = useNavigate()
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [successMsg, setSuccessMsg] = useState<string | null>(null)

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
		try {
			await psbApi.forgotPassword(data.email)
			setSuccessMsg("Instruksi reset password telah dikirim ke email Anda.")
			setTimeout(() => {
				navigate({ to: "/login" })
			}, 3000)
		} catch (err: unknown) {
			alert(err instanceof Error ? err.message : "Terjadi kesalahan")
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div className="max-w-md mx-auto my-8">
			<RojaCard className="flex flex-col gap-6 p-8 md:p-10">
				<div className="flex flex-col gap-2 items-center text-center">
					<div className="text-xs font-bold text-[var(--primary)] tracking-wide m-0">Lupa Password</div>
					<p className="text-xs text-[var(--body-txt-inverse)] m-0 leading-relaxed">
						Masukkan email terdaftar Anda untuk menerima link reset password.
					</p>
				</div>

				{successMsg && (
					<Alert variant="success">
						<AlertDescription className="text-xs">{successMsg}</AlertDescription>
					</Alert>
				)}

				<form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
					<div className="flex flex-col gap-1.5">
						<Label htmlFor="email">Alamat Email</Label>
						<Input
							id="email"
							type="email"
							className="h-11"
							placeholder="nama@email.com"
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
						{isLoading ? "Memproses..." : "Kirim Link Reset"}
					</Button>
				</form>

				<div className="text-center text-xs border-t border-[var(--bg-form-border)] pt-4">
					<Link to="/login" className="text-[var(--secondary)] hover:underline font-bold">
						Kembali ke Login
					</Link>
				</div>
			</RojaCard>
		</div>
	)
}

export const Route = createFileRoute("/_guest/forgot-password")({
	component: ForgotPasswordPage,
})

export default ForgotPasswordPage
