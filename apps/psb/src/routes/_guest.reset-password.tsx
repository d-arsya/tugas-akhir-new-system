import type { JSX } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { psbApi } from "@/lib/api"
import { useNavigate, Link, createFileRoute } from "@tanstack/react-router"
import { useState } from "react"

const schema = z.object({
	password: z.string().min(8, "Password minimal 8 karakter"),
	confirmPassword: z.string().min(8, "Konfirmasi password minimal 8 karakter"),
}).refine((data) => data.password === data.confirmPassword, {
	message: "Konfirmasi password tidak cocok",
	path: ["confirmPassword"],
})

type Input = z.infer<typeof schema>

const ResetPasswordPage = (): JSX.Element => {
	const navigate = useNavigate()
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [successMsg, setSuccessMsg] = useState<string | null>(null)

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<Input>({
		resolver: zodResolver(schema),
		defaultValues: { password: "", confirmPassword: "" },
	})

	const onSubmit = async (data: Input): Promise<void> => {
		setIsLoading(true)
		try {
			await psbApi.resetPassword({ token: "mock_token", password: data.password })
			setSuccessMsg("Password Anda berhasil diperbarui.")
			setTimeout(() => {
				navigate({ to: "/login" })
			}, 2000)
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
					<div className="text-xs font-bold text-[var(--primary)] tracking-wide m-0">Atur Ulang Password</div>
					<p className="text-xs text-[var(--body-txt-inverse)] m-0">
						Masukkan password baru Anda di bawah ini.
					</p>
				</div>

				{successMsg && (
					<div className="relative z-10 p-3 bg-green-50 text-[var(--success)] text-xs border border-green-200 rounded">
						{successMsg}
					</div>
				)}

				<form onSubmit={handleSubmit(onSubmit)} className="relative z-10 flex flex-col gap-4">
					<div className="form-group">
						<label className="control-label">Password Baru</label>
						<input
							type="password"
							className={`form-control ${errors.password ? "is-invalid" : ""}`}
							placeholder="Minimal 8 karakter"
							{...register("password")}
						/>
						{errors.password && <span className="invalid-feedback">{errors.password.message}</span>}
					</div>

					<div className="form-group">
						<label className="control-label">Konfirmasi Password Baru</label>
						<input
							type="password"
							className={`form-control ${errors.confirmPassword ? "is-invalid" : ""}`}
							placeholder="Masukkan ulang password"
							{...register("confirmPassword")}
						/>
						{errors.confirmPassword && (
							<span className="invalid-feedback">{errors.confirmPassword.message}</span>
						)}
					</div>

					<button
						type="submit"
						className="roja_btn roja_btn-primary roja_btn-lg w-full text-white bg-[var(--primary)] font-semibold"
						disabled={isLoading}
					>
						{isLoading ? "Memproses..." : "Simpan Password"}
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

export const Route = createFileRoute("/_guest/reset-password")({
	component: ResetPasswordPage,
})

export default ResetPasswordPage
