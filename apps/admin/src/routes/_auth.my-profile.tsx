import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { adminApi } from "@/lib/api"
import { RojaCard, Button, Input, Label, PageLoader } from "@roja/ui"
import { AdminPageHeader } from "@/components/layout/admin-page-header"
import { toast } from "sonner"
import { UserCheck, KeyRound } from "lucide-react"

export const Route = createFileRoute("/_auth/my-profile")({
	component: MyProfilePage,
})

function MyProfilePage(): JSX.Element {
	const queryClient = useQueryClient()

	const { data: user, isLoading } = useQuery({
		queryKey: ["admin-my-profile"],
		queryFn: () => adminApi.getMyProfile(),
	})

	const profileForm = useForm({
		values: {
			name: user?.name || "",
			email: user?.email || "",
			phone: user?.phone || "",
		},
	})

	const passwordForm = useForm({
		defaultValues: {
			currentPassword: "",
			newPassword: "",
			confirmPassword: "",
		},
	})

	const updateProfileMutation = useMutation({
		mutationFn: (values: { name: string; email: string; phone: string }) => adminApi.updateMyProfile(values),
		onSuccess: (res) => {
			toast.success(res.message || "Profil berhasil diperbarui.")
			queryClient.invalidateQueries({ queryKey: ["admin-my-profile"] })
		},
		onError: (err: any) => toast.error(err.message || "Gagal memperbarui profil."),
	})

	const changePasswordMutation = useMutation({
		mutationFn: (values: any) => {
			if (values.newPassword !== values.confirmPassword) {
				throw new Error("Konfirmasi kata sandi baru tidak cocok.")
			}
			return adminApi.changePassword(values.currentPassword, values.newPassword)
		},
		onSuccess: (res) => {
			toast.success(res.message || "Kata sandi berhasil diperbarui.")
			passwordForm.reset()
		},
		onError: (err: any) => toast.error(err.message || "Gagal memperbarui kata sandi."),
	})

	if (isLoading) return <PageLoader />

	return (
		<div className="space-y-6">
			<AdminPageHeader
				title="Profil Saya"
				subtitle="Pengaturan data akun pribadi dan pembaruan kredensial keamanan login."
			/>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{/* Profile Info Form */}
				<RojaCard title="Informasi Identitas" className="space-y-4 border-0 shadow-xs bg-white">
					<form onSubmit={profileForm.handleSubmit((val) => updateProfileMutation.mutate(val))} className="space-y-4">
						<div className="space-y-1.5">
							<Label htmlFor="name">Nama Lengkap</Label>
							<Input id="name" {...profileForm.register("name", { required: true })} className="bg-slate-50 border-0" />
						</div>

						<div className="space-y-1.5">
							<Label htmlFor="email">Alamat Email</Label>
							<Input id="email" type="email" {...profileForm.register("email", { required: true })} className="bg-slate-50 border-0" />
						</div>

						<div className="space-y-1.5">
							<Label htmlFor="phone">Nomor Telepon / WhatsApp</Label>
							<Input id="phone" {...profileForm.register("phone")} className="bg-slate-50 border-0" />
						</div>

						<div className="space-y-1.5">
							<Label>Hak Akses / Peran</Label>
							<Input value={user?.role || "ADMIN"} disabled className="bg-slate-100 font-semibold text-slate-700 border-0" />
						</div>

						<div className="pt-2">
							<Button type="submit" className="bg-[var(--primary)] text-white gap-2 border-0" disabled={updateProfileMutation.isPending}>
								<UserCheck className="w-4 h-4" />
								<span>{updateProfileMutation.isPending ? "Menyimpan..." : "Simpan Profil"}</span>
							</Button>
						</div>
					</form>
				</RojaCard>

				{/* Password Change Form */}
				<RojaCard title="Ganti Kata Sandi" className="space-y-4 border-0 shadow-xs bg-white">
					<form onSubmit={passwordForm.handleSubmit((val) => changePasswordMutation.mutate(val))} className="space-y-4">
						<div className="space-y-1.5">
							<Label htmlFor="currentPassword">Kata Sandi Saat Ini</Label>
							<Input id="currentPassword" type="password" {...passwordForm.register("currentPassword", { required: true })} className="bg-slate-50 border-0" />
						</div>

						<div className="space-y-1.5">
							<Label htmlFor="newPassword">Kata Sandi Baru</Label>
							<Input id="newPassword" type="password" {...passwordForm.register("newPassword", { required: true, minLength: 6 })} className="bg-slate-50 border-0" />
						</div>

						<div className="space-y-1.5">
							<Label htmlFor="confirmPassword">Konfirmasi Kata Sandi Baru</Label>
							<Input id="confirmPassword" type="password" {...passwordForm.register("confirmPassword", { required: true })} className="bg-slate-50 border-0" />
						</div>

						<div className="pt-2">
							<Button type="submit" className="bg-slate-800 hover:bg-slate-900 text-white gap-2 border-0" disabled={changePasswordMutation.isPending}>
								<KeyRound className="w-4 h-4" />
								<span>{changePasswordMutation.isPending ? "Memproses..." : "Ganti Kata Sandi"}</span>
							</Button>
						</div>
					</form>
				</RojaCard>
			</div>
		</div>
	)
}

export default MyProfilePage
