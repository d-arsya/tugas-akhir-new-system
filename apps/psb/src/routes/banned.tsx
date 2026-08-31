import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"
import Header from "@/components/header"

const BannedPage = (): JSX.Element => {
	return (
		<div className="roja_wizard_container min-h-screen flex flex-col relative overflow-hidden bg-[var(--bg-primary)] pt-[70px]">
			<Header />
			<div className="roja_bg_blobs" />

			<main className="flex-1 relative z-10 px-4 py-8 max-w-md mx-auto w-full flex items-center justify-center">
				<div className="roja_card_wizard w-full relative overflow-hidden p-8 md:p-10 flex flex-col gap-6 items-center text-center">
					{/* Corner gradient glows inside card */}
					<div className="absolute -top-12 -left-12 w-32 h-32 bg-[var(--primary)] rounded-full blur-[40px] opacity-[0.1] pointer-events-none z-0" />
					<div className="absolute -top-12 -right-12 w-32 h-32 bg-[var(--secondary)] rounded-full blur-[40px] opacity-[0.1] pointer-events-none z-0" />

					<div className="relative z-10 w-16 h-16 rounded-full bg-red-100 text-[var(--danger)] flex items-center justify-center text-3xl font-bold">
						⚠️
					</div>
					<div className="relative z-10 text-xs font-bold text-[var(--danger)] tracking-wide m-0">
						Akses Diblokir
					</div>
					<p className="relative z-10 text-xs text-[var(--body-txt-inverse)] leading-relaxed m-0">
						Alamat IP Anda telah diblokir secara permanen oleh sistem karena terdeteksi melakukan aktivitas yang mencurigakan atau percobaan login berulang kali yang gagal.
					</p>
					<p className="relative z-10 text-[10px] text-[var(--grey)] m-0">
						Jika ini adalah kesalahan, hubungi sekretariat pendaftaran Pondok Roja.
					</p>
				</div>
			</main>
		</div>
	)
}

export const Route = createFileRoute("/banned")({
	component: BannedPage,
})

export default BannedPage
