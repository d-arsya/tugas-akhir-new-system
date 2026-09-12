import type { JSX } from "react"
import { useForm } from "react-hook-form"
import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { psbApi } from "@/lib/api"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { toast } from "sonner"
import {
	Button,
	Input,
	Label,
	Switch,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	Skeleton,
} from "@roja/ui"

const profileSchema = z.object({
	name: z.string().min(2, "Nama minimal 2 karakter"),
})

const passwordSchema = z.object({
	password: z.string().min(8, "Password minimal 8 karakter"),
	confirmPassword: z.string().min(8, "Konfirmasi password minimal 8 karakter"),
}).refine((data) => data.password === data.confirmPassword, {
	message: "Konfirmasi password tidak cocok",
	path: ["confirmPassword"],
})

type ProfileInput = z.infer<typeof profileSchema>
type PasswordInput = z.infer<typeof passwordSchema>

const SettingsPage = (): JSX.Element => {
	const queryClient = useQueryClient()
	const [status2fa, setStatus2fa] = useState<boolean>(false)

	const { data: profile, isLoading } = useQuery({
		queryKey: ["profile"],
		queryFn: async () => {
			const res = await psbApi.getProfile()
			setStatus2fa(res.enabled2fa)
			return res
		},
	})

	const updateProfileMutation = useMutation({
		mutationFn: (data: ProfileInput) => psbApi.updateProfile(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["profile"] })
			toast.success("Nama profil berhasil diperbarui")
		},
		onError: (err: unknown) => {
			const msg = err instanceof Error ? err.message : "Gagal memperbarui profil"
			toast.error("Gagal Memperbarui Profil", { description: msg })
		},
	})

	const updatePasswordMutation = useMutation({
		mutationFn: (data: PasswordInput) => psbApi.updateAccount({ password: data.password }),
		onSuccess: () => {
			toast.success("Password berhasil diperbarui")
			resetPasswordForm()
		},
		onError: (err: unknown) => {
			const msg = err instanceof Error ? err.message : "Gagal memperbarui password"
			toast.error("Gagal Memperbarui Password", { description: msg })
		},
	})

	const toggle2faMutation = useMutation({
		mutationFn: (enabled: boolean) => psbApi.toggle2fa(enabled),
		onSuccess: (_, enabled) => {
			setStatus2fa(enabled)
			toast.success(`Dua Faktor Otentikasi (2FA) berhasil ${enabled ? "diaktifkan" : "dinonaktifkan"}`)
		},
		onError: (err: unknown) => {
			const msg = err instanceof Error ? err.message : "Gagal mengubah pengaturan 2FA"
			toast.error("Gagal Mengubah Pengaturan 2FA", { description: msg })
		},
	})

	const {
		register: registerProfile,
		handleSubmit: handleProfileSubmit,
		formState: { errors: profileErrors },
	} = useForm<ProfileInput>({
		resolver: zodResolver(profileSchema),
		values: { name: profile?.name || "" },
	})

	const {
		register: registerPassword,
		handleSubmit: handlePasswordSubmit,
		reset: resetPasswordForm,
		formState: { errors: passwordErrors },
	} = useForm<PasswordInput>({
		resolver: zodResolver(passwordSchema),
		defaultValues: { password: "", confirmPassword: "" },
	})

	if (isLoading) {
		return (
			<div className="flex flex-col gap-6">
				<Skeleton className="h-10 w-48 rounded-lg" />
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<Skeleton className="h-64 rounded-2xl" />
					<Skeleton className="h-64 rounded-2xl" />
				</div>
			</div>
		)
	}

	return (
		<div className="flex flex-col gap-8">
			{/* Left-Accent Main Header */}
			<div className="border-l-4 border-l-[var(--primary)] pl-4 py-1 mb-2">
				<div className="text-xs font-bold text-[var(--primary)] tracking-wide m-0">Pengaturan Akun</div>
				<div className="text-[10px] text-[var(--grey)] mt-0.5">Kelola nama profil, password, dan keamanan otentikasi.</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
				{/* Profile Settings */}
				<form onSubmit={handleProfileSubmit((d) => updateProfileMutation.mutate(d))}>
					<Card className="bg-white/50 backdrop-blur-sm border-slate-200">
						<CardHeader className="border-b border-slate-100 pb-3">
							<CardTitle className="text-xs font-bold text-[var(--primary)]">
								Profil Calon Santri
							</CardTitle>
						</CardHeader>
						<CardContent className="flex flex-col gap-5 pt-4">
							<div className="flex flex-col gap-1.5">
								<Label htmlFor="email">Alamat Email</Label>
								<Input
									id="email"
									type="text"
									disabled
									className="bg-slate-50 cursor-not-allowed text-[var(--grey)] h-10"
									value={profile?.email || ""}
								/>
							</div>

							<div className="flex flex-col gap-1.5">
								<Label htmlFor="name">Nama Lengkap</Label>
								<Input
									id="name"
									type="text"
									className="h-10"
									placeholder="Masukkan nama lengkap"
									{...registerProfile("name")}
								/>
								{profileErrors.name && (
									<p className="text-xs text-destructive mt-0.5">{profileErrors.name.message}</p>
								)}
							</div>

							<Button
								type="submit"
								variant="roja-primary"
								size="sm"
								className="w-max mt-2"
								disabled={updateProfileMutation.isPending}
							>
								{updateProfileMutation.isPending ? "Menyimpan..." : "Simpan Profil"}
							</Button>
						</CardContent>
					</Card>
				</form>

				{/* Security Settings */}
				<div className="flex flex-col gap-6">
					{/* Change Password */}
					<form onSubmit={handlePasswordSubmit((d) => updatePasswordMutation.mutate(d))}>
						<Card className="bg-white/50 backdrop-blur-sm border-slate-200">
							<CardHeader className="border-b border-slate-100 pb-3">
								<CardTitle className="text-xs font-bold text-[var(--primary)]">
									Ubah Password
								</CardTitle>
							</CardHeader>
							<CardContent className="flex flex-col gap-5 pt-4">
								<div className="flex flex-col gap-1.5">
									<Label htmlFor="password">Password Baru</Label>
									<Input
										id="password"
										type="password"
										className="h-10"
										placeholder="Minimal 8 karakter"
										{...registerPassword("password")}
									/>
									{passwordErrors.password && (
										<p className="text-xs text-destructive mt-0.5">{passwordErrors.password.message}</p>
									)}
								</div>

								<div className="flex flex-col gap-1.5">
									<Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
									<Input
										id="confirmPassword"
										type="password"
										className="h-10"
										placeholder="Masukkan ulang password"
										{...registerPassword("confirmPassword")}
									/>
									{passwordErrors.confirmPassword && (
										<p className="text-xs text-destructive mt-0.5">{passwordErrors.confirmPassword.message}</p>
									)}
								</div>

								<Button
									type="submit"
									variant="roja-primary"
									size="sm"
									className="w-max mt-2"
									disabled={updatePasswordMutation.isPending}
								>
									{updatePasswordMutation.isPending ? "Menyimpan..." : "Ubah Password"}
								</Button>
							</CardContent>
						</Card>
					</form>

					{/* 2FA Toggle */}
					<Card className="bg-white/50 backdrop-blur-sm border-slate-200">
						<CardHeader className="border-b border-slate-100 pb-3">
							<CardTitle className="text-xs font-bold text-[var(--primary)]">
								Dua Faktor Otentikasi (2FA)
							</CardTitle>
						</CardHeader>
						<CardContent className="pt-4 flex items-center justify-between">
							<div className="flex flex-col gap-1 pr-6">
								<span className="text-xs font-semibold text-slate-700">Otentikasi melalui Email</span>
								<p className="text-[10px] text-[var(--grey)] leading-relaxed m-0">
									Kirimkan kode OTP unik ke email Anda setiap kali mencoba melakukan login dari perangkat baru.
								</p>
							</div>
							<Switch
								checked={status2fa}
								onCheckedChange={(checked) => toggle2faMutation.mutate(checked)}
								disabled={toggle2faMutation.isPending}
							/>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	)
}

export const Route = createFileRoute("/_member/settings")({
	component: SettingsPage,
})

export default SettingsPage
