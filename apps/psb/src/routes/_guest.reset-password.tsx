import type { JSX } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { psbApi } from "@/lib/api"
import { useNavigate, Link, createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import { Button, Input, Label, Alert, AlertDescription, RojaCard } from "@roja/ui"

const schema = z.object({
	password: z.string().min(8, "Password minimal 8 karakter"),
	confirmPassword: z.string().min(8, "Konfirmasi password minimal 8 karakter"),
}).refine((data) => data.password === data.confirmPassword, {
	message: "Konfirmasi password tidak cocok",
	path: ["confirmPassword"],
})

type InputType = z.infer<typeof schema>

const ResetPasswordPage = (): JSX.Element => {
	const navigate = useNavigate()
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [successMsg, setSuccessMsg] = useState<string | null>(null)

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<InputType>({
		resolver: zodResolver(schema),
		defaultValues: { password: "", confirmPassword: "" },
	})

	const onSubmit = async (data: InputType): Promise<void> => {
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
			<RojaCard className="flex flex-col gap-6 p-8 md:p-10">
				<div className="flex flex-col gap-2 items-center text-center">
					<div className="text-xs font-bold text-[var(--primary)] tracking-wide m-0">Atur Ulang Password</div>
					<p className="text-xs text-[var(--body-txt-inverse)] m-0 leading-relaxed">
						Masukkan password baru Anda di bawah ini.
					</p>
				</div>

				{successMsg && (
					<Alert variant="success">
						<AlertDescription className="text-xs">{successMsg}</AlertDescription>
					</Alert>
				)}

				<form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
					<div className="flex flex-col gap-1.5">
						<Input
							id="password"
							type="password"
							className="h-11"
							placeholder="Password Baru"
							{...register("password")}
						/>
						{errors.password && <p className="text-xs text-destructive mt-0.5">{errors.password.message}</p>}
					</div>

					<div className="flex flex-col gap-1.5">
						<Input
							id="confirmPassword"
							type="password"
							className="h-11"
							placeholder="Konfirmasi Password Baru"
							{...register("confirmPassword")}
						/>
						{errors.confirmPassword && (
							<p className="text-xs text-destructive mt-0.5">{errors.confirmPassword.message}</p>
						)}
					</div>

					<Button
						type="submit"
						variant="roja-primary"
						size="lg"
						className="w-full mt-2"
						disabled={isLoading}
					>
						{isLoading ? "Memproses..." : "Simpan Password"}
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

export const Route = createFileRoute("/_guest/reset-password")({
	component: ResetPasswordPage,
})

export default ResetPasswordPage
