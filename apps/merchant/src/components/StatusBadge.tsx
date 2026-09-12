import type { JSX } from "react"

export interface StatusBadgeProps {
	status: string
	className?: string
}

export const StatusBadge = ({ status, className = "" }: StatusBadgeProps): JSX.Element => {
	switch (status.toLowerCase()) {
		case "valid":
			return (
				<span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 ${className}`}>
					Berhasil (Valid)
				</span>
			)
		case "waiting":
			return (
				<span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-amber-500/10 text-amber-600 border border-amber-500/20 ${className}`}>
					Menunggu
				</span>
			)
		case "process":
			return (
				<span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-sky-500/10 text-sky-600 border border-sky-500/20 ${className}`}>
					Diproses
				</span>
			)
		case "invalid":
			return (
				<span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-rose-500/10 text-rose-600 border border-rose-500/20 ${className}`}>
					Gagal (Invalid)
				</span>
			)
		default:
			return (
				<span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-slate-500/10 text-slate-600 border border-slate-500/20 ${className}`}>
					{status}
				</span>
			)
	}
}

export default StatusBadge
