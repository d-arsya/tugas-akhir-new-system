import type { JSX } from "react"
import { Alert, AlertDescription, AlertTitle } from "./ui/alert"
import { RojaCard } from "./roja-card"
import { AlertTriangle } from "lucide-react"

export interface BannedCardProps {
	title?: string
	description?: string
	contactInfo?: string
	className?: string
}

export const BannedCard = ({
	title = "Akses Diblokir",
	description = "Alamat IP Anda telah diblokir secara permanen oleh sistem karena terdeteksi melakukan aktivitas yang mencurigakan atau percobaan login berulang kali yang gagal.",
	contactInfo = "Jika ini adalah kesalahan, hubungi sekretariat pengelola Pondok Roja.",
	className = "",
}: BannedCardProps): JSX.Element => {
	return (
		<RojaCard className={`p-8 md:p-10 flex flex-col gap-6 items-center text-center ${className}`}>
			<AlertTriangle className="w-10 h-10 text-rose-600 mb-1 m-auto" />
			<AlertTitle className="text-sm font-bold tracking-wide">
				{title}
			</AlertTitle>
			<Alert variant="destructive" className="flex flex-col items-center text-center gap-3 border-rose-200 py-6 my-6">
				<AlertDescription className="text-xs leading-relaxed font-medium">
					{description}
				</AlertDescription>
			</Alert>

			<p className="text-[11px] text-[var(--grey)] m-0">
				{contactInfo}
			</p>
		</RojaCard>
	)
}

export default BannedCard
