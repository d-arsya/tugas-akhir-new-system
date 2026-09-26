import type { JSX } from "react"

import type { InvoiceSelectionResult } from "@roja/types"

import { formatIndoDate, rupiahLabel } from "@/lib/legacy-format"

import PaymentTable, { TD_CLASS, TH_BOLD_CLASS, TH_CLASS } from "./payment-table"

type PaymentSelectionTableProps = {
	selection: InvoiceSelectionResult | undefined
	onRemove: (invoiceId: number) => void
}

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

	return (
		<>
			<span className="text-[var(--grey)] italic">Item tagihan yang dipilih</span>
			<PaymentTable
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
						<th className={TH_CLASS} />
						<th colSpan={2} className={`${TH_BOLD_CLASS} text-[var(--primary)]!`}>
							{rupiahLabel(selection?.total ?? 0)}
						</th>
					</tr>
				}
			>
				{items.length > 0 ? (
					items.map((item, index) => (
						<tr key={item.invoiceId}>
							<td className={TD_CLASS}>{index + 1}</td>
							<td className={TD_CLASS}>{item.name}</td>
							<td className={TD_CLASS}>{formatIndoDate(item.dueDate)}</td>
							<td className={TD_CLASS}>{rupiahLabel(item.amount)}</td>
							<td className={TD_CLASS}>
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
						<td colSpan={5} className={`${TD_CLASS} text-center`}>
							Tidak ada biaya yang anda pilih.
						</td>
					</tr>
				)}
			</PaymentTable>
		</>
	)
}

export default PaymentSelectionTable
