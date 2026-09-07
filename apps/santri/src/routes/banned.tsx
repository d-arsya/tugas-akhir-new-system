import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"
import PageLayout from "@/components/page-layout"
import { Alert, AlertDescription, AlertTitle, RojaCard } from "@roja/ui"
import { AlertTriangle } from "lucide-react"

const BannedPage = (): JSX.Element => {
	return (
		<PageLayout maxWidth="max-w-md">
			<RojaCard className="p-8 md:p-10 flex flex-col gap-6 items-center text-center">
				<AlertTriangle className="w-10 h-10 text-rose-600 mb-1 m-auto" />
				<AlertTitle className="text-sm font-bold tracking-wide">
					Akses Diblokir
				</AlertTitle>
				<Alert variant="destructive" className="flex flex-col items-center text-center gap-3 border-rose-200 py-6 my-6">
					<AlertDescription className="text-xs leading-relaxed font-medium">
						Alamat IP Anda telah diblokir secara permanen oleh sistem karena terdeteksi melakukan aktivitas yang mencurigakan atau percobaan login berulang kali yang gagal.
					</AlertDescription>
				</Alert>

				<p className="text-[11px] text-[var(--grey)] m-0">
					Jika ini adalah kesalahan, hubungi sekretariat santri Pondok Roja.
				</p>
			</RojaCard>
		</PageLayout>
	)
}

export const Route = createFileRoute("/banned")({
	component: BannedPage,
})

export default BannedPage
