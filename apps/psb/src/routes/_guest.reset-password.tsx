import type { JSX } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { psbApi } from "@/lib/api"
import { useNavigate, Link, createFileRoute, useSearch } from "@tanstack/react-router"
import { useState } from "react"
import { Button, Input, AuthCard } from "@roja/ui"

const searchSchema = z.object({
	token: z.string().optional(),
})

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
	const search = useSearch({ from: "/_guest/reset-password" }) as { token?: string, email?: string }
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [successMsg, setSuccessMsg] = useState<string | null>(null)
	const [errorMsg, setErrorMsg] = useState<string | null>(null)

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<InputType>({
		resolver: zodResolver(schema),
		defaultValues: { password: "", confirmPassword: "" },
	})

	const onSubmit = async (data: InputType): Promise<void> => {
		const token = search?.token
		const email = search?.email
		if (!token) {
			setErrorMsg("Token reset password tidak ditemukan.")
			return
		}
		if (!email) {
			setErrorMsg("Email tidak ditemukan.")
			return
		}

		setIsLoading(true)
		setErrorMsg(null)
		try {
			await psbApi.resetPassword({ token, password: data.password, passwordConfirmation: data.confirmPassword, email })
			setSuccessMsg("Password Anda berhasil diperbarui.")
			setTimeout(() => {
				navigate({ to: "/login" })
			}, 2000)
		} catch (err: unknown) {
			setErrorMsg(err instanceof Error ? err.message : "Terjadi kesalahan")
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<AuthCard
			title="Atur Ulang Password"
			description="Masukkan password baru Anda di bawah ini."
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
		</AuthCard>
	)
}

export const Route = createFileRoute("/_guest/reset-password")({
	validateSearch: searchSchema,
	component: ResetPasswordPage,
})

export default ResetPasswordPage
