import type { JSX } from "react"
import { ArrowUpCircle, ArrowDownCircle, Layers, BookOpen, UserCheck, GraduationCap, Check } from "lucide-react"

interface StudentBulkActionsProps {
	selectedCount: number
	isMaxGrade: boolean
	majors: Array<{ id: number; name: string }>
	subGrades: Array<{ id: number; name: string }>
	onPromote: () => void
	onRetain: () => void
	onGraduate: () => void
	onChangeMajor: (majorId: number) => void
	onChangeSubGrade: (subGradeId: number) => void
	onChangeAccountStatus: (isBlocked: boolean) => void
}

export function StudentBulkActions({
	selectedCount,
	isMaxGrade,
	majors,
	subGrades,
	onPromote,
	onRetain,
	onGraduate,
	onChangeMajor,
	onChangeSubGrade,
	onChangeAccountStatus,
}: StudentBulkActionsProps): JSX.Element | null {
	if (selectedCount === 0) return null

	return (
		<div className="bg-slate-900 text-white p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-lg animate-in fade-in border border-slate-800">
			<div className="flex items-center gap-2.5 text-xs font-semibold pl-2">
				<span className="w-6 h-6 rounded-full bg-[var(--primary)] text-white flex items-center justify-center text-xs font-bold">
					{selectedCount}
				</span>
				<span className="text-slate-200">Santri Terpilih</span>
			</div>

			<div className="flex flex-wrap items-center gap-2 text-xs">
				{isMaxGrade ? (
					<button
						type="button"
						onClick={onGraduate}
						className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl transition-colors shadow-2xs"
					>
						<GraduationCap className="w-3.5 h-3.5" />
						Kelulusan Alumni
					</button>
				) : (
					<button
						type="button"
						onClick={onPromote}
						className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition-colors shadow-2xs"
					>
						<ArrowUpCircle className="w-3.5 h-3.5" />
						Naik Kelas
					</button>
				)}

				<button
					type="button"
					onClick={onRetain}
					className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-xl transition-colors shadow-2xs"
				>
					<ArrowDownCircle className="w-3.5 h-3.5" />
					Tinggal Kelas
				</button>

				{/* Jurusan Dropdown Quick Trigger */}
				<div className="flex items-center bg-slate-800 rounded-xl p-0.5 border border-slate-700">
					<select
						id="bulkMajorSelect"
						defaultValue=""
						className="bg-transparent text-slate-200 text-xs px-2 py-1 focus:outline-hidden cursor-pointer"
					>
						<option value="" disabled className="bg-slate-900 text-slate-300">
							Pilih Jurusan
						</option>
						{majors.map((m) => (
							<option key={m.id} value={m.id} className="bg-slate-900 text-slate-200">
								{m.name}
							</option>
						))}
					</select>
					<button
						type="button"
						onClick={() => {
							const el = document.getElementById("bulkMajorSelect") as HTMLSelectElement
							if (el && el.value) onChangeMajor(Number(el.value))
						}}
						title="Terapkan Jurusan"
						className="p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors ml-1"
					>
						<Check className="w-3.5 h-3.5" />
					</button>
				</div>

				{/* Subkelas Dropdown Quick Trigger */}
				<div className="flex items-center bg-slate-800 rounded-xl p-0.5 border border-slate-700">
					<select
						id="bulkSubGradeSelect"
						defaultValue=""
						className="bg-transparent text-slate-200 text-xs px-2 py-1 focus:outline-hidden cursor-pointer"
					>
						<option value="" disabled className="bg-slate-900 text-slate-300">
							Pilih Rombel Subkelas
						</option>
						{subGrades.map((sub) => (
							<option key={sub.id} value={sub.id} className="bg-slate-900 text-slate-200">
								{sub.name}
							</option>
						))}
					</select>
					<button
						type="button"
						onClick={() => {
							const el = document.getElementById("bulkSubGradeSelect") as HTMLSelectElement
							if (el && el.value) onChangeSubGrade(Number(el.value))
						}}
						title="Terapkan Subkelas"
						className="p-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg transition-colors ml-1"
					>
						<Check className="w-3.5 h-3.5" />
					</button>
				</div>

				{/* Status Akun Quick Trigger */}
				<div className="flex items-center bg-slate-800 rounded-xl p-0.5 border border-slate-700">
					<select
						id="bulkStatusSelect"
						defaultValue=""
						className="bg-transparent text-slate-200 text-xs px-2 py-1 focus:outline-hidden cursor-pointer"
					>
						<option value="" disabled className="bg-slate-900 text-slate-300">
							Status Akun
						</option>
						<option value="0" className="bg-slate-900 text-slate-200">
							Aktif
						</option>
						<option value="1" className="bg-slate-900 text-slate-200">
							Nonaktif / Blokir
						</option>
					</select>
					<button
						type="button"
						onClick={() => {
							const el = document.getElementById("bulkStatusSelect") as HTMLSelectElement
							if (el && el.value !== "") onChangeAccountStatus(el.value === "1")
						}}
						title="Terapkan Status Akun"
						className="p-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors ml-1"
					>
						<UserCheck className="w-3.5 h-3.5" />
					</button>
				</div>
			</div>
		</div>
	)
}
