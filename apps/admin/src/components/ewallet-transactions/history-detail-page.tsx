import type { JSX } from "react"
import { useRouter } from "@tanstack/react-router"

import AdminPageTitle from "@/components/layout/admin-page-title"
import { useEwalletHistoryDetail } from "@/hooks/use-ewallet-transactions"

import { HistoryTransactionCard, HistoryUserCard } from "./history-detail-cards"
import { backButtonClass } from "./transaction-striped"

type EwalletHistoryDetailPageProps = { transactionId: number }

const EwalletHistoryDetailPage = ({ transactionId }: EwalletHistoryDetailPageProps): JSX.Element => {
	const detail = useEwalletHistoryDetail(transactionId).data
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
				<div className="mx-[-15px] flex flex-wrap">
					<div className="w-full px-[15px] min-[992px]:w-1/2">
						<HistoryUserCard detail={detail} />
					</div>
					<div className="mt-[16px] w-full px-[15px] min-[992px]:mt-0 min-[992px]:w-1/2">
						<HistoryTransactionCard detail={detail} />
					</div>
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
