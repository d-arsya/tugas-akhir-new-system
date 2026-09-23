import type { JSX } from "react"

import type { InvoiceSelectionResult } from "@roja/types"

import { formatIndoDate, rupiahLabel } from "@/lib/legacy-format"

import PaymentTable, { TH_BOLD_CLASS, tdClass } from "./payment-table"

// `student-invoice/create-transaction.blade.php` 44-112 — the invoices the bendahara ticked on
// the Tagihan tab, and the total the payment is billed against.
//
// The "Biaya" column is each invoice's **outstanding balance**, not its face value: legacy builds
// `$installment[]` as `amount - sum(pay)` for an invoice already on instalments and `amount`
// otherwise. That figure now arrives keyed by invoice id (fix F-8) — legacy appended it only for
// unpaid invoices while reading it back by the position of `$invoices`, so one invoice paid by
// somebody else between opening this page and pressing Simpan shifted every row below it.

type PaymentSelectionTableProps = {
	selection: InvoiceSelectionResult | undefined
	onRemove: (invoiceId: number) => void
}

// `assets/svg/icons/data_destroy.svg`, transcribed
const DestroyIcon = (): JSX.Element => (
	<svg id="Layer_2" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
		<g id="trash">
			<rect id="Rectangle_14" width="24" height="24" fill="#ff8993" opacity="0" />
			<path
				id="Path_2"
				d="M21,6H16V4.33A2.42,2.42,0,0,0,13.5,2h-3A2.42,2.42,0,0,0,8,4.33V6H3A1,1,0,0,0,3,8H4V19a3,3,0,0,0,3,3H17a3,3,0,0,0,3-3V8h1a1,1,0,0,0,0-2ZM10,4.33c0-.16.21-.33.5-.33h3c.29,0,.5.17.5.33V6H10ZM18,19a1,1,0,0,1-1,1H7a1,1,0,0,1-1-1V8H18Z"
				fill="#ff8993"
			/>
		</g>
	</svg>
)

const PaymentSelectionTable = ({ selection, onRemove }: PaymentSelectionTableProps): JSX.Element => {
	const items = selection?.items ?? []
	const td = tdClass("create")

	return (
		<>
			{/* `span.tbr_text-grey.font-italic` */}
			<span className="text-[var(--grey)] italic">Item tagihan yang dipilih</span>
			<PaymentTable
				variant="create"
				className="mt-[8px]"
				head={
					<>
						<th className={TH_BOLD_CLASS}>No</th>
						<th className={TH_BOLD_CLASS}>Nama Biaya</th>
						<th className={TH_BOLD_CLASS}>Jatuh Tempo</th>
						<th className={TH_BOLD_CLASS}>Biaya</th>
						<th className={TH_BOLD_CLASS}>Actions</th>
					</>
				}
				foot={
					<tr>
						<th colSpan={2} className={TH_BOLD_CLASS}>
							Total yang harus dibayar
						</th>
						<th className={TH_CLASS_EMPTY} />
						{/* `.tbr_text-primary` */}
						<th colSpan={2} className={`${TH_BOLD_CLASS} text-[var(--primary)]!`}>
							{rupiahLabel(selection?.total ?? 0)}
						</th>
					</tr>
				}
			>
				{items.length > 0 ? (
					items.map((item, index) => (
						<tr key={item.invoiceId}>
							<td className={td}>{index + 1}</td>
							<td className={td}>{item.name}</td>
							<td className={td}>{formatIndoDate(item.dueDate)}</td>
							<td className={td}>{rupiahLabel(item.amount)}</td>
							<td className={td}>
								{/* `div.action.ml-3` — neither `.action` nor `.tbr_btn_remove` has any CSS;
								    the only rule in play is Bootstrap's `ml-3` (1rem). */}
								<div className="ml-[16px]">
									<a
										href="#"
										className="inline-block whitespace-normal"
										onClick={(event) => {
											event.preventDefault()
											onRemove(item.invoiceId)
										}}
										aria-label={`Hapus ${item.name ?? ""} dari pilihan`}
									>
										<DestroyIcon />
									</a>
								</div>
							</td>
						</tr>
					))
				) : (
					<tr>
						{/* `align="center"` on the cell itself, as legacy writes it */}
						<td colSpan={5} className={`${td} text-center`}>
							Tidak ada biaya yang anda pilih.
						</td>
					</tr>
				)}
			</PaymentTable>
		</>
	)
}

// The spacer `<th></th>` between the label and the total carries no `.text-weight-600`
const TH_CLASS_EMPTY = "bg-[#F7F7F7] px-[20px] py-[12px] text-left font-normal"

export default PaymentSelectionTable
