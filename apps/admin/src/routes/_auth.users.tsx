import { useState, type JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { adminApi } from "@/lib/api"
import { RojaCard, Button, Input, Label, PageLoader, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@roja/ui"
import { AdminPageHeader } from "@/components/layout/admin-page-header"
import type { CreateAdminUserDto, AdminUserItem, AdminRole } from "@roja/types"
import { UserPlus, Search, Shield, CheckCircle, XCircle, Trash2 } from "lucide-react"

export const Route = createFileRoute("/_auth/users")({
	component: UsersManagementPage,
})

function UsersManagementPage(): JSX.Element {
	const queryClient = useQueryClient()
	const [search, setSearch] = useState("")
	const [roleFilter, setRoleFilter] = useState("")
	const [showCreateModal, setShowCreateModal] = useState(false)

	const { data, isLoading } = useQuery({
		queryKey: ["admin-users", { search, role: roleFilter }],
		queryFn: () =>
			adminApi.getUsers({
				search: search || undefined,
				role: roleFilter || undefined,
			}),
	})

	const createMutation = useMutation({
		mutationFn: (payload: CreateAdminUserDto) => adminApi.createUser(payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin-users"] })
			setShowCreateModal(false)
		},
	})

	const toggleStatusMutation = useMutation({
		mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
			adminApi.toggleUserStatus(id, isActive),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin-users"] })
		},
	})

	const createForm = useForm<CreateAdminUserDto>({
		defaultValues: {
			name: "",
			email: "",
			role: "ADMIN" as AdminRole,
			phone: "",
		},
	})

	const users: AdminUserItem[] = data?.data.items || []

	if (isLoading) {
		return <PageLoader />
	}

	return (
		<div className="space-y-6">
			<AdminPageHeader
				title="Pengguna & Hak Akses"
				subtitle="Kelola data akun administrator, kasir, bendahara, dan peran operasional."
				actions={
					<Button
						onClick={() => setShowCreateModal(true)}
						className="bg-[var(--primary)] hover:opacity-90 text-white gap-2 shadow-xs border-0"
					>
						<UserPlus className="w-4 h-4" />
						<span>Tambah Pengguna</span>
					</Button>
				}
			/>

			{/* Filters */}
			<RojaCard className="p-4 flex flex-col sm:flex-row gap-3 items-center justify-between border-0 shadow-xs">
				<div className="w-full sm:w-72">
					<Input
						placeholder="Cari nama atau email..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="bg-slate-50 border-0"
					/>
				</div>

				<Select
					value={roleFilter || "ALL"}
					onValueChange={(val) => setRoleFilter(val === "ALL" ? "" : val)}
				>
					<SelectTrigger className="w-full sm:w-48 h-10 bg-slate-50 border-0 text-xs text-slate-700">
						<SelectValue placeholder="Semua Peran (Roles)" />
					</SelectTrigger>
					<SelectContent align="end">
						<SelectItem value="ALL">Semua Peran (Roles)</SelectItem>
						<SelectItem value="SUPERADMIN">Superadmin</SelectItem>
						<SelectItem value="ADMIN">Admin</SelectItem>
						<SelectItem value="BENDAHARA">Bendahara</SelectItem>
						<SelectItem value="KASIR_EWALLET">Kasir E-Wallet</SelectItem>
					</SelectContent>
				</Select>
			</RojaCard>

			{/* Users Table */}
			<RojaCard className="overflow-x-auto p-0 border-0 shadow-xs">
				<table className="w-full text-left text-xs">
					<thead>
						<tr className="bg-slate-50/80 text-slate-600 font-semibold uppercase tracking-wider">
							<th className="py-3.5 px-4">Nama Pengguna</th>
							<th className="py-3.5 px-4">Email</th>
							<th className="py-3.5 px-4">Peran (Role)</th>
							<th className="py-3.5 px-4">Nomor HP</th>
							<th className="py-3.5 px-4">Status</th>
							<th className="py-3.5 px-4 text-right">Aksi</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-slate-100/60">
						{users.map((u) => (
							<tr key={u.id} className="hover:bg-slate-50/50 transition">
								<td className="py-3 px-4 font-semibold text-slate-800">{u.name}</td>
								<td className="py-3 px-4 text-slate-600">{u.email}</td>
								<td className="py-3 px-4">
									<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700">
										<Shield className="w-3 h-3 text-[var(--primary)]" />
										<span>{u.role}</span>
									</span>
								</td>
								<td className="py-3 px-4 text-slate-600">{u.phone || "-"}</td>
								<td className="py-3 px-4">
									{u.isActive ? (
										<span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
											<CheckCircle className="w-3.5 h-3.5" /> Aktif
										</span>
									) : (
										<span className="inline-flex items-center gap-1 text-slate-400 font-medium">
											<XCircle className="w-3.5 h-3.5" /> Nonaktif
										</span>
									)}
								</td>
								<td className="py-3 px-4 text-right space-x-2">
									<Button
										size="sm"
										variant="ghost"
										onClick={() => toggleStatusMutation.mutate({ id: u.id, isActive: !u.isActive })}
										className="text-xs"
									>
										{u.isActive ? "Nonaktifkan" : "Aktifkan"}
									</Button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</RojaCard>

			{/* Create User Modal */}
			{showCreateModal && (
				<div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
					<div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
						<div className="flex items-center justify-between">
							<h5 className="text-base font-bold text-slate-900">Tambah Pengguna Baru</h5>
							<Button variant="ghost" size="sm" onClick={() => setShowCreateModal(false)}>
								✕
							</Button>
						</div>

						<form onSubmit={createForm.handleSubmit((vals) => createMutation.mutate(vals))} className="space-y-4">
							<div className="space-y-1">
								<Label htmlFor="name">Nama Lengkap</Label>
								<Input id="name" {...createForm.register("name", { required: true })} className="bg-slate-50 border-0" />
							</div>

							<div className="space-y-1">
								<Label htmlFor="email">Email</Label>
								<Input id="email" type="email" {...createForm.register("email", { required: true })} className="bg-slate-50 border-0" />
							</div>

							<div className="space-y-1">
								<Label htmlFor="role">Peran (Role)</Label>
								<Select
									value={createForm.watch("role") || "ADMIN"}
									onValueChange={(val) => createForm.setValue("role", val as AdminRole)}
								>
									<SelectTrigger className="w-full h-10 bg-slate-50 border-0 text-xs text-slate-700">
										<SelectValue placeholder="Pilih Peran..." />
									</SelectTrigger>
									<SelectContent align="start">
										<SelectItem value="SUPERADMIN">Superadmin</SelectItem>
										<SelectItem value="ADMIN">Admin</SelectItem>
										<SelectItem value="BENDAHARA">Bendahara</SelectItem>
										<SelectItem value="KASIR_EWALLET">Kasir E-Wallet</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-1">
								<Label htmlFor="phone">Nomor Telepon / WhatsApp</Label>
								<Input id="phone" {...createForm.register("phone")} className="bg-slate-50 border-0" />
							</div>

							<div className="flex items-center justify-end gap-2 pt-2">
								<Button type="button" variant="ghost" onClick={() => setShowCreateModal(false)}>
									Batal
								</Button>
								<Button type="submit" className="bg-[var(--primary)] text-white border-0">
									Simpan Pengguna
								</Button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	)
}

export default UsersManagementPage
