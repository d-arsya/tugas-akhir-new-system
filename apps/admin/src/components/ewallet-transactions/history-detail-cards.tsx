import type { JSX } from "react"

import type { EwalletHistoryDetail, EwalletTransactionKind } from "@roja/types"

import LegacyCard from "@/components/legacy/legacy-card"
import { rupiahLabel } from "@/lib/legacy-format"

import { Striped, StripedItem, StatusLabel } from "./transaction-striped"

// Legacy ewallet/transaction-history/{card-user,card-transaction}.blade.php

// `EwalletTransactionHistoryController::typeLabel` — anything else is ''
const TYPE_LABEL: Record<EwalletTransactionKind, string> = { purchase: "Jual Beli", income: "Isi Saldo", expense: "Tarik Saldo" }

const H5 = "mt-0! mb-[24px]! text-[22px]! leading-[22.4px]! font-semibold! tracking-normal!"

// `.card-body.px-4.pt-4.pb-0`
const BODY = "px-[24px] pt-[24px] pb-0"

/** `?? '-'` */
const dash = (value: string | null): string => value ?? "-"

/** `card-user.blade.php` — "Info pengguna". */
export const HistoryUserCard = ({ detail }: { detail: EwalletHistoryDetail }): JSX.Element => (
	<LegacyCard bodyClassName={BODY}>
		<h5 className={H5}>Info pengguna</h5>
		<Striped>
			<StripedItem label="Jenis Transaksi" leftValue>
				{TYPE_LABEL[detail.type] ?? ""}
			</StripedItem>
			<StripedItem label="ID E-Wallet Merchant" leftValue>
				{dash(detail.merchant.uniqueId)}
			</StripedItem>
			<StripedItem label="Nama Merchant" leftValue>
				{dash(detail.merchant.name)}
			</StripedItem>
			<StripedItem label="ID E-Wallet Santri" leftValue roundedBottom>
				{dash(detail.student.uniqueId)}
			</StripedItem>
			<StripedItem label="Nama Santri" leftValue roundedBottom>
				{dash(detail.student.name)}
			</StripedItem>
		</Striped>
	</LegacyCard>
)

/** `card-transaction.blade.php` — "Info transaksi" with the purchase's items. */
export const HistoryTransactionCard = ({ detail }: { detail: EwalletHistoryDetail }): JSX.Element => (
	<LegacyCard bodyClassName={BODY}>
		<div className="flex justify-between">
			<div>
				<h5 className={H5}>Info transaksi</h5>
			</div>
			<div>
				<div className="flex items-center justify-between">
					<h6 className="my-auto! mr-[8px]! text-[16px]! leading-[22.4px]! font-semibold! tracking-normal!">
						<StatusLabel status={detail.status} />
					</h6>
				</div>
			</div>
		</div>
		<Striped>
			<StripedItem label="ID Transaksi" leftValue>
				{detail.code}
			</StripedItem>
			<StripedItem label="Tanggal Transaksi" leftValue>
				{detail.createdAt}
			</StripedItem>
			{/* `.tbr_striped_item > .w-100` — no label cell */}
			<div className="flex justify-between px-[24px] py-[20px] odd:bg-[#F1F1FC]">
				<div className="w-full">
					<span>Detail Transaksi</span>
					{detail.items.map((item, index) => (
						// `.item-transaction-ewallet` / `.tbr_item_user`
						<div key={`${index}-${item.description}`} className="mt-[32px] flex justify-between">
							<span>
								{index + 1}. {item.description}
							</span>
							<span className="max-w-[45%] grow">{rupiahLabel(item.price)}</span>
						</div>
					))}
				</div>
			</div>
			<StripedItem label="Metode" leftValue>
				{detail.paymentMethod}
			</StripedItem>
			<StripedItem label="Total Pembayaran" leftValue roundedBottom>
				{rupiahLabel(detail.totalAmount)}
			</StripedItem>
		</Striped>
	</LegacyCard>
)
