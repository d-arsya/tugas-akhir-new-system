import { useState, type JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { adminApi } from "@/lib/api"
import { RojaCard, Button, Input, Label, PageLoader } from "@roja/ui"
import { AdminPageHeader } from "@/components/layout/admin-page-header"
import type { CreateAcademicYearDto } from "@roja/types"
import { Calendar, Plus, Star, CheckCircle } from "lucide-react"

export const Route = createFileRoute("/_auth/academic-years")({
	component: AcademicYearsPage,
})

function AcademicYearsPage(): JSX.Element {
	const queryClient = useQueryClient()
	const [showModal, setShowModal] = useState(false)

	const { data, isLoading } = useQuery({
		queryKey: ["admin-academic-years"],
		queryFn: () => adminApi.getAcademicYears(),
	})

	const createMutation = useMutation({
		mutationFn: (payload: CreateAcademicYearDto) => adminApi.createAcademicYear(payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin-academic-years"] })
			setShowModal(false)
		},
	})

	const setActiveMutation = useMutation({
		mutationFn: (id: number) => adminApi.setActiveAcademicYear(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin-academic-years"] })
		},
	})

	const form = useForm<CreateAcademicYearDto>({
		defaultValues: {
			semester: "GANJIL",
		},
	})

	if (isLoading) return <PageLoader />

	const years = data?.data || []

	return (
		<div className="space-y-6">
			<AdminPageHeader
				title="Tahun Akademik"
				subtitle="Daftar periode kalender pendidikan dan pengaturan tahun ajaran aktif."
				actions={
					<Button
						onClick={() => setShowModal(true)}
						className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-xs border-0"
					>
						<Plus className="w-4 h-4" />
						<span>Tambah Tahun Ajaran</span>
					</Button>
				}
			/>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{years.map((y) => (
					<RojaCard
						key={y.id}
						className={`space-y-3 relative border-0 shadow-xs ${
							y.isCurrent
								? "bg-emerald-500/10"
								: "bg-white"
						}`}
					>
						{y.isCurrent && (
							<span className="absolute top-4 right-4 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white flex items-center gap-1 shadow-xs">
								<Star className="w-3 h-3 fill-current" /> Aktif Saat Ini
							</span>
						)}

						<div className="flex items-center gap-2">
							<div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
								<Calendar className="w-5 h-5" />
							</div>
							<div>
								<h5 className="font-bold text-slate-800 text-base">{y.year}</h5>
								<p className="text-xs text-slate-500 font-medium">Semester {y.semester}</p>
							</div>
						</div>

						<div className="text-xs text-slate-600 space-y-1.5 pt-2">
							<div className="flex justify-between">
								<span className="text-slate-400">Periode:</span>
								<span className="font-medium text-slate-700">{y.startDate} s/d {y.endDate}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-slate-400">Total Santri:</span>
								<span className="font-medium text-slate-700">{y.studentCount || 0} Santri</span>
							</div>
						</div>

						<div className="pt-2">
							{!y.isCurrent && (
								<Button
									size="sm"
									onClick={() => setActiveMutation.mutate(y.id)}
									className="w-full bg-slate-800 hover:bg-slate-900 text-white gap-1.5 text-xs border-0"
								>
									<CheckCircle className="w-3.5 h-3.5" /> Set Sebagai Tahun Aktif
								</Button>
							)}
						</div>
					</RojaCard>
				))}
			</div>

			{/* Create Modal */}
			{showModal && (
				<div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
					<div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4 shadow-xl">
						<h5 className="text-base font-bold text-slate-900">Tambah Tahun Akademik Baru</h5>
						<form onSubmit={form.handleSubmit((val) => createMutation.mutate(val))} className="space-y-3">
							<div className="space-y-1">
								<Label htmlFor="year">Tahun Ajaran</Label>
								<Input id="year" {...form.register("year", { required: true })} placeholder="Contoh: 2025/2026" className="bg-slate-50 border-0" />
							</div>

							<div className="space-y-1">
								<Label htmlFor="semester">Semester</Label>
								<select id="semester" {...form.register("semester")} className="w-full h-10 px-3 rounded-xl bg-slate-50 text-xs text-slate-700">
									<option value="GANJIL">GANJIL</option>
									<option value="GENAP">GENAP</option>
								</select>
							</div>

							<div className="grid grid-cols-2 gap-2">
								<div className="space-y-1">
									<Label htmlFor="startDate">Tanggal Mulai</Label>
									<Input id="startDate" type="date" {...form.register("startDate", { required: true })} className="bg-slate-50 border-0" />
								</div>
								<div className="space-y-1">
									<Label htmlFor="endDate">Tanggal Selesai</Label>
									<Input id="endDate" type="date" {...form.register("endDate", { required: true })} className="bg-slate-50 border-0" />
								</div>
							</div>

							<div className="flex justify-end gap-2 pt-3">
								<Button type="button" variant="ghost" onClick={() => setShowModal(false)}>Batal</Button>
								<Button type="submit" className="bg-emerald-600 text-white border-0" disabled={createMutation.isPending}>Simpan</Button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	)
}

export default AcademicYearsPage
