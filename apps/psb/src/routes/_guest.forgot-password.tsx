import type { JSX } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { psbApi } from "@/lib/api"
import { useNavigate, Link, createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import { Button, Input, AuthCard } from "@roja/ui"

const schema = z.object({
	email: z.string().email("Email tidak valid"),
})

type InputType = z.infer<typeof schema>

const ForgotPasswordPage = (): JSX.Element => {
	const navigate = useNavigate()
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [successMsg, setSuccessMsg] = useState<string | null>(null)
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
			await psbApi.forgotPassword(data.email)
			setSuccessMsg("Instruksi reset password telah dikirim ke email Anda.")
			setTimeout(() => {
				navigate({ to: "/login" })
			}, 3000)
		} catch (err: unknown) {
			setErrorMsg(err instanceof Error ? err.message : "Terjadi kesalahan")
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<AuthCard
			title="Lupa Password"
			description="Masukkan email terdaftar Anda untuk menerima link reset password."
			successMsg={successMsg}
			errorMsg={errorMsg}
			footer={
				<Link to="/login" className="text-[var(--secondary)] hover:underline font-bold">
					Kembali ke Login
				</Link>
			}
		>
			<form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
				<div className="flex flex-col gap-1.5">
					<Input
						id="email"
						type="email"
						className="h-11"
						placeholder="Alamat Email"
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
		</AuthCard>
	)
}

export const Route = createFileRoute("/_guest/forgot-password")({
	component: ForgotPasswordPage,
})

export default ForgotPasswordPage
