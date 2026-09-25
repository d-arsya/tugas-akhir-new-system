import { useState, type JSX } from "react"
import { createFileRoute, Link } from "@tanstack/react-router"

import type { EwalletTransactionStatus } from "@roja/types"

import BankTransferDetail from "@/components/ewallet-transactions/bank-transfer-detail"
import CashDetail from "@/components/ewallet-transactions/cash-detail"
import { InvalidUpdateModal, StatusUpdateModal } from "@/components/ewallet-transactions/transaction-status-modals"
import AdminPageTitle, { CRUMB_LINK_CLASS, type AdminBreadcrumb } from "@/components/layout/admin-page-title"
import { useEwalletTransaction } from "@/hooks/use-ewallet-transactions"

// Legacy ewallet/transaction-detail/index.blade.php (cash | bank transfer) + update-modal + invalid-update-modal
export const Route = createFileRoute("/_auth/ewallets/transactions/$transactionId")({
	component: EwalletTransactionDetailPage,
})

type PickableStatus = Exclude<EwalletTransactionStatus, "invalid">

function EwalletTransactionDetailPage(): JSX.Element {
	const { transactionId } = Route.useParams()
	const id = Number(transactionId)
	const detail = useEwalletTransaction(id).data

	// `update-transaction.js`: an `invalid` click opens the note modal, every other one the plain modal
	const [open, setOpen] = useState<"status" | "invalid" | null>(null)
	const [status, setStatus] = useState<PickableStatus>("waiting")

	const pick = (next: EwalletTransactionStatus): void => {
		if (next === "invalid") {
			setOpen("invalid")
			return
		}
		setStatus(next)
		setOpen("status")
	}

	// The "Transaksi" crumb links to the wallet the row belongs to, which only the payload knows
	const crumbs: AdminBreadcrumb[] = [
		{ label: "Dompet", to: "/ewallets" },
		detail
			? {
					label: "Transaksi",
					node: (
						<Link to="/ewallets/$ewalletId" params={{ ewalletId: String(detail.ewallet.id) }} className={CRUMB_LINK_CLASS}>
							Transaksi
						</Link>
					),
				}
			: { label: "Transaksi" },
		{ label: "Detail" },
	]

	return (
		<>
			<AdminPageTitle title="Detail" breadcrumbs={crumbs} />

			{/* `@if Bank Transfer (Manual)` / `@elseif Cash` — any other method renders neither */}
			{detail?.paymentMethod === "Bank Transfer (Manual)" ? <BankTransferDetail detail={detail} onPickStatus={pick} /> : null}
			{detail?.paymentMethod === "Cash" ? <CashDetail detail={detail} /> : null}

			{detail ? (
				<>
					<StatusUpdateModal open={open === "status"} transactionId={id} status={status} onClose={() => setOpen(null)} />
					<InvalidUpdateModal open={open === "invalid"} transactionId={id} onClose={() => setOpen(null)} />
				</>
			) : null}
		</>
	)
}

export default EwalletTransactionDetailPage
