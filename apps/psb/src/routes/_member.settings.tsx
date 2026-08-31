import type { JSX } from "react"
import { useForm } from "react-hook-form"
import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { psbApi } from "@/lib/api"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"

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
			alert("Nama profil berhasil diperbarui")
		},
	})

	const updatePasswordMutation = useMutation({
		mutationFn: (data: PasswordInput) => psbApi.updateAccount({ password: data.password }),
		onSuccess: () => {
			alert("Password berhasil diperbarui")
			resetPasswordForm()
		},
	})

	const toggle2faMutation = useMutation({
		mutationFn: (enabled: boolean) => psbApi.toggle2fa(enabled),
		onSuccess: (_, enabled) => {
			setStatus2fa(enabled)
			alert(`Dua Faktor Otentikasi (2FA) berhasil ${enabled ? "diaktifkan" : "dinonaktifkan"}`)
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
		return <div className="text-center py-10 text-xs">Memuat data...</div>
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
				<form
					onSubmit={handleProfileSubmit((d) => updateProfileMutation.mutate(d))}
					className="flex flex-col gap-5 border border-[var(--bg-form-border)] p-6 rounded-2xl bg-white/50 backdrop-blur-sm"
				>
					<div className="text-xs font-bold text-[var(--primary)] border-b border-slate-100 pb-3">
						Profil Calon Santri
					</div>

					<div className="form-group mb-0">
						<label className="control-label">Alamat Email</label>
						<input
							type="text"
							disabled
							className="form-control bg-slate-50 cursor-not-allowed text-[var(--grey)]"
							value={profile?.email || ""}
						/>
					</div>

					<div className="form-group mb-0">
						<label className="control-label">Nama Lengkap</label>
						<input
							type="text"
							className={`form-control ${profileErrors.name ? "is-invalid" : ""}`}
							placeholder="Masukkan nama lengkap"
							{...registerProfile("name")}
						/>
						{profileErrors.name && <span className="invalid-feedback">{profileErrors.name.message}</span>}
					</div>

					<button
						type="submit"
						className="roja_btn roja_btn-primary text-white bg-[var(--primary)] py-2 px-5 text-xs w-max mt-2 font-semibold shadow-md shadow-[var(--primary)]/10"
						disabled={updateProfileMutation.isPending}
					>
						{updateProfileMutation.isPending ? "Menyimpan..." : "Simpan Profil"}
					</button>
				</form>

				{/* Security Settings */}
				<div className="flex flex-col gap-6">
					{/* Change Password */}
					<form
						onSubmit={handlePasswordSubmit((d) => updatePasswordMutation.mutate(d))}
						className="flex flex-col gap-5 border border-[var(--bg-form-border)] p-6 rounded-2xl bg-white/50 backdrop-blur-sm"
					>
						<div className="text-xs font-bold text-[var(--primary)] border-b border-slate-100 pb-3">
							Ubah Password
						</div>

						<div className="form-group mb-0">
							<label className="control-label">Password Baru</label>
							<input
								type="password"
								className={`form-control ${passwordErrors.password ? "is-invalid" : ""}`}
								placeholder="Minimal 8 karakter"
								{...registerPassword("password")}
							/>
							{passwordErrors.password && (
								<span className="invalid-feedback">{passwordErrors.password.message}</span>
							)}
						</div>

						<div className="form-group mb-0">
							<label className="control-label">Konfirmasi Password Baru</label>
							<input
								type="password"
								className={`form-control ${passwordErrors.confirmPassword ? "is-invalid" : ""}`}
								placeholder="Masukkan ulang password"
								{...registerPassword("confirmPassword")}
							/>
							{passwordErrors.confirmPassword && (
								<span className="invalid-feedback">{passwordErrors.confirmPassword.message}</span>
							)}
						</div>

						<button
							type="submit"
							className="roja_btn roja_btn-primary text-white bg-[var(--primary)] py-2 px-5 text-xs w-max mt-2 font-semibold shadow-md shadow-[var(--primary)]/10"
							disabled={updatePasswordMutation.isPending}
						>
							{updatePasswordMutation.isPending ? "Menyimpan..." : "Ubah Password"}
						</button>
					</form>

					{/* 2FA Toggle */}
					<div className="flex flex-col gap-4 border border-[var(--bg-form-border)] p-6 rounded-2xl bg-white/50 backdrop-blur-sm">
						<div className="text-xs font-bold text-[var(--primary)] border-b border-slate-100 pb-3">
							Dua Faktor Otentikasi (2FA)
						</div>
						<div className="flex items-center justify-between mt-1">
							<div className="flex flex-col gap-1 pr-6">
								<span className="text-xs font-semibold text-slate-700">Otentikasi melalui Email</span>
								<p className="text-[10px] text-[var(--grey)] leading-relaxed">
									Kirimkan kode OTP unik ke email Anda setiap kali mencoba melakukan login dari perangkat baru.
								</p>
							</div>
							<label className="relative inline-flex items-center cursor-pointer">
								<input
									type="checkbox"
									checked={status2fa}
									onChange={(e) => toggle2faMutation.mutate(e.target.checked)}
									className="sr-only peer"
								/>
								<div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary)]"></div>
							</label>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export const Route = createFileRoute("/_member/settings")({
	component: SettingsPage,
})

export default SettingsPage
