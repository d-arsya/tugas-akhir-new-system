import type { JSX } from "react"
import { User } from "lucide-react"

interface SantriSectionProps {
	buyerName: string
	nis?: string
	grade?: string
	level?: string
}

export default function SantriSection({
	buyerName,
	nis = "2026001",
	grade = "Kelas 7A",
	level = "SMP",
}: SantriSectionProps): JSX.Element {
	const initials = buyerName
		.split(" ")
		.filter(Boolean)
		.map((n) => n[0])
		.slice(0, 2)
		.join("")
		.toUpperCase()

	return (
		<div className="p-4 sm:p-5 space-y-3">
			<div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide">
				<User className="w-4 h-4 text-[#8dc31e]" />
				<span>Data Santri</span>
			</div>

			<div className="flex items-center gap-3.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
				<div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#8dc31e] to-lime-400 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
					{initials || <User className="w-5 h-5" />}
				</div>
				<div className="min-w-0 flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
					<div>
						<span className="text-[11px] text-slate-400 block">Nama Lengkap</span>
						<span className="font-bold text-slate-800 dark:text-white truncate block">{buyerName}</span>
					</div>
					<div>
						<span className="text-[11px] text-slate-400 block">NIS & Jenjang</span>
						<span className="font-semibold text-slate-700 dark:text-slate-300 block font-mono">
							{nis} &bull; {level} ({grade})
						</span>
					</div>
				</div>
			</div>
		</div>
	)
}
