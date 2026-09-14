import { useState, type JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { adminApi } from "@/lib/api"
import { RojaCard, Button, Input, Label, PageLoader } from "@roja/ui"
import { AdminPageHeader } from "@/components/layout/admin-page-header"
import type { CreateMajorDto } from "@roja/types"
import { toast } from "sonner"
import { BookOpen, Plus, Trash2 } from "lucide-react"

export const Route = createFileRoute("/_auth/majors")({
	component: MajorsPage,
})

function MajorsPage(): JSX.Element {
	const queryClient = useQueryClient()
	const [showModal, setShowModal] = useState(false)

	const { data, isLoading } = useQuery({
		queryKey: ["admin-majors"],
		queryFn: () => adminApi.getMajors(),
	})

	const form = useForm<CreateMajorDto>({
		defaultValues: { code: "", name: "", description: "" },
	})

	const createMutation = useMutation({
		mutationFn: (dto: CreateMajorDto) => adminApi.createMajor(dto),
		onSuccess: (res) => {
			toast.success(res.message || "Jurusan baru berhasil ditambahkan.")
			setShowModal(false)
			form.reset()
			queryClient.invalidateQueries({ queryKey: ["admin-majors"] })
		},
	})

	const deleteMutation = useMutation({
		mutationFn: (id: number) => adminApi.deleteMajor(id),
		onSuccess: () => {
			toast.success("Jurusan berhasil dihapus.")
			queryClient.invalidateQueries({ queryKey: ["admin-majors"] })
		},
	})

	if (isLoading) return <PageLoader />

	const majors = data?.data || []

	return (
		<div className="space-y-6">
			<AdminPageHeader
				title="Program Jurusan"
				subtitle="Daftar peminatan/konsentrasi studi santri (IPA, IPS, Keagamaan, dll.)."
				actions={
					<Button
						onClick={() => setShowModal(true)}
						className="bg-teal-600 hover:bg-teal-700 text-white gap-2 shadow-xs border-0"
					>
						<Plus className="w-4 h-4" />
						<span>Tambah Jurusan</span>
					</Button>
				}
			/>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				{majors.map((m) => (
					<RojaCard key={m.id} className="p-4 space-y-3 border-0 shadow-xs bg-white">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
									<BookOpen className="w-5 h-5" />
								</div>
								<div>
									<h5 className="font-bold text-slate-800 text-base">{m.code}</h5>
									<p className="text-xs text-slate-500 font-medium">{m.name}</p>
								</div>
							</div>
							<Button
								size="sm"
								variant="ghost"
								onClick={() => deleteMutation.mutate(m.id)}
								className="text-red-600 hover:text-red-700 hover:bg-red-50"
							>
								<Trash2 className="w-4 h-4" />
							</Button>
						</div>

						{m.description && <p className="text-xs text-slate-600 pt-1">{m.description}</p>}
					</RojaCard>
				))}
			</div>

			{/* Modal Create Major */}
			{showModal && (
				<div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
					<div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4 shadow-xl">
						<h5 className="text-base font-bold text-slate-900">Tambah Jurusan Baru</h5>
						<form onSubmit={form.handleSubmit((val) => createMutation.mutate(val))} className="space-y-3">
							<div className="space-y-1">
								<Label htmlFor="code">Kode Singkatan</Label>
								<Input id="code" {...form.register("code", { required: true })} placeholder="Contoh: IPA / IPS / AGM" className="bg-slate-50 border-0" />
							</div>
							<div className="space-y-1">
								<Label htmlFor="name">Nama Lengkap Jurusan</Label>
								<Input id="name" {...form.register("name", { required: true })} placeholder="Contoh: Ilmu Pengetahuan Alam" className="bg-slate-50 border-0" />
							</div>
							<div className="space-y-1">
								<Label htmlFor="description">Deskripsi</Label>
								<Input id="description" {...form.register("description")} placeholder="Opsional" className="bg-slate-50 border-0" />
							</div>

							<div className="flex justify-end gap-2 pt-3">
								<Button type="button" variant="ghost" onClick={() => setShowModal(false)}>Batal</Button>
								<Button type="submit" className="bg-teal-600 text-white border-0" disabled={createMutation.isPending}>Simpan</Button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	)
}

export default MajorsPage
