import type { JSX } from "react"
import { Link } from "@tanstack/react-router"

import type { EwalletTransactionDetail } from "@roja/types"

import LegacyCard from "@/components/legacy/legacy-card"
import { rupiahLabel } from "@/lib/legacy-format"

import { Striped, StripedItem, StatusLabel, backButtonClass } from "./transaction-striped"

// Legacy ewallet/transaction-detail/cash-detail.blade.php

type CashDetailProps = { detail: EwalletTransactionDetail }

const CashDetail = ({ detail }: CashDetailProps): JSX.Element => (
	// `.tbr_custom_row.justify-content-center` > `.tbr_col_info.w-50.mx-0`
	<div className="flex w-full flex-col justify-center min-[992px]:flex-row">
		<div className="mb-[20px] w-1/2">
			<LegacyCard>
				<div className="flex justify-between">
					<div>
						<h5 className="mt-0! mb-[10px]! text-[22px]! leading-[22.4px]! font-semibold! tracking-normal!">Info transaksi</h5>
						<p className="mb-[20px] leading-[24px] text-[var(--body-txt-inverse)]">Dibuat oleh {detail.paymentOnBehalfOf}</p>
					</div>
					<div>
						<div className="flex items-center justify-between">
							<h6 className="my-auto! mr-[8px]! text-[16px]! leading-[22.4px]! font-semibold! tracking-normal!">Status</h6>
							<StatusLabel status={detail.status} />
						</div>
					</div>
				</div>
				<Striped>
					<StripedItem label="ID E-Wallet">{detail.ewallet.uniqueId}</StripedItem>
					<StripedItem label="ID Transaksi">{detail.code}</StripedItem>
					<StripedItem label="Tgl Transaksi">{detail.createdAt}</StripedItem>
					<StripedItem label="Total Pembayaran">{rupiahLabel(detail.totalAmount)}</StripedItem>
					<StripedItem label="Jenis Transaksi">{detail.name}</StripedItem>
					<StripedItem label="Metode">{detail.paymentMethod}</StripedItem>
					{/* `@if income` / `@elseif expense`: the officer takes a top-up, the wallet owner a withdrawal; any other type leaves an empty row */}
					{detail.type === "income" ? <StripedItem label="Penerima">{detail.paymentOnBehalfOf}</StripedItem> : null}
					{detail.type === "expense" ? <StripedItem label="Penerima">{detail.recipientName}</StripedItem> : null}
				</Striped>
			</LegacyCard>
			{/* `.btn.tbr_btn.tbr_btn-light-info.w-100.mt-4`, inside `.card` but under `.card-body` */}
			<Link
				to="/ewallets/$ewalletId"
				params={{ ewalletId: String(detail.ewallet.id) }}
				className={backButtonClass("mt-[24px] flex w-full")}
			>
				Kembali
			</Link>
		</div>
	</div>
)

export default CashDetail
