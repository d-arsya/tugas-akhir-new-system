import { useState, type JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { adminApi } from "@/lib/api"
import { RojaCard, Button, Input, Label, PageLoader, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@roja/ui"
import { AdminPageHeader } from "@/components/layout/admin-page-header"
import type { CreateGradeDto, CreateSubGradeDto } from "@roja/types"
import { toast } from "sonner"
import { Layers, Plus, Trash2, Users } from "lucide-react"

export const Route = createFileRoute("/_auth/grades")({
	component: GradesPage,
})

function GradesPage(): JSX.Element {
	const queryClient = useQueryClient()
	const [showGradeModal, setShowGradeModal] = useState(false)
	const [selectedGradeId, setSelectedGradeId] = useState<number | null>(null)

	const { data: gradesRes, isLoading: isGradesLoading } = useQuery({
		queryKey: ["admin-grades"],
		queryFn: () => adminApi.getGrades(),
	})

	const { data: levelsRes } = useQuery({
		queryKey: ["admin-levels"],
		queryFn: () => adminApi.getLevels(),
	})

	const gradeForm = useForm<CreateGradeDto>({
		defaultValues: { code: "", name: "", levelId: 1 },
	})

	const subGradeForm = useForm<{ name: string; capacity: number }>({
		defaultValues: { name: "", capacity: 30 },
	})

	const createGradeMutation = useMutation({
		mutationFn: (dto: CreateGradeDto) => adminApi.createGrade(dto),
		onSuccess: (res) => {
			toast.success(res.message || "Kelas induk berhasil ditambahkan.")
			setShowGradeModal(false)
			gradeForm.reset()
			queryClient.invalidateQueries({ queryKey: ["admin-grades"] })
		},
	})

	const deleteGradeMutation = useMutation({
		mutationFn: (id: number) => adminApi.deleteGrade(id),
		onSuccess: () => {
			toast.success("Kelas induk berhasil dihapus.")
			queryClient.invalidateQueries({ queryKey: ["admin-grades"] })
		},
	})

	const createSubGradeMutation = useMutation({
		mutationFn: (dto: CreateSubGradeDto) => adminApi.createSubGrade(dto),
		onSuccess: (res) => {
			toast.success(res.message || "Sub-kelas rombel berhasil ditambahkan.")
			setSelectedGradeId(null)
			subGradeForm.reset()
			queryClient.invalidateQueries({ queryKey: ["admin-grades"] })
		},
	})

	const deleteSubGradeMutation = useMutation({
		mutationFn: (id: number) => adminApi.deleteSubGrade(id),
		onSuccess: () => {
			toast.success("Sub-kelas berhasil dihapus.")
			queryClient.invalidateQueries({ queryKey: ["admin-grades"] })
		},
	})

	if (isGradesLoading) return <PageLoader />

	const grades = gradesRes?.data || []
	const levels = levelsRes?.data || []

	return (
		<div className="space-y-6">
			<AdminPageHeader
				title="Kelas & Sub-Kelas (Rombel)"
				subtitle="Daftar tingkatan kelas induk dan rombongan belajar (sub-kelas)."
				actions={
					<Button
						onClick={() => setShowGradeModal(true)}
						className="bg-cyan-600 hover:bg-cyan-700 text-white gap-2 shadow-xs border-0"
					>
						<Plus className="w-4 h-4" />
						<span>Tambah Kelas Induk</span>
					</Button>
				}
			/>

			<div className="space-y-4">
				{grades.map((g) => (
					<RojaCard key={g.id} className="p-5 space-y-4 border-0 shadow-xs bg-white">
						<div className="flex items-center justify-between pb-2">
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold">
									<Layers className="w-5 h-5" />
								</div>
								<div>
									<h5 className="font-bold text-slate-800 text-base">{g.name}</h5>
									<p className="text-xs text-slate-500 font-medium">Jenjang: {g.levelName || "Umum"} (Kode: {g.code})</p>
								</div>
							</div>
							<div className="flex items-center gap-2">
								<Button
									size="sm"
									onClick={() => {
										setSelectedGradeId(g.id)
										subGradeForm.reset()
									}}
									className="bg-slate-800 hover:bg-slate-900 text-white gap-1 text-xs border-0"
								>
									<Plus className="w-3.5 h-3.5" /> Tambah Sub-Kelas
								</Button>
								<Button
									size="sm"
									variant="ghost"
									onClick={() => deleteGradeMutation.mutate(g.id)}
									className="text-red-600 hover:text-red-700 hover:bg-red-50"
								>
									<Trash2 className="w-4 h-4" />
								</Button>
							</div>
						</div>

						{/* Sub-Grades Grid */}
						<div>
							<h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Daftar Rombel Sub-Kelas:</h4>
							{g.subGrades.length === 0 ? (
								<p className="text-xs text-slate-400 italic">Belum ada sub-kelas ditambahkan ke kelas ini.</p>
							) : (
								<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
									{g.subGrades.map((sub) => (
										<div key={sub.id} className="p-3 rounded-xl bg-slate-50 flex items-center justify-between">
											<div>
												<p className="font-bold text-slate-800 text-xs">{sub.name}</p>
												<p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
													<Users className="w-3 h-3 text-slate-400" />
													<span>{sub.studentCount} / {sub.capacity} Santri</span>
												</p>
											</div>
											<button
												type="button"
												onClick={() => deleteSubGradeMutation.mutate(sub.id)}
												className="p-1 text-slate-400 hover:text-red-600 transition"
												title="Hapus Sub-Kelas"
											>
												<Trash2 className="w-3.5 h-3.5" />
											</button>
										</div>
									))}
								</div>
							)}
						</div>
					</RojaCard>
				))}
			</div>

			{/* Modal Create Grade */}
			{showGradeModal && (
				<div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
					<div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4 shadow-xl">
						<h5 className="text-base font-bold text-slate-900">Tambah Kelas Induk Baru</h5>
						<form onSubmit={gradeForm.handleSubmit((val) => createGradeMutation.mutate(val))} className="space-y-3">
							<div className="space-y-1">
								<Label htmlFor="code">Kode Kelas</Label>
								<Input id="code" {...gradeForm.register("code", { required: true })} placeholder="Contoh: VII / VIII / IX" className="bg-slate-50 border-0" />
							</div>
							<div className="space-y-1">
								<Label htmlFor="name">Nama Kelas</Label>
								<Input id="name" {...gradeForm.register("name", { required: true })} placeholder="Contoh: Kelas 7 MTs" className="bg-slate-50 border-0" />
							</div>
							<div className="space-y-1">
								<Label htmlFor="levelId">Jenjang Terkait</Label>
								<Select
									value={String(gradeForm.watch("levelId") || levels[0]?.id || 1)}
									onValueChange={(val) => gradeForm.setValue("levelId", Number(val))}
								>
									<SelectTrigger className="w-full h-10 bg-slate-50 border-0 text-xs text-slate-700">
										<SelectValue placeholder="Pilih Jenjang..." />
									</SelectTrigger>
									<SelectContent align="start">
										{levels.map((lvl) => (
											<SelectItem key={lvl.id} value={String(lvl.id)}>
												{lvl.name} ({lvl.code})
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div className="flex justify-end gap-2 pt-3">
								<Button type="button" variant="ghost" onClick={() => setShowGradeModal(false)}>Batal</Button>
								<Button type="submit" className="bg-cyan-600 text-white border-0" disabled={createGradeMutation.isPending}>Simpan Kelas</Button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* Modal Create SubGrade */}
			{selectedGradeId && (
				<div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
					<div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4 shadow-xl">
						<h5 className="text-base font-bold text-slate-900">Tambah Sub-Kelas (Rombel)</h5>
						<form
							onSubmit={subGradeForm.handleSubmit((val) =>
								createSubGradeMutation.mutate({
									gradeId: selectedGradeId,
									name: val.name,
									capacity: Number(val.capacity),
								})
							)}
							className="space-y-3"
						>
							<div className="space-y-1">
								<Label htmlFor="subName">Nama Sub-Kelas</Label>
								<Input id="subName" {...subGradeForm.register("name", { required: true })} placeholder="Contoh: Kelas 7-A" className="bg-slate-50 border-0" />
							</div>
							<div className="space-y-1">
								<Label htmlFor="capacity">Kapasitas Maksimal</Label>
								<Input id="capacity" type="number" {...subGradeForm.register("capacity", { valueAsNumber: true, required: true })} className="bg-slate-50 border-0" />
							</div>

							<div className="flex justify-end gap-2 pt-3">
								<Button type="button" variant="ghost" onClick={() => setSelectedGradeId(null)}>Batal</Button>
								<Button type="submit" className="bg-cyan-600 text-white border-0" disabled={createSubGradeMutation.isPending}>Simpan Sub-Kelas</Button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	)
}

export default GradesPage
