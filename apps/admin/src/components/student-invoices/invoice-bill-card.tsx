import type { JSX, ReactNode } from "react"
import { Link } from "@tanstack/react-router"

import type { InvoiceBillDetail } from "@roja/types"

import { legacyButtonClass } from "@/components/legacy/legacy-button"
import LegacyCard from "@/components/legacy/legacy-card"
import LegacyTooltip from "@/components/legacy/legacy-tooltip"
import { BackArrowIcon } from "@/components/legacy/legacy-icons"
import { formatIndoDate, rupiahLabel } from "@/lib/legacy-format"

// `student-invoice/detail-bill.blade.php` 38-166 — one invoice and the payments against it.

/** `formatDate($date, 'd F Y \j\a\m H:i')` — the same stamp as `d F Y, H:i` with "jam" for the comma. */
const indoStampJam = (local: string | null): string =>
	local ? `${formatIndoDate(local)} jam ${local.slice(11, 16)}` : ""

// `.invoice-table tr td` (custom-detail.css): 6px/1px padding, 13px, top-aligned, 0.3px tracking
const INVOICE_CELL = "px-[1px] py-[6px] align-top text-[13px] tracking-[0.3px]"
// `table tr th` (custom-detail.css): #f7f7f7, normal weight, 12px/20px padding, no bottom border
const HEAD_CELL = "bg-[#f7f7f7] px-[20px] py-[12px] text-left font-normal"
// `.cost-table tr td`: 12px/20px padding over a 2px #f9f9f9 top rule
const BODY_CELL = "border-t-2 border-[#f9f9f9] px-[20px] py-[12px]"

const InfoRow = ({ label, value }: { label: string; value: ReactNode }): JSX.Element => (
	<tr>
		<td className={`${INVOICE_CELL} text-[var(--grey)]`}>{label}</td>
		<td className={`${INVOICE_CELL} font-semibold`}>{value}</td>
	</tr>
)

const InvoiceBillCard = ({ bill }: { bill: InvoiceBillDetail }): JSX.Element => (
	<LegacyCard className="mb-[24px]">
		<div className="mx-[-15px] flex flex-wrap items-center">
			<div className="w-full px-[15px] min-[768px]:w-10/12">
				{/* `.tbr_card_intro` — the title is inline-block so the badge sits beside it */}
				<div className="relative">
					<div className="mt-[2px] mr-[8px] inline-block text-[16px] font-bold">{bill.title}</div>
					{bill.periodBadge ? (
						// `span.alert.tbr_alert-primary.rounded.font-weight-bold.p-1`
						<span className="relative mb-[16px] rounded-[5px] border border-transparent bg-[rgba(var(--primary-rgb),0.1)] p-[4px] font-bold text-[var(--primary)]">
							{bill.periodBadge}
						</span>
					) : null}
					<p className="m-0 text-[var(--grey)]">Dibuat pada tanggal {indoStampJam(bill.createdAt)}</p>
				</div>
			</div>
			<div className="w-full px-[15px] min-[768px]:w-2/12">
				<div className="mt-[16px] mb-[4px] flex items-center justify-start min-[992px]:mt-0 min-[992px]:mb-0 min-[992px]:justify-end">
					{/* `a.btn.tbr_btn.mr-3.p-2.tbr_btn-light-info` — not in the shared variant map */}
					<LegacyTooltip content="Kembali" placement="left" className="mr-[16px]">
						<Link
							to="/student-invoices/$studentGradeId"
							params={{ studentGradeId: String(bill.student.studentGradeId) }}
							aria-label="Kembali"
							className={`${legacyButtonClass("light", "px-[8px] py-[8px]")} bg-[rgba(var(--info-rgb),0.16)] text-[var(--info)] hover:bg-[var(--info)] hover:text-white`}
						>
							<BackArrowIcon />
						</Link>
					</LegacyTooltip>
				</div>
			</div>
		</div>

		<div className="mx-[-15px] mb-[24px] flex flex-wrap">
			<div className="w-full px-[15px] min-[768px]:w-7/12">
				<p className="m-0 mt-[24px] font-semibold text-[var(--grey)]">Detail Tagihan</p>
				<table className="mt-0 w-full">
					<tbody>
						<InfoRow label="Nama Tagihan" value={bill.title} />
						<InfoRow label="Biaya Tagihan" value={rupiahLabel(bill.amount)} />
						<InfoRow label="Tanggal Jatuh Tempo" value={formatIndoDate(bill.dueDate)} />
					</tbody>
				</table>
			</div>
			<div className="w-full px-[15px] min-[768px]:w-5/12">
				<p className="m-0 mt-[24px] mr-[16px] font-semibold text-[var(--grey)]">Ditagihkan kepada</p>
				<table className="mt-0 w-full">
					<tbody>
						<tr>
							<td className={`${INVOICE_CELL} font-semibold`}>{bill.student.fullName}</td>
						</tr>
						<tr>
							<td className={`${INVOICE_CELL} font-semibold`}>{bill.student.nis}</td>
						</tr>
						<tr>
							<td className={`${INVOICE_CELL} font-semibold`}>{`Kelas ${bill.student.grade ?? ""}`}</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>

		<span className="text-[var(--grey)] italic">Item transaksi</span>
		{/* `.table-style` — a 2px #f7f7f7 frame with a 10px radius around the whole table */}
		<div className="mt-[8px] mb-[20px] overflow-auto rounded-[10px] border-2 border-[#f7f7f7] bg-[#f7f7f7]">
			<table className="mb-0 w-full">
				<thead>
					<tr className="bg-[#f7f7f7]">
						<th className={`${HEAD_CELL} font-semibold text-[var(--grey)]`}>No</th>
						<th className={`${HEAD_CELL} font-semibold text-[var(--grey)]`}>ID Pembayaran</th>
						<th className={`${HEAD_CELL} font-semibold text-[var(--grey)]`}>Keterangan</th>
						<th className={`${HEAD_CELL} font-semibold text-[var(--grey)]`}>Dibayar tanggal</th>
						<th className={`${HEAD_CELL} font-semibold text-[var(--grey)]`}>Dibayar</th>
					</tr>
				</thead>
				<tbody>
					{bill.transactions.length > 0 ? (
						bill.transactions.map((transaction, index) => (
							<tr key={transaction.id} className="bg-white">
								<td className={BODY_CELL}>{index + 1}</td>
								<td className={`${BODY_CELL} font-semibold text-[var(--secondary)]`}>{transaction.transactionCode}</td>
								<td className={BODY_CELL}>{transaction.note}</td>
								<td className={BODY_CELL}>{indoStampJam(transaction.paidAt)}</td>
								{/* Legacy printed `$amount[$key]`, an array built over every pivot row with 0 for the
								    cancelled ones, so one cancellation shifted every later figure. `pay` travels with its row. */}
								<td className={BODY_CELL}>{rupiahLabel(transaction.pay)}</td>
							</tr>
						))
					) : (
						<tr className="bg-white">
							<td colSpan={5} className={`${BODY_CELL} text-center`}>
								Belum ada transaksi untuk tagihan ini.
							</td>
						</tr>
					)}
				</tbody>
				<tfoot>
					<tr className="bg-[#f7f7f7]">
						<th colSpan={2} className={`${HEAD_CELL} font-semibold text-[var(--grey)]`}>
							Sisa yang harus dibayar
						</th>
						<th className={HEAD_CELL} />
						<th className={HEAD_CELL} />
						<th className={`${HEAD_CELL} font-semibold text-[var(--primary)]`}>{rupiahLabel(bill.costRemain)}</th>
					</tr>
				</tfoot>
			</table>
		</div>
	</LegacyCard>
)

export default InvoiceBillCard
