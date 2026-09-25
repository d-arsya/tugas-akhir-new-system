import type { JSX } from "react"
import { createFileRoute, useRouter } from "@tanstack/react-router"

import { HistoryTransactionCard, HistoryUserCard } from "@/components/ewallet-transactions/history-detail-cards"
import { backButtonClass } from "@/components/ewallet-transactions/transaction-striped"
import AdminPageTitle from "@/components/layout/admin-page-title"
import { useEwalletHistoryDetail } from "@/hooks/use-ewallet-transactions"

// Legacy ewallet/transaction-history/detail-transaction.blade.php
export const Route = createFileRoute("/_auth/ewallet-transactions/$transactionId")({
	component: EwalletHistoryDetailPage,
})

function EwalletHistoryDetailPage(): JSX.Element {
	const { transactionId } = Route.useParams()
	const detail = useEwalletHistoryDetail(Number(transactionId)).data
	const router = useRouter()

	return (
		<>
			<AdminPageTitle
				title="Detail"
				breadcrumbs={[
					{ label: "Dompet", to: "/ewallets" },
					{ label: "Transaksi", to: "/ewallet-transactions" },
					{ label: "Detail" },
				]}
			/>

			{detail ? (
				// `.row`
				<div className="mx-[-15px] flex flex-wrap">
					<div className="w-full px-[15px] min-[992px]:w-1/2">
						<HistoryUserCard detail={detail} />
					</div>
					<div className="mt-[16px] w-full px-[15px] min-[992px]:mt-0 min-[992px]:w-1/2">
						<HistoryTransactionCard detail={detail} />
					</div>
					{/* `href="{{ url()->previous() }}"`, `.w-50.mt-4.mx-auto` */}
					<a
						href="/ewallet-transactions"
						className={backButtonClass("mx-auto mt-[24px] w-1/2")}
						onClick={(event) => {
							event.preventDefault()
							router.history.back()
						}}
					>
						Kembali
					</a>
				</div>
			) : null}
		</>
	)
}

export default EwalletHistoryDetailPage
