import type { JSX } from "react"
import { useState } from "react"
import { X, ArrowUpCircle, ArrowDownCircle, Users, FileSpreadsheet, Download, Upload, CheckCircle2 } from "lucide-react"
import { Input } from "@roja/ui"

interface StudentModalsProps {
	showCreate: boolean
	showPromote: boolean
	showRetain: boolean
	showExcel: boolean
	selectedCount: number
	academicYears: any[]
	grades: any[]
	subGrades: any[]
	onCloseAll: () => void
	onConfirmCreate: (data: any) => void
	onConfirmPromote: (dto: { targetAcademicYearId: number; targetGradeId: number; targetSubGradeId: number }) => void
	onConfirmRetain: (dto: { targetAcademicYearId: number; targetSubGradeId: number }) => void
	onImportExcel: (file: File) => void
}

export function StudentModals({
	showCreate,
	showPromote,
	showRetain,
	showExcel,
	selectedCount,
	academicYears,
	grades,
	subGrades,
	onCloseAll,
	onConfirmCreate,
	onConfirmPromote,
	onConfirmRetain,
	onImportExcel,
}: StudentModalsProps): JSX.Element | null {
	const [createForm, setCreateForm] = useState({
		nis: "202607" + Math.floor(100 + Math.random() * 900),
		nisn: "008" + Math.floor(1000000 + Math.random() * 9000000),
		fullName: "",
		gender: "L",
		phone: "081234567890",
		pob: "Jakarta",
		dob: "2010-01-01",
	})

	const [selectedFile, setSelectedFile] = useState<File | null>(null)

	if (!showCreate && !showPromote && !showRetain && !showExcel) return null

	return (
		<div className="fixed inset-0 bg-slate-900/60 backdrop-blur-2xs z-50 flex items-center justify-center p-4">
			{/* Modal: Tambah Santri Baru Quick Form */}
			{showCreate && (
				<div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4 animate-in zoom-in-95 border border-slate-200">
					<div className="flex items-center justify-between border-b border-slate-100 pb-3">
						<h5 className="font-bold text-slate-900 text-sm flex items-center gap-2">
							<Users className="w-5 h-5 text-[var(--primary)]" />
							Pendaftaran Santri Baru (Quick Input)
						</h5>
						<button
							type="button"
							onClick={onCloseAll}
							className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
						>
							<X className="w-4 h-4" />
						</button>
					</div>

					<form
						onSubmit={(e) => {
							e.preventDefault()
							onConfirmCreate(createForm)
						}}
						className="space-y-3 text-xs"
					>
						<div className="grid grid-cols-2 gap-3">
							<div>
								<label className="font-semibold text-slate-700 block mb-1">NIS (NISP)</label>
								<Input
									type="text"
									value={createForm.nis}
									onChange={(e) => setCreateForm({ ...createForm, nis: e.target.value })}
									required
									className="w-full font-mono text-xs"
								/>
							</div>
							<div>
								<label className="font-semibold text-slate-700 block mb-1">NISN</label>
								<Input
									type="text"
									value={createForm.nisn}
									onChange={(e) => setCreateForm({ ...createForm, nisn: e.target.value })}
									required
									className="w-full font-mono text-xs"
								/>
							</div>
						</div>

						<div>
							<label className="font-semibold text-slate-700 block mb-1">Nama Lengkap Santri</label>
							<Input
								type="text"
								value={createForm.fullName}
								onChange={(e) => setCreateForm({ ...createForm, fullName: e.target.value })}
								required
								placeholder="Ahmad Fauzi"
								className="w-full text-xs"
							/>
						</div>

						<div>
							<label className="font-semibold text-slate-700 block mb-1">No. WhatsApp Wali / HP</label>
							<Input
								type="text"
								value={createForm.phone}
								onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
								required
								className="w-full font-mono text-xs"
							/>
						</div>
						<div className="grid grid-cols-2 gap-3">
							<div>
								<label className="font-semibold text-slate-700 block mb-1">Jenis Kelamin</label>
								<select
									value={createForm.gender}
									onChange={(e) => setCreateForm({ ...createForm, gender: e.target.value })}
									className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-[var(--secondary)] outline-hidden"
								>
									<option value="L">Laki-laki (Putra)</option>
									<option value="P">Perempuan (Putri)</option>
								</select>
							</div>
							<div>
								<label className="font-semibold text-slate-700 block mb-1">No. HP / WhatsApp</label>
								<Input
									type="text"
									value={createForm.phone}
									onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
									required
									className="w-full font-mono text-xs"
								/>
							</div>
						</div>

						<div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
							<button
								type="button"
								onClick={onCloseAll}
								className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
							>
								Batal
							</button>
							<button
								type="submit"
								className="px-4 py-2 bg-[var(--primary)] hover:bg-pink-700 text-white font-semibold rounded-xl shadow-xs"
							>
								Simpan Santri
							</button>
						</div>
					</form>
				</div>
			)}

			{/* Modal: Bulk Naik Kelas */}
			{showPromote && (
				<div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4 animate-in zoom-in-95 border border-slate-200">
					<div className="flex items-center justify-between border-b border-slate-100 pb-3">
						<h5 className="font-bold text-slate-900 text-sm flex items-center gap-2">
							<ArrowUpCircle className="w-5 h-5 text-emerald-600" />
							Kenaikan Kelas ({selectedCount} Santri Terpilih)
						</h5>
						<button
							type="button"
							onClick={onCloseAll}
							className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
						>
							<X className="w-4 h-4" />
						</button>
					</div>

					<div className="space-y-3 text-xs">
						<div>
							<label className="font-semibold text-slate-700 block mb-1">Tahun Akademik Tujuan</label>
							<select id="modalPromoteAy" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs">
								{academicYears.map((ay) => (
									<option key={ay.id} value={ay.id}>
										{ay.year} - {ay.semester}
									</option>
								))}
							</select>
						</div>
						<div>
							<label className="font-semibold text-slate-700 block mb-1">Kelas Tujuan Kenaikan</label>
							<select id="modalPromoteGrade" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs">
								{grades.map((g) => (
									<option key={g.id} value={g.id}>
										{g.name}
									</option>
								))}
							</select>
						</div>
						<div>
							<label className="font-semibold text-slate-700 block mb-1">Rombel Subkelas Tujuan</label>
							<select id="modalPromoteSubGrade" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs">
								{subGrades.map((sub) => (
									<option key={sub.id} value={sub.id}>
										{sub.name}
									</option>
								))}
							</select>
						</div>
					</div>

					<div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
						<button
							type="button"
							onClick={onCloseAll}
							className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs"
						>
							Batal
						</button>
						<button
							type="button"
							onClick={() => {
								const ayId = Number((document.getElementById("modalPromoteAy") as HTMLSelectElement).value)
								const gradeId = Number((document.getElementById("modalPromoteGrade") as HTMLSelectElement).value)
								const subId = Number((document.getElementById("modalPromoteSubGrade") as HTMLSelectElement).value)
								onConfirmPromote({ targetAcademicYearId: ayId, targetGradeId: gradeId, targetSubGradeId: subId })
							}}
							className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs shadow-xs"
						>
							Proses Naik Kelas
						</button>
					</div>
				</div>
			)}

			{/* Modal: Bulk Tinggal Kelas */}
			{showRetain && (
				<div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4 animate-in zoom-in-95 border border-slate-200">
					<div className="flex items-center justify-between border-b border-slate-100 pb-3">
						<h5 className="font-bold text-slate-900 text-sm flex items-center gap-2">
							<ArrowDownCircle className="w-5 h-5 text-amber-600" />
							Proses Tinggal Kelas ({selectedCount} Santri)
						</h5>
						<button
							type="button"
							onClick={onCloseAll}
							className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
						>
							<X className="w-4 h-4" />
						</button>
					</div>

					<div className="space-y-3 text-xs">
						<p className="text-slate-600 leading-relaxed">
							Santri yang ditandai tinggal kelas akan tetap berada pada tingkat kelas yang sama di tahun akademik berikutnya.
						</p>
						<div>
							<label className="font-semibold text-slate-700 block mb-1">Tahun Akademik Pengulangan</label>
							<select id="modalRetainAy" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs">
								{academicYears.map((ay) => (
									<option key={ay.id} value={ay.id}>
										{ay.year} - {ay.semester}
									</option>
								))}
							</select>
						</div>
					</div>

					<div className="flex justify-end gap-2 pt-3 border-t border-slate-100 text-xs">
						<button
							type="button"
							onClick={onCloseAll}
							className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
						>
							Batal
						</button>
						<button
							type="button"
							onClick={() => {
								const ayId = Number((document.getElementById("modalRetainAy") as HTMLSelectElement).value)
								onConfirmRetain({ targetAcademicYearId: ayId, targetSubGradeId: 101 })
							}}
							className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl shadow-xs"
						>
							Konfirmasi Tinggal Kelas
						</button>
					</div>
				</div>
			)}

			{/* Modal: Excel Import & Export Workbench */}
			{showExcel && (
				<div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4 animate-in zoom-in-95 border border-slate-200">
					<div className="flex items-center justify-between border-b border-slate-100 pb-3">
						<h5 className="font-bold text-slate-900 text-sm flex items-center gap-2">
							<FileSpreadsheet className="w-5 h-5 text-emerald-600" />
							Import & Export Data Santri (Excel)
						</h5>
						<button
							type="button"
							onClick={onCloseAll}
							className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
						>
							<X className="w-4 h-4" />
						</button>
					</div>

					<div className="space-y-4 text-xs">
						<div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
							<div className="flex items-center justify-between">
								<span className="font-bold text-slate-900">1. Unduh Template Excel</span>
								<button
									type="button"
									onClick={() => alert("Mengunduh Template Import Santri.xlsx...")}
									className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold rounded-lg text-xs transition-colors"
								>
									<Download className="w-3.5 h-3.5 text-emerald-600" />
									Download Template
								</button>
							</div>
							<p className="text-slate-500 text-[11px]">
								Gunakan format Excel standar Pondok Roja untuk mengunggah biodata massal santri baru.
							</p>
						</div>

						<div className="p-4 bg-emerald-50/50 border border-emerald-200/80 rounded-xl space-y-3">
							<span className="font-bold text-slate-900 block">2. Unggah File Data Santri</span>
							<input
								type="file"
								accept=".xlsx, .xls"
								onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
								className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 cursor-pointer"
							/>
							{selectedFile && (
								<p className="text-emerald-700 font-medium text-[11px] flex items-center gap-1">
									<CheckCircle2 className="w-3.5 h-3.5" /> File terpilih: {selectedFile.name}
								</p>
							)}
						</div>
					</div>

					<div className="flex justify-end gap-2 pt-3 border-t border-slate-100 text-xs">
						<button
							type="button"
							onClick={onCloseAll}
							className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
						>
							Batal
						</button>
						<button
							type="button"
							disabled={!selectedFile}
							onClick={() => selectedFile && onImportExcel(selectedFile)}
							className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold rounded-xl shadow-xs"
						>
							<Upload className="w-3.5 h-3.5" />
							Proses Import Excel
						</button>
					</div>
				</div>
			)}
		</div>
	)
}
