import type { JSX } from "react"
import { Link } from "@tanstack/react-router"

import type { EwalletTransactionDetail, EwalletTransactionStatus } from "@roja/types"

import LegacyCard from "@/components/legacy/legacy-card"
import LegacyRadioGroup, { type LegacyRadioOption } from "@/components/legacy/legacy-radio-group"
import LegacyTooltip from "@/components/legacy/legacy-tooltip"
import { rupiahLabel } from "@/lib/legacy-format"

import { Striped, StripedItem, backButtonClass } from "./transaction-striped"

// Legacy ewallet/transaction-detail/bank-transfer-detail.blade.php

/**
 * The destination account is hard-coded in the blade (`{{-- destination_bank --}}` is commented out
 * in favour of this literal). Kept as legacy, in one place; moving it to settings is a follow-up.
 */
export const DESTINATION_BANK = "BSI 7192852646 a.n Tabungan Pondok ROJA"

// `#waiting`, `#process`, `#valid`, `#invalid` — in the blade's order
const STATUS_OPTIONS: LegacyRadioOption[] = [
	{ value: "waiting", label: "Menunggu" },
	{ value: "process", label: "Diproses" },
	{ value: "valid", label: "Berhasil" },
	{ value: "invalid", label: "Gagal" },
]

const H5 = "mt-0! mb-[10px]! text-[22px]! leading-[22.4px]! font-semibold! tracking-normal!"
const P = "mb-[20px] leading-[24px] text-[var(--body-txt-inverse)]"

type BankTransferDetailProps = {
	detail: EwalletTransactionDetail
	/** `update-transaction.js`: a click on any unchecked radio opens a confirmation modal. */
	onPickStatus: (status: EwalletTransactionStatus) => void
}

const BankTransferDetail = ({ detail, onPickStatus }: BankTransferDetailProps): JSX.Element => (
	// `.tbr_custom_row`: a column below 992px, a row with `.tbr_col_info` 37% / 37% / `.tbr_col_status` 26% above
	<div className="flex w-full flex-col min-[992px]:flex-row">
		<div className="mb-[20px] w-full min-[992px]:mr-[30px] min-[992px]:w-[37%]">
			<LegacyCard>
				<h5 className={H5}>Info transaksi</h5>
				<p className={P}>Dibuat oleh {detail.requesterName}</p>
				<Striped>
					<StripedItem label="ID E-Wallet">{detail.ewallet.uniqueId}</StripedItem>
					<StripedItem label="ID Transaksi">{detail.code}</StripedItem>
					<StripedItem label="Tgl Transaksi">{detail.createdAt}</StripedItem>
					<StripedItem label="Total Pembayaran">{rupiahLabel(detail.totalAmount)}</StripedItem>
					<StripedItem label="Jenis Transaksi">{detail.name}</StripedItem>
					<StripedItem label="Metode">{detail.paymentMethod}</StripedItem>
					<StripedItem label="Penerima">{DESTINATION_BANK}</StripedItem>
				</Striped>
			</LegacyCard>
		</div>
		<div className="mb-[20px] w-full min-[992px]:mr-[30px] min-[992px]:w-[37%]">
			<LegacyCard>
				<h5 className={H5}>Info konfirmasi</h5>
				<p className={P}>Dikonfirmasi oleh {detail.requesterName}</p>
				<Striped>
					<StripedItem label="ID E-Wallet">{detail.ewallet.uniqueId}</StripedItem>
					<StripedItem label="ID Transaksi">{detail.code}</StripedItem>
					<StripedItem label="Tgl Transfer">{detail.paymentDate}</StripedItem>
					<StripedItem label="Nominal">{rupiahLabel(detail.totalAmount)}</StripedItem>
					<StripedItem label="Bank Tujuan">{DESTINATION_BANK}</StripedItem>
					<StripedItem label="Keterangan">{detail.paymentNote}</StripedItem>
					{detail.paymentAttachmentUrl ? (
						// `.d-flex.flex-column` — not a `.tbr_striped_item`, so it takes no stripe
						<div className="flex flex-col">
							<img className="m-[24px] h-auto max-w-full shadow-[0_2px_4px_rgba(0,0,0,0.075)]" src={detail.paymentAttachmentUrl} alt="" />
							<div className="flex justify-center">
								<div className="flex items-center justify-center">
									<LegacyTooltip content="Lihat bukti transfer dengan cara mendownload.">
										<a href={detail.paymentAttachmentUrl} target="_self" download="" className="mr-[8px]">
											<img src="/assets/svg/icons/preview_download.svg" alt="Download" />
										</a>
									</LegacyTooltip>
									<LegacyTooltip content="Lihat bukti transfer pada tab baru.">
										<a href={detail.paymentAttachmentUrl} target="_blank" rel="noreferrer">
											<img src="/assets/svg/icons/preview_new_tab.svg" alt="New Tab" />
										</a>
									</LegacyTooltip>
								</div>
							</div>
						</div>
					) : null}
				</Striped>
			</LegacyCard>
		</div>
		<div className="mb-[20px] w-full min-[992px]:w-[26%]">
			<div className="mb-[24px]">
				{/* `.card-body` without `.p-4`: bootstrap's 1.25rem */}
				<LegacyCard bodyClassName="p-[20px]">
					<h5 className={H5}>Status</h5>
					<p className={P}>Tentukan status transaksi</p>
					<form autoComplete="off" onSubmit={(event) => event.preventDefault()}>
						<LegacyRadioGroup
							name="status"
							value={detail.status}
							options={STATUS_OPTIONS}
							onChange={(value) => onPickStatus(value as EwalletTransactionStatus)}
							itemClassName="mb-[8px]"
						/>
					</form>
				</LegacyCard>
			</div>
			<Link to="/ewallets/$ewalletId" params={{ ewalletId: String(detail.ewallet.id) }} className={backButtonClass("flex")}>
				Kembali
			</Link>
		</div>
	</div>
)

export default BankTransferDetail
