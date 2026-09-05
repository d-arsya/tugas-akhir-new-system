import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

const PaymentHistoryPage = (): JSX.Element => {
	return (
		<div className="flex flex-col gap-4">
			<h1 className="text-2xl font-bold text-[var(--heading-txt-inverse)]">Riwayat Pembayaran</h1>
			<p className="text-xs text-[var(--muted-txt-color)]">Daftar tagihan & bukti pembayaran SPP.</p>
		</div>
	)
}

export const Route = createFileRoute("/_member/payment-history")({
	component: PaymentHistoryPage,
})

export default PaymentHistoryPage
