import type { JSX } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { psbApi } from "@/lib/api"
import { useNavigate, Link, createFileRoute } from "@tanstack/react-router"
import { useState } from "react"

const schema = z.object({
	email: z.string().email("Email tidak valid"),
})

type Input = z.infer<typeof schema>

const ForgotPasswordPage = (): JSX.Element => {
	const navigate = useNavigate()
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [successMsg, setSuccessMsg] = useState<string | null>(null)

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<Input>({
		resolver: zodResolver(schema),
		defaultValues: { email: "" },
	})

	const onSubmit = async (data: Input): Promise<void> => {
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
			<div className="roja_card_wizard flex flex-col gap-6 p-8 md:p-10 relative overflow-hidden">
				{/* Corner gradient glows inside card */}
				<div className="absolute -top-12 -left-12 w-32 h-32 bg-[var(--primary)] rounded-full blur-[40px] opacity-[0.1] pointer-events-none z-0" />
				<div className="absolute -top-12 -right-12 w-32 h-32 bg-[var(--secondary)] rounded-full blur-[40px] opacity-[0.1] pointer-events-none z-0" />

				<div className="relative z-10 flex flex-col gap-2 items-center text-center">
					<div className="text-xs font-bold text-[var(--primary)] tracking-wide m-0">Lupa Password</div>
					<p className="text-xs text-[var(--body-txt-inverse)] m-0">
						Masukkan email terdaftar Anda untuk menerima link reset password.
					</p>
				</div>

				{successMsg && (
					<div className="relative z-10 p-3 bg-green-50 text-[var(--success)] text-xs border border-green-200 rounded">
						{successMsg}
					</div>
				)}

				<form onSubmit={handleSubmit(onSubmit)} className="relative z-10 flex flex-col gap-4">
					<div className="form-group">
						<label className="control-label">Alamat Email</label>
						<input
							type="email"
							className={`form-control ${errors.email ? "is-invalid" : ""}`}
							placeholder="nama@email.com"
							{...register("email")}
						/>
						{errors.email && <span className="invalid-feedback">{errors.email.message}</span>}
					</div>

					<button
						type="submit"
						className="roja_btn roja_btn-primary roja_btn-lg w-full text-white bg-[var(--primary)] font-semibold"
						disabled={isLoading}
					>
						{isLoading ? "Memproses..." : "Kirim Link Reset"}
					</button>
				</form>

				<div className="relative z-10 text-center text-xs border-t border-[var(--bg-form-border)] pt-4">
					<Link to="/login" className="text-[var(--secondary)] hover:underline font-bold">
						Kembali ke Login
					</Link>
				</div>
			</div>
		</div>
	)
}

export const Route = createFileRoute("/_guest/forgot-password")({
	component: ForgotPasswordPage,
})

export default ForgotPasswordPage
