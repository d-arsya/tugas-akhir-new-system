import { useState, type JSX } from "react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { adminApi } from "@/lib/api"
import { RojaCard, Button, Input, Label, PageLoader } from "@roja/ui"
import type { StudentCapabilityMatrixItem } from "@roja/types"
import { toast } from "sonner"
import { Sparkles, Send, Percent, Filter, CheckCircle2, ArrowLeft } from "lucide-react"

export const Route = createFileRoute("/_auth/student-capabilities/$academicYearId")({
	component: StudentCapabilityMatrixPage,
})

function StudentCapabilityMatrixPage(): JSX.Element {
	const navigate = useNavigate()
	const queryClient = useQueryClient()
	const { academicYearId } = Route.useParams()

	const [selectedGrade, setSelectedGrade] = useState("ALL")
	const [showMassDiscountModal, setShowMassDiscountModal] = useState(false)
	const [showPublishModal, setShowPublishModal] = useState(false)
	const [editingCell, setEditingCell] = useState<{ studentId: number; costItemId: number; discount: number } | null>(null)

	const { data: ayData, isLoading: ayLoading } = useQuery({
		queryKey: ["admin-academic-years"],
		queryFn: () => adminApi.getAcademicYears(),
	})

	const { data: matrixData, isLoading: matrixLoading } = useQuery({
		queryKey: ["admin-capability-matrix"],
		queryFn: () => adminApi.getStudentCapabilityMatrix(),
	})

	const { data: capabilitiesSummary } = useQuery({
		queryKey: ["admin-capabilities"],
		queryFn: () => adminApi.getCapabilities(),
	})

	const academicYears = ayData?.data || []
	const matrix = matrixData?.data || []
	const summaryItems = capabilitiesSummary?.data || []

	const currentAy = academicYears.find((a: any) => String(a.id) === String(academicYearId)) || {
		id: Number(academicYearId),
		year: "2026/2027",
		semester: "Ganjil",
	}

	const updateCapabilityMutation = useMutation({
		mutationFn: (dto: { studentId: number; costItemId: number; discountPercent: number }) =>
			adminApi.updateStudentCapability(dto),
		onSuccess: (res) => {
			toast.success(res.message)
			queryClient.invalidateQueries({ queryKey: ["admin-capability-matrix"] })
			setEditingCell(null)
		},
	})

	const publishInvoiceMutation = useMutation({
		mutationFn: (dto: { gradeName: string; costTermName: string; dueDate: string }) =>
			adminApi.bulkGenerateInvoices(dto),
		onSuccess: (res) => {
			toast.success(`${res.data?.generatedCount || 28} Tagihan berhasil diterbitkan!`)
			queryClient.invalidateQueries({ queryKey: ["admin-invoices"] })
			setShowPublishModal(false)
		},
	})

	const filteredMatrix =
		selectedGrade === "ALL"
			? matrix
			: matrix.filter((m: StudentCapabilityMatrixItem) => m.gradeName.includes(selectedGrade))

	if (ayLoading || matrixLoading) return <PageLoader />

	return (
		<div className="space-y-6 animate-in fade-in">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
				<div>
					<h2 className="text-xl font-bold text-slate-900 tracking-tight">
						Matriks Kesanggupan: T.A <span className="text-[var(--primary)]">{currentAy.year}</span> ({currentAy.semester})
					</h2>
					<p className="text-xs text-slate-500 mt-1">
						Atur tingkat kesanggupan pembiayaan, diskon beasiswa, dan terbitkan tagihan santri
					</p>
				</div>
				<div className="flex flex-wrap items-center gap-2">
					<button
						type="button"
						onClick={() => navigate({ to: "/student-capabilities" as any })}
						className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
					>
						<ArrowLeft className="w-4 h-4" /> Kembali
					</button>
					<button
						type="button"
						onClick={() => setShowMassDiscountModal(true)}
						className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100 font-semibold rounded-xl text-xs transition-colors"
					>
						<Sparkles className="w-4 h-4 text-amber-600" />
						Beasiswa Massal
					</button>
					<button
						type="button"
						onClick={() => setShowPublishModal(true)}
						className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[var(--primary)] text-white hover:bg-pink-700 font-semibold rounded-xl text-xs transition-colors shadow-xs"
					>
						<Send className="w-4 h-4" />
						Terbitkan Tagihan Massal
					</button>
				</div>
			</div>

			{/* Summary Cards */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				{summaryItems.map((item: any) => (
					<RojaCard key={item.id} className="p-4 bg-white border border-slate-200/80 rounded-2xl space-y-2">
						<div className="flex items-center justify-between">
							<span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 font-mono">
								{item.code}
							</span>
							<span className="text-[11px] text-slate-400 font-medium">{item.termName}</span>
						</div>
						<h4 className="font-bold text-slate-900 text-xs">{item.name}</h4>
						<div className="text-base font-bold text-emerald-700">
							Rp {item.amount.toLocaleString("id-ID")}
						</div>
					</RojaCard>
				))}
			</div>

			{/* Matrix Datatable */}
			<RojaCard className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
				<div className="p-4 border-b border-slate-100 flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Filter className="w-4 h-4 text-slate-400" />
						<span className="text-xs text-slate-500 font-medium">Filter Tingkat:</span>
						{["ALL", "Kelas 7", "Kelas 10"].map((gr) => (
							<button
								key={gr}
								type="button"
								onClick={() => setSelectedGrade(gr)}
								className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
									selectedGrade === gr
										? "bg-[var(--primary)] text-white"
										: "bg-slate-100 text-slate-600 hover:bg-slate-200"
								}`}
							>
								{gr}
							</button>
						))}
					</div>
				</div>

				<div className="overflow-x-auto">
					<table className="w-full text-left text-xs">
						<thead className="bg-slate-100/70 text-slate-600 font-semibold border-b border-slate-200/60">
							<tr>
								<th className="p-3.5">NIS</th>
								<th className="p-3.5">Nama Lengkap Santri</th>
								<th className="p-3.5">Kelas</th>
								<th className="p-3.5 text-center">SPP Syahriah (Diskon/Final)</th>
								<th className="p-3.5 text-center">Uang Pangkal (Diskon/Final)</th>
								<th className="p-3.5 text-center">Seragam & Kitab (Diskon/Final)</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100 text-slate-700">
							{filteredMatrix.map((row: StudentCapabilityMatrixItem) => (
								<tr key={row.studentId} className="hover:bg-slate-50/80 transition-colors">
									<td className="p-3.5 font-mono font-medium text-slate-900">{row.nis}</td>
									<td className="p-3.5 font-bold text-slate-900">{row.fullName}</td>
									<td className="p-3.5 font-semibold text-emerald-700">{row.gradeName}</td>
									{row.capabilities.map((cap) => (
										<td key={cap.costItemId} className="p-3.5 text-center">
											<button
												type="button"
												onClick={() =>
													setEditingCell({
														studentId: row.studentId,
														costItemId: cap.costItemId,
														discount: cap.discountPercent,
													})
												}
												className={`px-3 py-1 rounded-xl border text-xs font-semibold transition-colors ${
													cap.discountPercent > 0
														? "bg-amber-50 border-amber-200 text-amber-900"
														: "bg-slate-50 border-slate-200 text-slate-700"
												}`}
											>
												Rp {cap.finalAmount.toLocaleString("id-ID")}
											</button>
										</td>
									))}
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</RojaCard>
		</div>
	)
}
