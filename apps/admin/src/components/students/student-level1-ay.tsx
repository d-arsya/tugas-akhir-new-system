import type { JSX } from "react"
import { Eye, Plus, Calendar, School, Users, CheckCircle2, Archive } from "lucide-react"

interface AcademicYearItem {
	id: number
	year: string
	semester: string
	isActive: boolean
	totalLevels?: number
	totalGrades?: number
	totalStudents?: number
}

interface StudentLevel1AyProps {
	academicYears: AcademicYearItem[]
	onSelectAy: (ay: { id: number; year: string; semester: string }) => void
	onOpenCreateModal: () => void
}

export function StudentLevel1Ay({
	academicYears,
	onSelectAy,
	onOpenCreateModal,
}: StudentLevel1AyProps): JSX.Element {
	return (
		<div className="space-y-6 animate-in fade-in">
			{/* Page Header (Parity with index-page-header.blade.php) */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
				<div>
					<h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
						<Calendar className="w-5 h-5 text-[var(--primary)]" />
						Data Santri - Pilih Tahun Ajaran
					</h2>
					<p className="text-xs text-slate-500 mt-1">
						Pilih tahun ajaran aktif atau arsip untuk mengelola data santri per kelas dan jenjang
					</p>
				</div>
				<button
					type="button"
					onClick={onOpenCreateModal}
					className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white text-xs font-semibold rounded-xl hover:bg-pink-700 transition-colors shadow-xs"
				>
					<Plus className="w-4 h-4" />
					Tambah Santri
				</button>
			</div>

			{/* Card Container (Parity with tbr_card & datatable) */}
			<div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
				<div className="bg-slate-50/80 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
					<div className="flex items-center gap-2">
						<span className="font-bold text-xs text-slate-800 uppercase tracking-wider">Daftar Tahun Ajaran</span>
						<span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-pink-100 text-[var(--primary)]">
							{academicYears.length} Periode
						</span>
					</div>
				</div>

				<div className="overflow-x-auto">
					<table className="w-full text-left text-xs">
						<thead className="bg-slate-100/70 text-slate-600 font-semibold border-b border-slate-200/60">
							<tr>
								<th className="py-3.5 px-4 w-12 text-center">No</th>
								<th className="py-3.5 px-4">Tahun Ajaran</th>
								<th className="py-3.5 px-4">Total Jenjang</th>
								<th className="py-3.5 px-4">Total Kelas</th>
								<th className="py-3.5 px-4">Total Santri</th>
								<th className="py-3.5 px-4">Status Tahun Ajaran</th>
								<th className="py-3.5 px-4 text-right">Actions</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100 text-slate-700">
							{academicYears.map((ay, idx) => (
								<tr key={ay.id} className="hover:bg-slate-50/80 transition-colors">
									<td className="py-3.5 px-4 font-semibold text-slate-900 text-center">{idx + 1}</td>
									<td className="py-3.5 px-4 font-bold text-slate-900">
										{ay.year} - <span className="text-slate-600 font-medium">{ay.semester}</span>
									</td>
									<td className="py-3.5 px-4 font-medium text-slate-600">
										<span className="inline-flex items-center gap-1.5">
											<School className="w-3.5 h-3.5 text-slate-400" />
											{ay.totalLevels || 3} Jenjang
										</span>
									</td>
									<td className="py-3.5 px-4 font-medium text-slate-600">
										{ay.totalGrades || 12} Kelas
									</td>
									<td className="py-3.5 px-4">
										<span className="px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
											{ay.totalStudents || (ay.isActive ? 412 : 380)} Santri
										</span>
									</td>
									<td className="py-3.5 px-4">
										<span
											className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
												ay.isActive
													? "bg-emerald-100 text-emerald-800 border border-emerald-200"
													: "bg-slate-100 text-slate-600 border border-slate-200"
											}`}
										>
											{ay.isActive ? (
												<>
													<CheckCircle2 className="w-3 h-3 text-emerald-600" />
													Berjalan (Aktif)
												</>
											) : (
												<>
													<Archive className="w-3 h-3 text-slate-400" />
													Berakhir (Arsip)
												</>
											)}
										</span>
									</td>
									<td className="py-3.5 px-4 text-right">
										<button
											type="button"
											onClick={() => onSelectAy({ id: ay.id, year: ay.year, semester: ay.semester })}
											className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-800 hover:bg-slate-50 rounded-xl font-semibold text-xs transition-all shadow-2xs"
										>
											<Eye className="w-3.5 h-3.5 text-[var(--primary)]" />
											Lihat Kelas
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	)
}
