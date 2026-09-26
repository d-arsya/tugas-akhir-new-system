import { useState, type JSX } from "react"
import { Link } from "@tanstack/react-router"

import type { EwalletTransactionStatus } from "@roja/types"

import AdminPageTitle, { CRUMB_LINK_CLASS, type AdminBreadcrumb } from "@/components/layout/admin-page-title"
import { useEwalletTransaction } from "@/hooks/use-ewallet-transactions"

import BankTransferDetail from "./bank-transfer-detail"
import CashDetail from "./cash-detail"
import { InvalidUpdateModal, StatusUpdateModal, type PickableStatus } from "./transaction-status-modals"

type EwalletTransactionDetailPageProps = { transactionId: number }

const EwalletTransactionDetailPage = ({ transactionId }: EwalletTransactionDetailPageProps): JSX.Element => {
	const detail = useEwalletTransaction(transactionId).data

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

			{detail?.paymentMethod === "Bank Transfer (Manual)" ? <BankTransferDetail detail={detail} onPickStatus={pick} /> : null}
			{detail?.paymentMethod === "Cash" ? <CashDetail detail={detail} /> : null}

			{detail ? (
				<>
					<StatusUpdateModal open={open === "status"} transactionId={transactionId} status={status} onClose={() => setOpen(null)} />
					<InvalidUpdateModal open={open === "invalid"} transactionId={transactionId} onClose={() => setOpen(null)} />
				</>
			) : null}
		</>
	)
}

export default EwalletTransactionDetailPage
