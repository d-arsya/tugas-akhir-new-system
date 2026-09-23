import { useState, type JSX } from "react"
import { Link } from "@tanstack/react-router"

import type { StudentTransactionDetail } from "@roja/types"

import { legacyButtonClass } from "@/components/legacy/legacy-button"
import LegacyTooltip from "@/components/legacy/legacy-tooltip"
import { adminApi } from "@/lib/api"
import { saveBlob } from "@/lib/download"
import { formatIndoDateJam } from "@/components/student-transactions/transaction-detail-tables"

// Legacy `student-transaction/detail.blade.php:42-82`. Owned by WS P1-C.

// `:60-64`, transcribed verbatim
const BackIcon = (): JSX.Element => (
	<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
		<path d="M0,0H24V24H0Z" fill="none" fillRule="evenodd" />
		<rect width="2" height="14" rx="1" transform="translate(5 13) rotate(-90)" fill="#6866e9" opacity="0.3" />
		<path
			d="M3.707,15.707a1,1,0,0,1-1.414-1.414l6-6a1,1,0,0,1,1.383-.03l6,5.5a1,1,0,1,1-1.351,1.474L9.03,10.384Z"
			transform="translate(-3 21) rotate(-90)"
			fill="#6866e9"
		/>
	</svg>
)

// `:67-71`, transcribed verbatim
const PrintIcon = (): JSX.Element => (
	<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
		<rect width="24" height="24" fill="none" />
		<path
			d="M16,17v4a1,1,0,0,1-1,1H9a1,1,0,0,1-1-1V17H5a2,2,0,0,1-2-2V8A2,2,0,0,1,5,6H19a2,2,0,0,1,2,2v7a2,2,0,0,1-2,2Zm1.5-6A1.5,1.5,0,1,0,16,9.5,1.5,1.5,0,0,0,17.5,11ZM10,14v6h4V14Z"
			fill="#fff"
			fillRule="evenodd"
		/>
		<rect width="8" height="2" rx="1" transform="translate(8 2)" fill="#fff" opacity="0.3" />
	</svg>
)

// `:74-78`, transcribed verbatim
const DownloadIcon = (): JSX.Element => (
	<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
		<path d="M0,0H24V24H0Z" fill="none" fillRule="evenodd" />
		<path
			d="M5.747,13.043A6,6,0,1,1,14.811,6.5H17.25a3.75,3.75,0,0,1,0,7.5h-9A3.736,3.736,0,0,1,5.747,13.043Z"
			fill="#fff"
			fillRule="evenodd"
			opacity="0.3"
		/>
		<path
			d="M11.129,15.734V17.69H9.121a.5.5,0,0,0-.5.5v1.023a.5.5,0,0,0,.5.5h2.008V21.67a.5.5,0,0,0,.823.382l3.506-2.968a.5.5,0,0,0,0-.763l-3.506-2.968a.5.5,0,0,0-.823.382Z"
			transform="translate(30.621 6.702) rotate(90)"
			fill="#fff"
		/>
	</svg>
)

const TransactionDetailHeader = ({ detail }: { detail: StudentTransactionDetail }): JSX.Element => {
	const [downloading, setDownloading] = useState(false)

	const download = async (): Promise<void> => {
		setDownloading(true)
		try {
			const file = await adminApi.downloadReceipt(detail.id)
			saveBlob(file.blob, file.fileName ?? `${detail.transactionCode ?? detail.id}.pdf`)
		} finally {
			setDownloading(false)
		}
	}

	return (
		// `.row.mb-3`
		<div className="mx-[-15px] mb-[16px] flex flex-wrap">
			<div className="relative w-full px-[15px] min-[768px]:w-1/2">
				{/* `.tbr_card_intro .tbr_title` (app.css 2481-2486) */}
				<div className="relative mt-[2px] inline-block text-[16px] font-bold">Detail Pembayaran</div>
				{/* `:47` — `.alert.tbr_alert-primary.rounded.font-weight-bold.p-1` (app.css 1332) */}
				<div>
					<span className="inline-block rounded-[0.25rem] bg-[rgba(var(--primary-rgb),0.1)] p-[4px] font-bold text-[var(--primary)]">
						{detail.transactionCode}
					</span>
				</div>
				{/* `:48` — `formatDate($transaction->created_at, 'd F Y \j\a\m H:i')` */}
				<p className="m-0! text-[var(--grey)]">Dibayar pada tanggal {formatIndoDateJam(detail.createdAt)}</p>
			</div>

			<div className="w-full px-[15px] text-right min-[768px]:w-1/2">
				{/* `.d-flex.align-items-center.justify-content-start.justify-content-lg-end.mt-3.mt-lg-0.mb-1.mb-lg-0` */}
				<div className="mt-[16px] mb-[4px] flex items-center justify-start min-[992px]:mt-0 min-[992px]:mb-0 min-[992px]:justify-end">
					<LegacyTooltip content="Kembali" placement="left">
						{/* `.btn.tbr_btn.mr-3.p-2.tbr_btn-light-info.d-inline-flex` */}
						<Link
							to="/student-transactions"
							className={legacyButtonClass(
								"light",
								"mr-[16px] bg-[rgba(var(--info-rgb),0.16)] p-[8px] text-[var(--info)]",
							)}
						>
							<BackIcon />
						</Link>
					</LegacyTooltip>

					{/*
					 * `:66` opens `studentInvoice.printTransaction` in a new tab — the legacy
					 * `print.transaction` blade rendered for the browser print dialog. The frozen
					 * contract has only `downloadReceipt`, so there is no endpoint to point this at.
					 * Reported to the lead; the button is rendered disabled rather than dropped so
					 * the toolbar keeps its legacy shape.
					 */}
					<button
						type="button"
						disabled
						title="Cetak"
						className={legacyButtonClass("secondary", "mr-[16px] p-[8px]")}
					>
						<PrintIcon />
					</button>

					{/* `:73` — `studentInvoice.downloadTransaction`, P1-B's receipt endpoint */}
					<button
						type="button"
						onClick={() => void download()}
						disabled={downloading}
						title="Unduh"
						className={legacyButtonClass("danger", "mr-[16px] p-[8px]")}
					>
						<DownloadIcon />
					</button>
				</div>
			</div>
		</div>
	)
}

export default TransactionDetailHeader
