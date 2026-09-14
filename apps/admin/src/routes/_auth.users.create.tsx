import { type JSX } from "react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useForm } from "react-hook-form"
import { RojaCard, Button, Input, Label } from "@roja/ui"
import { AdminPageHeader } from "@/components/layout/admin-page-header"
import { toast } from "sonner"
import { Shield, ArrowLeft, Save } from "lucide-react"

export const Route = createFileRoute("/_auth/users/create")({
	component: CreateUserPage,
})

function CreateUserPage(): JSX.Element {
	const navigate = useNavigate()

	const form = useForm({
		defaultValues: {
			username: "",
			email: "",
			fullName: "",
			role: "ADMIN",
			phone: "081234005566",
		},
	})

	const handleSave = (data: any) => {
		toast.success(`Pengguna ${data.fullName || "Baru"} berhasil ditambahkan!`)
		navigate({ to: "/users" as any })
	}

	return (
		<div className="space-y-6">
			<AdminPageHeader
				title="Tambah Pengelola / User Pengguna"
				subtitle="Pendaftaran akun staf pengelola, bendahara, atau kasir dompet Pondok Roja"
				actions={
					<Button
						variant="outline"
						onClick={() => navigate({ to: "/users" as any })}
						className="gap-2 bg-white text-xs"
					>
						<ArrowLeft className="w-4 h-4" /> Kembali
					</Button>
				}
			/>

			<RojaCard className="p-6 bg-white shadow-xs border-0 rounded-2xl max-w-lg mx-auto space-y-4">
				<h5 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100 flex items-center gap-2">
					<Shield className="w-4 h-4 text-[var(--primary)]" /> Pendaftaran Akun Pengguna
				</h5>

				<form onSubmit={form.handleSubmit(handleSave)} className="space-y-4 text-xs">
					<div>
						<Label>Nama Lengkap Staf</Label>
						<Input {...form.register("fullName")} required placeholder="cth: Ahmad Hamzah S.Pd." className="mt-1 text-xs" />
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div>
							<Label>Username</Label>
							<Input {...form.register("username")} required placeholder="ahamzah" className="mt-1 font-mono text-xs" />
						</div>
						<div>
							<Label>Peran / Role Akses</Label>
							<select {...form.register("role")} className="w-full mt-1 px-3 py-2 bg-slate-50 rounded-xl text-xs border border-slate-200">
								<option value="SUPERADMIN">SUPERADMIN (Akses Penuh)</option>
								<option value="ADMIN">ADMIN (Akademik & Santri)</option>
								<option value="BENDAHARA">BENDAHARA (Keuangan)</option>
								<option value="KASIR_EWALLET">KASIR_EWALLET (Dompet Digital)</option>
							</select>
						</div>
					</div>

					<div>
						<Label>Email</Label>
						<Input type="email" {...form.register("email")} required placeholder="ahamzah@pondokroja.com" className="mt-1 text-xs" />
					</div>

					<div>
						<Label>No. WhatsApp / HP</Label>
						<Input {...form.register("phone")} required className="mt-1 font-mono text-xs" />
					</div>

					<div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
						<Button type="button" variant="outline" onClick={() => navigate({ to: "/users" as any })}>
							Batal
						</Button>
						<Button type="submit" className="bg-[var(--primary)] text-white gap-2">
							<Save className="w-4 h-4" /> Simpan User
						</Button>
					</div>
				</form>
			</RojaCard>
		</div>
	)
}
