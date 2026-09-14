import { useState, type JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { adminApi } from "@/lib/api"
import { RojaCard, Button, Input, Label, PageLoader } from "@roja/ui"
import { AdminPageHeader } from "@/components/layout/admin-page-header"
import type { StudentCostItem, CreateStudentCostDto } from "@roja/types"
import { toast } from "sonner"
import { Receipt, Plus, Trash2, Edit2, Layers, Calendar } from "lucide-react"

export const Route = createFileRoute("/_auth/student-costs")({
	component: StudentCostsPage,
})

function StudentCostsPage(): JSX.Element {
	const queryClient = useQueryClient()
	const [selectedAyId, setSelectedAyId] = useState<number | undefined>(undefined)
	const [selectedGradeId, setSelectedGradeId] = useState<number | undefined>(undefined)
	const [showCreateModal, setShowCreateModal] = useState(false)
	const [editingItem, setEditingItem] = useState<StudentCostItem | null>(null)

	const { data: costsData, isLoading } = useQuery({
		queryKey: ["admin-student-costs", selectedAyId, selectedGradeId],
		queryFn: () =>
			adminApi.getStudentCosts({
				...(selectedAyId ? { academicYearId: selectedAyId } : {}),
				...(selectedGradeId ? { gradeId: selectedGradeId } : {}),
			}),
	})

	const { data: ayData } = useQuery({
		queryKey: ["admin-academic-years"],
		queryFn: () => adminApi.getAcademicYears(),
	})

	const { data: gradesData } = useQuery({
		queryKey: ["admin-grades"],
		queryFn: () => adminApi.getGrades(),
	})

	const form = useForm<CreateStudentCostDto>({
		defaultValues: {
			name: "",
			code: "",
			category: "SPP",
			amount: 650000,
			academicYearId: 1,
			gradeId: 1,
			billingCycle: "MONTHLY",
			isActive: true,
		},
	})

	const createMutation = useMutation({
		mutationFn: (dto: CreateStudentCostDto) => adminApi.createStudentCost(dto),
		onSuccess: (res) => {
			toast.success(res.message)
			queryClient.invalidateQueries({ queryKey: ["admin-student-costs"] })
			setShowCreateModal(false)
			form.reset()
		},
		onError: (err: Error) => toast.error(err.message),
	})

	const updateMutation = useMutation({
		mutationFn: ({ id, dto }: { id: number; dto: Partial<CreateStudentCostDto> }) =>
			adminApi.updateStudentCost(id, dto),
		onSuccess: (res) => {
			toast.success(res.message)
			queryClient.invalidateQueries({ queryKey: ["admin-student-costs"] })
			setEditingItem(null)
		},
		onError: (err: Error) => toast.error(err.message),
	})

	const deleteMutation = useMutation({
		mutationFn: (id: number) => adminApi.deleteStudentCost(id),
		onSuccess: (res) => {
			toast.success(res.data?.message || "Tarif akun berhasil dihapus.")
			queryClient.invalidateQueries({ queryKey: ["admin-student-costs"] })
		},
		onError: (err: Error) => toast.error(err.message),
	})

	const costs = costsData?.data || []
	const academicYears = ayData?.data || []
	const grades = gradesData?.data || []

	if (isLoading) return <PageLoader />

	return (
		<div className="space-y-6">
			<AdminPageHeader
				title="Tarif Akun Biaya Santri"
				subtitle="Konfigurasi pos tarif tagihan (SPP, Gedung, Seragam) per jenjang kelas dan tahun ajaran"
				actions={
					<Button
						onClick={() => {
							form.reset()
							setShowCreateModal(true)
						}}
						className="gap-2 bg-[var(--primary)] text-white hover:bg-emerald-700"
					>
						<Plus className="w-4 h-4" />
						Tambah Tarif Akun
					</Button>
				}
			/>

			{/* Filter Toolbar */}
			<RojaCard className="p-4 bg-white shadow-xs border-0 rounded-2xl">
				<div className="flex flex-wrap gap-4 items-center justify-between">
					<div className="flex flex-wrap items-center gap-3">
						<div className="flex items-center gap-2">
							<Calendar className="w-4 h-4 text-slate-400" />
							<span className="text-xs text-slate-500 font-medium">Tahun Ajaran:</span>
							<select
								value={selectedAyId || ""}
								onChange={(e) => setSelectedAyId(e.target.value ? Number(e.target.value) : undefined)}
								className="px-3 py-1.5 bg-slate-50 rounded-xl text-xs font-semibold text-slate-700"
							>
								<option value="">Semua Tahun Ajaran</option>
								{academicYears.map((ay: any) => (
									<option key={ay.id} value={ay.id}>
										{ay.year} - {ay.semester}
									</option>
								))}
							</select>
						</div>

						<div className="flex items-center gap-2">
							<Layers className="w-4 h-4 text-slate-400" />
							<span className="text-xs text-slate-500 font-medium">Kelas:</span>
							<select
								value={selectedGradeId || ""}
								onChange={(e) => setSelectedGradeId(e.target.value ? Number(e.target.value) : undefined)}
								className="px-3 py-1.5 bg-slate-50 rounded-xl text-xs font-semibold text-slate-700"
							>
								<option value="">Semua Tingkat Kelas</option>
								{grades.map((g: any) => (
									<option key={g.id} value={g.id}>
										{g.name}
									</option>
								))}
							</select>
						</div>
					</div>

					<div className="text-xs font-bold text-slate-500">
						Total {costs.length} Akun Tarif
					</div>
				</div>
			</RojaCard>

			{/* Datatable */}
			<RojaCard className="bg-white shadow-xs border-0 rounded-2xl overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full text-left text-xs">
						<thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-100">
							<tr>
								<th className="p-4">Kode Pos</th>
								<th className="p-4">Nama Pos Biaya</th>
								<th className="p-4">Kategori</th>
								<th className="p-4">Kelas / Rombel</th>
								<th className="p-4">Siklus Penagihan</th>
								<th className="p-4 text-right">Besaran Tarif (Rp)</th>
								<th className="p-4 text-center">Status</th>
								<th className="p-4 text-right">Aksi</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100 text-slate-700">
							{costs.length === 0 ? (
								<tr>
									<td colSpan={8} className="p-8 text-center text-slate-400">
										Belum ada data tarif biaya santri untuk filter terpilih.
									</td>
								</tr>
							) : (
								costs.map((item: StudentCostItem) => (
									<tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
										<td className="p-4 font-mono font-bold text-slate-900">{item.code}</td>
										<td className="p-4 font-semibold text-slate-900">{item.name}</td>
										<td className="p-4 font-medium text-slate-600">{item.category}</td>
										<td className="p-4 font-medium text-emerald-700">{item.gradeName}</td>
										<td className="p-4">
											<span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700">
												{item.billingCycle === "MONTHLY" ? "Bulanan (SPP)" : item.billingCycle === "ONCE" ? "Sekali Bayar" : "Tahunan"}
											</span>
										</td>
										<td className="p-4 text-right font-mono font-bold text-slate-900">
											Rp {item.amount.toLocaleString("id-ID")}
										</td>
										<td className="p-4 text-center">
											<span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
												{item.isActive ? "Aktif" : "Nonaktif"}
											</span>
										</td>
										<td className="p-4 text-right">
											<div className="flex items-center justify-end gap-1.5">
												<button
													type="button"
													onClick={() => setEditingItem(item)}
													className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
													title="Edit Tarif"
												>
													<Edit2 className="w-3.5 h-3.5" />
												</button>
												<button
													type="button"
													onClick={() => {
														if (confirm(`Hapus pos tarif "${item.name}"?`)) {
															deleteMutation.mutate(item.id)
														}
													}}
													className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
													title="Hapus Tarif"
												>
													<Trash2 className="w-3.5 h-3.5" />
												</button>
											</div>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</RojaCard>

			{/* Modal: Tambah Tarif */}
			{showCreateModal && (
				<div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
					<div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl space-y-4">
						<div className="flex items-center justify-between border-b border-slate-100 pb-3">
							<h5 className="font-bold text-slate-900 text-base flex items-center gap-2">
								<Receipt className="w-5 h-5 text-[var(--primary)]" /> Tambah Pos Tarif Biaya
							</h5>
							<button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
						</div>

						<form onSubmit={form.handleSubmit((d) => createMutation.mutate(d))} className="space-y-4">
							<div className="grid grid-cols-2 gap-3">
								<div>
									<Label>Kode Pos Biaya</Label>
									<Input {...form.register("code")} required placeholder="cth: SPP-7" className="mt-1" />
								</div>
								<div>
									<Label>Kategori Pos</Label>
									<Input {...form.register("category")} required placeholder="cth: SPP / Gedung" className="mt-1" />
								</div>
							</div>

							<div>
								<Label>Nama Pos Tarif</Label>
								<Input {...form.register("name")} required placeholder="cth: SPP Syahriah Bulanan" className="mt-1" />
							</div>

							<div className="grid grid-cols-2 gap-3">
								<div>
									<Label>Tingkat Kelas</Label>
									<select {...form.register("gradeId", { valueAsNumber: true })} className="w-full mt-1 px-3 py-2 bg-slate-50 rounded-xl text-xs">
										{grades.map((g: any) => (
											<option key={g.id} value={g.id}>{g.name}</option>
										))}
									</select>
								</div>
								<div>
									<Label>Tahun Ajaran</Label>
									<select {...form.register("academicYearId", { valueAsNumber: true })} className="w-full mt-1 px-3 py-2 bg-slate-50 rounded-xl text-xs">
										{academicYears.map((ay: any) => (
											<option key={ay.id} value={ay.id}>{ay.year} - {ay.semester}</option>
										))}
									</select>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-3">
								<div>
									<Label>Siklus Tagihan</Label>
									<select {...form.register("billingCycle")} className="w-full mt-1 px-3 py-2 bg-slate-50 rounded-xl text-xs">
										<option value="MONTHLY">Bulanan (SPP)</option>
										<option value="ONCE">Sekali Bayar (Pangkal)</option>
										<option value="YEARLY">Tahunan (Daftar Ulang)</option>
									</select>
								</div>
								<div>
									<Label>Nominal Tarif (Rp)</Label>
									<Input type="number" {...form.register("amount", { valueAsNumber: true })} required className="mt-1 font-mono font-bold" />
								</div>
							</div>

							<div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
								<Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>Batal</Button>
								<Button type="submit" disabled={createMutation.isPending} className="bg-[var(--primary)] text-white">
									{createMutation.isPending ? "Menyimpan..." : "Simpan Pos Tarif"}
								</Button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* Modal: Edit Tarif */}
			{editingItem && (
				<div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
					<div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl space-y-4">
						<div className="flex items-center justify-between border-b border-slate-100 pb-3">
							<h5 className="font-bold text-slate-900 text-base flex items-center gap-2">
								<Edit2 className="w-5 h-5 text-emerald-600" /> Edit Pos Tarif ({editingItem.code})
							</h5>
							<button onClick={() => setEditingItem(null)} className="text-slate-400 hover:text-slate-700">✕</button>
						</div>

						<div className="space-y-3 text-xs">
							<div>
								<Label>Nama Pos Tarif</Label>
								<Input id="editCostName" defaultValue={editingItem.name} className="mt-1" />
							</div>
							<div>
								<Label>Nominal Tarif (Rp)</Label>
								<Input id="editCostAmount" type="number" defaultValue={editingItem.amount} className="mt-1 font-mono font-bold" />
							</div>
							<div>
								<Label>Siklus Tagihan</Label>
								<select id="editCostCycle" defaultValue={editingItem.billingCycle} className="w-full mt-1 px-3 py-2 bg-slate-50 rounded-xl text-xs">
									<option value="MONTHLY">Bulanan (SPP)</option>
									<option value="ONCE">Sekali Bayar (Pangkal)</option>
									<option value="YEARLY">Tahunan (Daftar Ulang)</option>
								</select>
							</div>
						</div>

						<div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
							<Button variant="outline" onClick={() => setEditingItem(null)}>Batal</Button>
							<Button
								onClick={() => {
									const name = (document.getElementById("editCostName") as HTMLInputElement).value
									const amount = Number((document.getElementById("editCostAmount") as HTMLInputElement).value)
									const billingCycle = (document.getElementById("editCostCycle") as HTMLSelectElement).value as any
									updateMutation.mutate({ id: editingItem.id, dto: { name, amount, billingCycle } })
								}}
								disabled={updateMutation.isPending}
								className="bg-emerald-600 text-white"
							>
								{updateMutation.isPending ? "Menyimpan..." : "Simpan Perubahan"}
							</Button>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}
