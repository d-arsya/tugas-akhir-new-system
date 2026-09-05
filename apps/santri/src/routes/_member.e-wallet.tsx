import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

const EwalletPage = (): JSX.Element => {
	return (
		<div className="flex flex-col gap-4">
			<h1 className="text-2xl font-bold text-[var(--heading-txt-inverse)]">E-Wallet Santri</h1>
			<p className="text-xs text-[var(--muted-txt-color)]">Manajemen saldo & transaksi e-wallet.</p>
		</div>
	)
}

export const Route = createFileRoute("/_member/e-wallet")({
	component: EwalletPage,
})

export default EwalletPage
