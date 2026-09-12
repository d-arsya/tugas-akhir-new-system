import type { JSX } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { santriApi } from "@/lib/api"
import { useNavigate, Link, createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import { Button, Input, AuthCard, PageLayout, RojaHeader } from "@roja/ui"
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
		<PageLayout header={<RojaHeader roleLabel="SANTRI" isAuthenticated={false} />} maxWidth="max-w-md" variant="center">
			<AuthCard
				title="Tambahkan Email"
				description="Jika suatu saat kamu ingin memulihkan akun, kami memerlukan alamat email kamu."
				errorMsg={errorMsg}
				footer={
					<Link to="/dashboard" className="text-[var(--grey)] hover:underline">
						Skip, lain kali saja
					</Link>
				}
			>
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
			</AuthCard>
		</PageLayout>
	)
}

export const Route = createFileRoute("/check-email")({
	component: CheckEmailPage,
})

export default CheckEmailPage
