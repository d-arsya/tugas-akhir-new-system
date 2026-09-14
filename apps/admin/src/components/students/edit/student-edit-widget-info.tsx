import type { JSX } from "react"
import { User, Upload, Phone, Mail, Calendar } from "lucide-react"

interface StudentEditWidgetInfoProps {
	student: any
	onUploadAvatar: (file: File) => void
}

export function StudentEditWidgetInfo({ student, onUploadAvatar }: StudentEditWidgetInfoProps): JSX.Element {
	return (
		<div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
			{/* Avatar & Upload Button */}
			<div className="text-center space-y-3">
				<div className="relative w-28 h-28 mx-auto rounded-full bg-slate-100 border-2 border-slate-200 overflow-hidden flex items-center justify-center text-slate-400 shadow-inner group">
					{student?.attach_photo || student?.avatarUrl ? (
						<img
							src={student.attach_photo || student.avatarUrl}
							alt={student.fullName}
							className="w-full h-full object-cover"
						/>
					) : (
						<User className="w-12 h-12 stroke-[1.5]" />
					)}
				</div>
				<div>
					<label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs cursor-pointer transition-colors">
						<Upload className="w-3.5 h-3.5 text-[var(--primary)]" />
						Ubah Foto Santri
						<input
							type="file"
							accept="image/*"
							onChange={(e) => {
								const file = e.target.files?.[0]
								if (file) onUploadAvatar(file)
							}}
							className="hidden"
						/>
					</label>
				</div>
			</div>

			<div className="border-t border-slate-100 pt-3 space-y-2.5 text-xs">
				<div>
					<span className="text-slate-400 font-medium block">Nama Lengkap</span>
					<span className="font-bold text-slate-900 text-sm">{student?.fullName || "Ahmad Fauzi Al-Attas"}</span>
				</div>

				<div className="grid grid-cols-2 gap-2">
					<div>
						<span className="text-slate-400 font-medium block">NISP / NIS</span>
						<span className="font-mono font-bold text-slate-800">{student?.nis || "202607101"}</span>
					</div>
					<div>
						<span className="text-slate-400 font-medium block">NISN</span>
						<span className="font-mono font-bold text-slate-800">{student?.nisn || "0081234567"}</span>
					</div>
				</div>

				<div>
					<span className="text-slate-400 font-medium block">Jenis Kelamin</span>
					<span className="font-semibold text-slate-800">
						{student?.gender === "P" ? "Perempuan (Putri)" : "Laki-laki (Putra)"}
					</span>
				</div>

				<div>
					<span className="text-slate-400 font-medium block">Kelas & Rombel</span>
					<span className="font-semibold text-emerald-700">
						{student?.subGradeName || "Kelas 7-A (Putra)"}
					</span>
				</div>

				<div>
					<span className="text-slate-400 font-medium block">Tahun Akademik Masuk</span>
					<span className="font-semibold text-slate-800">{student?.academicYear || "2026/2027"}</span>
				</div>
			</div>
		</div>
	)
}
