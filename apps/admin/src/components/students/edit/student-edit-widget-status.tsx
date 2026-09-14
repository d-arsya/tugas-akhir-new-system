import type { JSX } from "react"
import { Save, Printer, ArrowUpCircle, ArrowDownCircle, LogOut, CheckCircle2 } from "lucide-react"

interface StudentEditWidgetStatusProps {
	student: any
	onSave: () => void
	onPrintPdf: () => void
}

export function StudentEditWidgetStatus({
	student,
	onSave,
	onPrintPdf,
}: StudentEditWidgetStatusProps): JSX.Element {
	return (
		<div className="space-y-4">
			{/* Widget Note / Dropout Reason */}
			<div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 space-y-2">
				<span className="font-bold text-xs text-slate-800 uppercase tracking-wider block">
					Catatan / Histori Santri
				</span>
				<textarea
					rows={3}
					placeholder="Catatan tambahan, histori mutasi, atau alasan keluar santri..."
					defaultValue={student?.note || ""}
					className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-[var(--secondary)] outline-hidden"
				/>
			</div>

			{/* Widget Status & Actions */}
			<div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
				<div>
					<span className="font-bold text-xs text-slate-800 uppercase tracking-wider block mb-2">
						Status KBM Santri
					</span>
					<div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
						<CheckCircle2 className="w-4 h-4 text-emerald-600" />
						<div>
							<span className="font-bold text-xs text-emerald-900 block">Status KBM: Active</span>
							<span className="text-[10px] text-emerald-700 font-medium">Terdaftar KBM Aktif</span>
						</div>
					</div>
				</div>

				<div className="border-t border-slate-100 pt-3 space-y-2 text-xs">
					<span className="font-bold text-slate-700 block mb-1">Aksi Mutasi & Kelulusan</span>
					<div className="grid grid-cols-1 gap-2">
						<button
							type="button"
							onClick={() => alert("Menaikkan kelas santri ini...")}
							className="inline-flex items-center justify-center gap-1.5 w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors shadow-2xs"
						>
							<ArrowUpCircle className="w-3.5 h-3.5" />
							Naik Kelas
						</button>
						<button
							type="button"
							onClick={() => alert("Menandai santri tinggal kelas...")}
							className="inline-flex items-center justify-center gap-1.5 w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl transition-colors shadow-2xs"
						>
							<ArrowDownCircle className="w-3.5 h-3.5" />
							Tinggal Kelas
						</button>
						<button
							type="button"
							onClick={() => alert("Proses santri keluar / dropout...")}
							className="inline-flex items-center justify-center gap-1.5 w-full py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-semibold rounded-xl transition-colors"
						>
							<LogOut className="w-3.5 h-3.5" />
							Santri Keluar (DO)
						</button>
					</div>
				</div>

				{/* Primary Form Submissions */}
				<div className="border-t border-slate-100 pt-3 space-y-2">
					<button
						type="button"
						onClick={onPrintPdf}
						className="inline-flex items-center justify-center gap-2 w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
					>
						<Printer className="w-4 h-4 text-slate-500" />
						Cetak Profil PDF
					</button>
					<button
						type="button"
						onClick={onSave}
						className="inline-flex items-center justify-center gap-2 w-full py-2.5 bg-[var(--primary)] hover:bg-pink-700 text-white font-bold rounded-xl text-xs transition-colors shadow-xs"
					>
						<Save className="w-4 h-4" />
						Simpan Perubahan
					</button>
				</div>
			</div>
		</div>
	)
}
