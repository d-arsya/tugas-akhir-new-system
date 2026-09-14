import type { JSX } from "react"
import { Users, ArrowLeft, Layers, FileSpreadsheet, Eye } from "lucide-react"

interface GradeItem {
	id: number
	name: string
	levelName?: string
	subGrades?: any[]
	totalStudents?: number
	activeCount?: number
	promotedCount?: number
	retainedCount?: number
}

interface StudentLevel2GradeProps {
	academicYear: { id: number; year: string; semester: string }
	grades: GradeItem[]
	onSelectGrade: (grade: { id: number; name: string; level: string }) => void
	onBackToAy: () => void
	onOpenImportModal: () => void
}

export function StudentLevel2Grade({
	academicYear,
	grades,
	onSelectGrade,
	onBackToAy,
	onOpenImportModal,
}: StudentLevel2GradeProps): JSX.Element {
	return (
		<div className="space-y-6 animate-in fade-in">
			{/* Header (Parity with grade-page-header.blade.php) */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
				<div>
					<h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
						<Layers className="w-5 h-5 text-[var(--primary)]" />
						Data Santri - Pilih Kelas (T.A {academicYear.year})
					</h2>
					<p className="text-xs text-slate-500 mt-1">
						Pilih kelas untuk melihat roster santri, kartu SPP, serta mutasi rombel dan kenaikan kelas
					</p>
				</div>
				<div className="flex items-center gap-2 self-start sm:self-auto">
					<button
						type="button"
						onClick={onBackToAy}
						className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl font-semibold text-xs transition-colors"
					>
						<ArrowLeft className="w-4 h-4" />
						Kembali ke T.A
					</button>
					<button
						type="button"
						onClick={onOpenImportModal}
						className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100 rounded-xl font-semibold text-xs transition-colors"
					>
						<FileSpreadsheet className="w-4 h-4 text-emerald-600" />
						Import Excel
					</button>
				</div>
			</div>

			{/* Card Container (Parity with grade-card-header.blade.php) */}
			<div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
				<div className="bg-slate-50/80 px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
					<div>
						<div className="flex items-center gap-2">
							<span className="font-bold text-sm text-slate-900">Daftar Kelas Akademik</span>
							<span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-pink-100 text-[var(--primary)]">
								{grades.length} Kelas Terdaftar
							</span>
						</div>
						<p className="text-xs text-slate-500 mt-0.5">
							Ringkasan status KBM, statistik kenaikan kelas, dan penanganan santri mengulang per kelas
						</p>
					</div>
				</div>

				<div className="overflow-x-auto">
					<table className="w-full text-left text-xs">
						<thead className="bg-slate-100/70 text-slate-600 font-semibold border-b border-slate-200/60">
							<tr>
								<th className="py-3.5 px-4 w-12 text-center">No</th>
								<th className="py-3.5 px-4">Kelas</th>
								<th className="py-3.5 px-4">Jenjang</th>
								<th className="py-3.5 px-4">Total Santri</th>
								<th className="py-3.5 px-4">KBM Active</th>
								<th className="py-3.5 px-4">Naik Kelas</th>
								<th className="py-3.5 px-4">Tinggal Kelas</th>
								<th className="py-3.5 px-4 text-right">Actions</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100 text-slate-700">
							{grades.map((g, idx) => {
								const level = g.levelName || "Tsanawiyah"
								const total = g.totalStudents || (g.subGrades?.length ? g.subGrades.length * 28 : 32)
								const active = g.activeCount || Math.floor(total * 0.9)
								const promoted = g.promotedCount || 0
								const retained = g.retainedCount || 0

								return (
									<tr key={g.id} className="hover:bg-slate-50/80 transition-colors">
										<td className="py-3.5 px-4 font-semibold text-slate-900 text-center">{idx + 1}</td>
										<td className="py-3.5 px-4 font-bold text-slate-900">{g.name}</td>
										<td className="py-3.5 px-4 font-semibold text-emerald-700">{level}</td>
										<td className="py-3.5 px-4">
											<span className="px-2.5 py-1 rounded-md text-xs font-bold bg-pink-50 text-[var(--primary)] border border-pink-100">
												{total} Santri
											</span>
										</td>
										<td className="py-3.5 px-4">
											<span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
												{active} Aktif
											</span>
										</td>
										<td className="py-3.5 px-4 font-medium text-slate-600">
											{promoted > 0 ? (
												<span className="text-emerald-600 font-bold">{promoted} Santri</span>
											) : (
												"-"
											)}
										</td>
										<td className="py-3.5 px-4 font-medium text-slate-600">
											{retained > 0 ? (
												<span className="text-amber-600 font-bold">{retained} Santri</span>
											) : (
												"-"
											)}
										</td>
										<td className="py-3.5 px-4 text-right">
											<button
												type="button"
												onClick={() =>
													onSelectGrade({
														id: g.id,
														name: g.name,
														level,
													})
												}
												className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--primary)] text-white hover:bg-pink-700 rounded-xl font-semibold text-xs transition-colors shadow-2xs"
											>
												<Users className="w-3.5 h-3.5" />
												Daftar Santri
											</button>
										</td>
									</tr>
								)
							})}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	)
}
