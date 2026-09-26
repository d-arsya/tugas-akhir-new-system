import type { JSX } from "react"

import AdminPageTitle from "@/components/layout/admin-page-title"
import { useEwalletDetail } from "@/hooks/use-ewallets"

import EwalletDetailHeader from "./ewallet-detail-header"
import { EwalletOwnerCard, EwalletQrCard } from "./ewallet-owner-cards"
import EwalletTransactionTable from "./ewallet-transaction-table"
import EwalletMoneyModals from "./modals/ewallet-money-modals"

const EwalletDetail = ({ ewalletId }: { ewalletId: number }): JSX.Element => {
	const { data: detail } = useEwalletDetail(ewalletId)

	return (
		<>
			<AdminPageTitle title="Transaksi" breadcrumbs={[{ label: "Dompet", to: "/ewallets" }, { label: "Transaksi" }]} />

			{detail ? (
				<div className="mx-[-15px] flex min-h-[calc(100vh-216px)] flex-wrap">
					<div className="w-full px-[15px] min-[992px]:w-1/4">
						<EwalletOwnerCard owner={detail.owner} isActive={detail.isActive} />
						<EwalletQrCard ewalletId={detail.id} qrValue={detail.qrValue} caption={detail.qrCaption} />
					</div>
					<div className="w-full px-[15px] min-[992px]:w-3/4">
						<EwalletDetailHeader detail={detail} />
						<EwalletTransactionTable ewalletId={detail.id} />
					</div>
				</div>
			) : null}

			{detail ? <EwalletMoneyModals detail={detail} /> : null}
		</>
	)
}

export default EwalletDetail
