import type { JSX } from "react"
import { useState } from "react"
import { Link } from "@tanstack/react-router"
import { Users, ArrowLeft, FileSpreadsheet, Plus, Search, Filter, Eye, CheckSquare, Square, MoreHorizontal, User } from "lucide-react"
import { Input } from "@roja/ui"

interface StudentLevel3RosterProps {
	academicYear: { id: number; year: string; semester: string }
	selectedGrade: { id: number; name: string; level: string }
	students: any[]
	subGrades: any[]
	selectedIds: number[]
	search: string
	subGradeFilter: string
	onSearchChange: (search: string) => void
	onSubGradeFilterChange: (sub: string) => void
	onSelectAll: () => void
	onToggleSelectOne: (id: number) => void
	onBackToGrades: () => void
	onOpenExcelModal: () => void
	onOpenCreateModal: () => void
}

export function StudentLevel3Roster({
	academicYear,
	selectedGrade,
	students,
	subGrades,
	selectedIds,
	search,
	subGradeFilter,
	onSearchChange,
	onSubGradeFilterChange,
	onSelectAll,
	onToggleSelectOne,
	onBackToGrades,
	onOpenExcelModal,
	onOpenCreateModal,
}: StudentLevel3RosterProps): JSX.Element {
	const [perPage, setPerPage] = useState("10")
	const [activeDropdownNoteId, setActiveDropdownNoteId] = useState<number | null>(null)

	// Filtered students by search & subgrade
	const filteredStudents = students.filter((s) => {
		const matchesSearch =
			!search ||
			s.fullName?.toLowerCase().includes(search.toLowerCase()) ||
			s.nis?.includes(search)
		const matchesSubGrade =
			!subGradeFilter || subGradeFilter === "ALL" || s.subGradeName === subGradeFilter
		return matchesSearch && matchesSubGrade
	})

	const allSelected =
		filteredStudents.length > 0 && selectedIds.length === filteredStudents.length

	return (
		<div className="space-y-6 animate-in fade-in">
			{/* Page Header (Parity with listing-student/page-header.blade.php & card-header.blade.php) */}
			<div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
				<div>
					<div className="flex items-center gap-2">
						<h2 className="text-xl font-bold text-slate-900 tracking-tight">
							Santri Kelas <span className="text-[var(--primary)]">{selectedGrade.name}</span>
						</h2>
						<span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-pink-100 text-[var(--primary)] border border-pink-200">
							{filteredStudents.length} Santri
						</span>
					</div>
					<p className="text-xs text-slate-500 mt-1">
						Data santri Kelas {selectedGrade.name} jenjang {selectedGrade.level} pada tahun ajaran {academicYear.year}
					</p>
				</div>

				<div className="flex flex-wrap items-center gap-2">
					<button
						type="button"
						onClick={onBackToGrades}
						className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
					>
						<ArrowLeft className="w-4 h-4" />
						Kembali
					</button>
					<button
						type="button"
						onClick={onOpenExcelModal}
						className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100 font-semibold rounded-xl text-xs transition-colors"
					>
						<FileSpreadsheet className="w-4 h-4 text-emerald-600" />
						Import / Export
					</button>
					<button
						type="button"
						onClick={onOpenCreateModal}
						className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[var(--primary)] hover:bg-pink-700 text-white font-semibold rounded-xl text-xs transition-colors shadow-xs"
					>
						<Plus className="w-4 h-4" />
						Tambah Santri
					</button>
				</div>
			</div>

			{/* Datatable Tools (Parity with datatable-tools.blade.php) */}
			<div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
				<div className="flex items-center gap-2 w-full md:w-auto text-xs">
					<span className="text-slate-500 font-medium">Tampilkan:</span>
					<select
						value={perPage}
						onChange={(e) => setPerPage(e.target.value)}
						className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 focus:outline-hidden"
					>
						<option value="10">10 santri / hal</option>
						<option value="25">25 santri / hal</option>
						<option value="50">50 santri / hal</option>
						<option value="100">100 santri / hal</option>
					</select>
				</div>

				<div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
					<div className="flex items-center gap-2 text-xs w-full sm:w-auto">
						<Filter className="w-4 h-4 text-slate-400" />
						<select
							value={subGradeFilter}
							onChange={(e) => onSubGradeFilterChange(e.target.value)}
							className="w-full sm:w-auto px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-hidden"
						>
							<option value="ALL">Semua Subkelas / Rombel</option>
							{subGrades.map((sub) => (
								<option key={sub.id} value={sub.name}>
									Subkelas {sub.name}
								</option>
							))}
						</select>
					</div>

					<div className="w-full sm:w-64">
						<Input
							type="text"
							placeholder="Cari NISP / Nama Santri..."
							value={search}
							onChange={(e) => onSearchChange(e.target.value)}
							className="w-full bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-[var(--secondary)]"
						/>
					</div>
				</div>
			</div>

			{/* Datatable Table Container (Parity with tbr_student_table) */}
			<div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full text-left text-xs min-w-[1100px]">
						<thead className="bg-slate-100/70 text-slate-600 font-semibold border-b border-slate-200/60">
							<tr>
								<th className="py-3.5 px-3 w-10 text-center">
									<button
										type="button"
										onClick={onSelectAll}
										className="text-slate-400 hover:text-slate-700 transition-colors"
									>
										{allSelected ? (
											<CheckSquare className="w-4 h-4 text-[var(--primary)]" />
										) : (
											<Square className="w-4 h-4" />
										)}
									</button>
								</th>
								<th className="py-3.5 px-3 w-10 text-center">No</th>
								<th className="py-3.5 px-3 w-12 text-center">Foto</th>
								<th className="py-3.5 px-3 w-28">NISP</th>
								<th className="py-3.5 px-3">Nama Lengkap Santri</th>
								<th className="py-3.5 px-3 w-28">Tgl Lahir</th>
								<th className="py-3.5 px-3">Orang Tua</th>
								<th className="py-3.5 px-3 w-24">Jurusan</th>
								<th className="py-3.5 px-3 w-24">Subkelas</th>
								<th className="py-3.5 px-3 w-36">Keterangan</th>
								<th className="py-3.5 px-3 w-28">S. Account</th>
								<th className="py-3.5 px-3 w-20 text-right">Actions</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100 text-slate-700">
							{filteredStudents.length === 0 ? (
								<tr>
									<td colSpan={12} className="py-12 text-center text-slate-400">
										Tidak ada data santri yang sesuai filter.
									</td>
								</tr>
							) : (
								filteredStudents.map((item, idx) => {
									const isSelected = selectedIds.includes(item.id)
									const isBlocked = item.isBlocked || item.status === "INACTIVE"

									return (
										<tr
											key={item.id}
											className={`transition-colors ${
												isSelected ? "bg-pink-50/50" : "hover:bg-slate-50/80"
											}`}
										>
											<td className="py-3 px-3 text-center">
												<button
													type="button"
													onClick={() => onToggleSelectOne(item.id)}
													className="text-slate-400 hover:text-slate-700"
												>
													{isSelected ? (
														<CheckSquare className="w-4 h-4 text-[var(--primary)]" />
													) : (
														<Square className="w-4 h-4" />
													)}
												</button>
											</td>
											<td className="py-3 px-3 font-semibold text-slate-900 text-center">
												{idx + 1}
											</td>
											<td className="py-3 px-3 text-center">
												<div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 mx-auto flex items-center justify-center overflow-hidden text-slate-400">
													{item.avatarUrl ? (
														<img
															src={item.avatarUrl}
															alt={item.fullName}
															className="w-full h-full object-cover"
														/>
													) : (
														<User className="w-4 h-4" />
													)}
												</div>
											</td>
											<td className="py-3 px-3 font-mono font-medium text-slate-900">
												{item.nis || `202607${item.id}`}
												<div className="text-[10px] text-slate-400">{item.nisn || "0081234567"}</div>
											</td>
											<td className="py-3 px-3 font-bold text-slate-900">
												{item.fullName}
											</td>
											<td className="py-3 px-3 font-medium text-slate-600">
												{item.dob || "15-08-2010"}
											</td>
											<td className="py-3 px-3 font-medium text-slate-700">
												{item.fatherName || item.motherName || "Bpk. Abdullah"}
											</td>
											<td className="py-3 px-3 font-medium text-slate-600">
												{item.majorName || "Reguler"}
											</td>
											<td className="py-3 px-3 font-semibold text-emerald-700">
												{item.subGradeName || "7-A (Putra)"}
											</td>

											{/* Status KBM / Keterangan with Dot Parity */}
											<td className="py-3 px-3 relative">
												<div className="flex items-center gap-1.5">
													<span
														className={`w-2 h-2 rounded-full ${
															item.status === "ACTIVE" ? "bg-emerald-500" : "bg-red-500"
														}`}
														title={`Status KBM: ${item.status === "ACTIVE" ? "Active" : "Deactive"}`}
													/>
													<span
														className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
															item.gradeNote === "naik kelas"
																? "bg-emerald-100 text-emerald-800 border border-emerald-200"
																: item.gradeNote === "tinggal kelas"
																	? "bg-amber-100 text-amber-800 border border-amber-200"
																	: item.gradeNote === "keluar"
																		? "bg-red-100 text-red-800 border border-red-200"
																		: item.gradeNote === "lulus"
																			? "bg-purple-100 text-purple-800 border border-purple-200"
																			: "bg-pink-100 text-[var(--primary)] border border-pink-200"
														}`}
													>
														{item.gradeNote || "Pendaftaran"}
													</span>

													{item.gradeNote === "keluar" && (
														<button
															type="button"
															onClick={() =>
																setActiveDropdownNoteId(
																	activeDropdownNoteId === item.id ? null : item.id
																)
															}
															className="p-1 hover:bg-slate-100 rounded-md text-red-500"
														>
															<MoreHorizontal className="w-3.5 h-3.5" />
														</button>
													)}

													{/* Dropdown Note popup */}
													{activeDropdownNoteId === item.id && (
														<div className="absolute top-10 right-0 bg-white border border-slate-200 shadow-xl rounded-xl p-3 z-20 w-48 text-[11px] animate-in fade-in">
															<p className="font-bold text-slate-900 mb-1">{item.fullName}</p>
															<p className="text-slate-600">Alasan: Mutasi mandiri / pindah domisili orang tua.</p>
														</div>
													)}
												</div>
											</td>

											{/* Status Akun S. Account */}
											<td className="py-3 px-3">
												<span
													className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
														!isBlocked
															? "bg-emerald-100 text-emerald-800 border border-emerald-200"
															: "bg-slate-100 text-slate-500 border border-slate-200"
													}`}
												>
													{!isBlocked ? "Active" : "Deactive"}
												</span>
											</td>

											<td className="py-3 px-3 text-right">
												<Link
													to={"/students/$id" as any}
													params={{ id: String(item.id) } as any}
													className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg font-semibold text-[11px] transition-colors"
												>
													<Eye className="w-3.5 h-3.5 text-[var(--primary)]" />
													Detail
												</Link>
											</td>
										</tr>
									)
								})
							)}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	)
}
