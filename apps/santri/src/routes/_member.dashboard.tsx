import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

const DashboardPage = (): JSX.Element => {
	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-1">
				<h1 className="text-2xl font-bold text-[var(--heading-txt-inverse)]">Dashboard Santri</h1>
				<p className="text-xs text-[var(--muted-txt-color)]">
					Selamat datang di Portal Santri Pondok Roja.
				</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<div className="bg-white dark:bg-[#17283c] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-2">
					<span className="text-xs font-semibold text-[var(--grey)] uppercase tracking-wider">Status Santri</span>
					<span className="text-lg font-bold text-[var(--success)]">Aktif ✓</span>
				</div>
				<div className="bg-white dark:bg-[#17283c] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-2">
					<span className="text-xs font-semibold text-[var(--grey)] uppercase tracking-wider">Saldo E-Wallet</span>
					<span className="text-xl font-bold text-[var(--primary)]">Rp 350.000</span>
				</div>
				<div className="bg-white dark:bg-[#17283c] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-2">
					<span className="text-xs font-semibold text-[var(--grey)] uppercase tracking-wider">Tagihan SPP</span>
					<span className="text-lg font-bold text-[var(--warning)] font-sans">1 Tagihan Unpaid</span>
				</div>
			</div>
		</div>
	)
}

export const Route = createFileRoute("/_member/dashboard")({
	component: DashboardPage,
})

export default DashboardPage
