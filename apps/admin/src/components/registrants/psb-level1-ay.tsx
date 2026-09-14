import type { JSX } from "react"
import { Eye, Plus, Calendar, FileCheck, CheckCircle2, XCircle, Clock } from "lucide-react"

interface PsbLevel1AyProps {
	academicYears: any[]
	onSelectAy: (ay: { id: number; year: string; semester: string }) => void
	onOpenCreate: () => void
}

export function PsbLevel1Ay({ academicYears, onSelectAy, onOpenCreate }: PsbLevel1AyProps): JSX.Element {
	return (
		<div className="space-y-6 animate-in fade-in">
			{/* Page Header (Parity with registrant/partials/index-page-header.blade.php) */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
				<div>
					<h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
						<FileCheck className="w-5 h-5 text-[var(--primary)]" />
						Data PSB (Penerimaan Santri Baru) - Pilih Periode
					</h2>
					<p className="text-xs text-slate-500 mt-1">
						Pilih tahun ajaran gelombang pendaftaran untuk memverifikasi dan menyetujui calon santri
					</p>
				</div>
				<button
					type="button"
					onClick={onOpenCreate}
					className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white text-xs font-semibold rounded-xl hover:bg-pink-700 transition-colors shadow-xs self-start sm:self-auto"
				>
					<Plus className="w-4 h-4" />
					Tambah Calon Santri
				</button>
			</div>

			{/* Datatable Card (Parity with registrant/index.blade.php) */}
			<div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
				<div className="bg-slate-50/80 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
					<div className="flex items-center gap-2">
						<span className="font-bold text-xs text-slate-800 uppercase tracking-wider">Gelombang Registrasi PSB</span>
						<span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-pink-100 text-[var(--primary)]">
							{academicYears.length} Gelombang
						</span>
					</div>
				</div>

				<div className="overflow-x-auto">
					<table className="w-full text-left text-xs">
						<thead className="bg-slate-100/70 text-slate-600 font-semibold border-b border-slate-200/60">
							<tr>
								<th className="py-3.5 px-4 w-12 text-center">No</th>
								<th className="py-3.5 px-4">Tahun Ajaran</th>
								<th className="py-3.5 px-4">Total Pendaftar</th>
								<th className="py-3.5 px-4">Reguler</th>
								<th className="py-3.5 px-4">Indent</th>
								<th className="py-3.5 px-4">Diterima</th>
								<th className="py-3.5 px-4">Tidak Diterima</th>
								<th className="py-3.5 px-4">Status PSB</th>
								<th className="py-3.5 px-4 text-right">Actions</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100 text-slate-700">
							{academicYears.map((ay, idx) => {
								const total = ay.totalRegistrants || 68
								const regular = Math.floor(total * 0.7)
								const indent = total - regular
								const approved = Math.floor(total * 0.6)
								const rejected = Math.floor(total * 0.1)

								return (
									<tr key={ay.id} className="hover:bg-slate-50/80 transition-colors">
										<td className="py-3.5 px-4 font-semibold text-slate-900 text-center">{idx + 1}</td>
										<td className="py-3.5 px-4 font-bold text-slate-900">
											{ay.year} - <span className="text-slate-600 font-medium">{ay.semester}</span>
										</td>
										<td className="py-3.5 px-4">
											<span className="px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
												{total} Pendaftar
											</span>
										</td>
										<td className="py-3.5 px-4 font-medium text-slate-700">{regular} Santri</td>
										<td className="py-3.5 px-4 font-medium text-slate-700">{indent} Santri</td>
										<td className="py-3.5 px-4">
											<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
												<CheckCircle2 className="w-3 h-3 text-emerald-600" />
												{approved} Diterima
											</span>
										</td>
										<td className="py-3.5 px-4">
											<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">
												<XCircle className="w-3 h-3 text-red-600" />
												{rejected} Ditolak
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
												<Clock className="w-3 h-3" />
												{ay.isActive ? "Pendaftaran Buka" : "Pendaftaran Tutup"}
											</span>
										</td>
										<td className="py-3.5 px-4 text-right">
											<button
												type="button"
												onClick={() => onSelectAy({ id: ay.id, year: ay.year, semester: ay.semester })}
												className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-800 hover:bg-slate-50 rounded-xl font-semibold text-xs transition-all shadow-2xs"
											>
												<Eye className="w-3.5 h-3.5 text-[var(--primary)]" />
												Workbench PSB
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
