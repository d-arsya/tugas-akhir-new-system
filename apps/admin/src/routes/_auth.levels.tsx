import { useState, type JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { adminApi } from "@/lib/api"
import { RojaCard, Button, Input, Label, PageLoader } from "@roja/ui"
import { AdminPageHeader } from "@/components/layout/admin-page-header"
import type { CreateLevelDto } from "@roja/types"
import { toast } from "sonner"
import { GraduationCap, Plus, Trash2 } from "lucide-react"

export const Route = createFileRoute("/_auth/levels")({
	component: LevelsPage,
})

function LevelsPage(): JSX.Element {
	const queryClient = useQueryClient()
	const [showModal, setShowModal] = useState(false)

	const { data, isLoading } = useQuery({
		queryKey: ["admin-levels"],
		queryFn: () => adminApi.getLevels(),
	})

	const form = useForm<CreateLevelDto>({
		defaultValues: { code: "", name: "", levelNumber: 7, description: "" },
	})

	const createMutation = useMutation({
		mutationFn: (dto: CreateLevelDto) => adminApi.createLevel(dto),
		onSuccess: (res) => {
			toast.success(res.message || "Jenjang pendidikan berhasil ditambahkan.")
			setShowModal(false)
			form.reset()
			queryClient.invalidateQueries({ queryKey: ["admin-levels"] })
		},
	})

	const deleteMutation = useMutation({
		mutationFn: (id: number) => adminApi.deleteLevel(id),
		onSuccess: () => {
			toast.success("Jenjang pendidikan berhasil dihapus.")
			queryClient.invalidateQueries({ queryKey: ["admin-levels"] })
		},
	})

	if (isLoading) return <PageLoader />

	const levels = data?.data || []

	return (
		<div className="space-y-6">
			<AdminPageHeader
				title="Jenjang Pendidikan"
				subtitle="Daftar tingkatan pendidikan (Tsanawiyah, Aliyah, dsb.) dalam kurikulum madrasah."
				actions={
					<Button
						onClick={() => setShowModal(true)}
						className="bg-purple-600 hover:bg-purple-700 text-white gap-2 shadow-xs border-0"
					>
						<Plus className="w-4 h-4" />
						<span>Tambah Jenjang</span>
					</Button>
				}
			/>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{levels.map((lvl) => (
					<RojaCard key={lvl.id} className="p-4 space-y-3 border-0 shadow-xs bg-white">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
									<GraduationCap className="w-5 h-5" />
								</div>
								<div>
									<h5 className="font-bold text-slate-800 text-base">{lvl.name}</h5>
									<p className="text-xs text-slate-500 font-mono">Kode: {lvl.code} (Tingkat {lvl.levelNumber})</p>
								</div>
							</div>
							<Button
								size="sm"
								variant="ghost"
								onClick={() => deleteMutation.mutate(lvl.id)}
								className="text-red-600 hover:text-red-700 hover:bg-red-50"
							>
								<Trash2 className="w-4 h-4" />
							</Button>
						</div>

						{lvl.description && <p className="text-xs text-slate-600">{lvl.description}</p>}
					</RojaCard>
				))}
			</div>

			{/* Modal Create Level */}
			{showModal && (
				<div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
					<div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4 shadow-xl">
						<h5 className="text-base font-bold text-slate-900">Tambah Jenjang Pendidikan Baru</h5>
						<form onSubmit={form.handleSubmit((val) => createMutation.mutate(val))} className="space-y-3">
							<div className="space-y-1">
								<Label htmlFor="code">Kode Jenjang</Label>
								<Input id="code" {...form.register("code", { required: true })} placeholder="Contoh: TSA / ALI" className="bg-slate-50 border-0" />
							</div>
							<div className="space-y-1">
								<Label htmlFor="name">Nama Jenjang</Label>
								<Input id="name" {...form.register("name", { required: true })} placeholder="Contoh: Tsanawiyah (SMP)" className="bg-slate-50 border-0" />
							</div>
							<div className="space-y-1">
								<Label htmlFor="levelNumber">Nomor Tingkat Awal</Label>
								<Input id="levelNumber" type="number" {...form.register("levelNumber", { valueAsNumber: true, required: true })} className="bg-slate-50 border-0" />
							</div>
							<div className="space-y-1">
								<Label htmlFor="description">Keterangan Singkat</Label>
								<Input id="description" {...form.register("description")} placeholder="Opsional" className="bg-slate-50 border-0" />
							</div>

							<div className="flex justify-end gap-2 pt-3">
								<Button type="button" variant="ghost" onClick={() => setShowModal(false)}>Batal</Button>
								<Button type="submit" className="bg-purple-600 text-white border-0" disabled={createMutation.isPending}>Simpan</Button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	)
}

export default LevelsPage
