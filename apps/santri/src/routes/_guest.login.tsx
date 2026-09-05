import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

const LoginPage = (): JSX.Element => {
	return (
		<div className="bg-white dark:bg-[#17283c] p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 flex flex-col gap-4 text-center">
			<h2 className="text-xl font-bold text-[var(--primary)]">Login Santri</h2>
			<p className="text-xs text-[var(--muted-txt-color)]">
				Silakan masuk ke sistem untuk melihat riwayat pembayaran & e-wallet.
			</p>
			<div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs text-slate-500">
				(Auth Phase Placeholder — Login Form will be built in Next Phase)
			</div>
		</div>
	)
}

export const Route = createFileRoute("/_guest/login")({
	component: LoginPage,
})

export default LoginPage
