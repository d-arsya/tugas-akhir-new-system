import type { JSX } from "react"
import { Link } from "@tanstack/react-router"

import type { StudentTransactionDetail } from "@roja/types"

import { legacyButtonClass } from "@/components/legacy/legacy-button"
import LegacyTooltip from "@/components/legacy/legacy-tooltip"
import { formatIndoDateJam } from "@/components/student-transactions/transaction-detail-tables"
import { receiptPrintUrl } from "@/hooks/use-payments"

const BackIcon = (): JSX.Element => (
	<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
		<path d="M0,0H24V24H0Z" fill="none" fillRule="evenodd" />
		<rect width="2" height="14" rx="1" transform="translate(5 13) rotate(-90)" fill="#6866e9" opacity="0.3" />
		<path
			d="M3.707,15.707a1,1,0,0,1-1.414-1.414l6-6a1,1,0,0,1,1.383-.03l6,5.5a1,1,0,1,1-1.351,1.474L9.03,10.384Z"
			transform="translate(-3 21) rotate(-90)"
			fill="#6866e9"
		/>
	</svg>
)

const PrintIcon = (): JSX.Element => (
	<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
		<rect width="24" height="24" fill="none" />
		<path
			d="M16,17v4a1,1,0,0,1-1,1H9a1,1,0,0,1-1-1V17H5a2,2,0,0,1-2-2V8A2,2,0,0,1,5,6H19a2,2,0,0,1,2,2v7a2,2,0,0,1-2,2Zm1.5-6A1.5,1.5,0,1,0,16,9.5,1.5,1.5,0,0,0,17.5,11ZM10,14v6h4V14Z"
			fill="#fff"
			fillRule="evenodd"
		/>
		<rect width="8" height="2" rx="1" transform="translate(8 2)" fill="#fff" opacity="0.3" />
	</svg>
)

const DownloadIcon = (): JSX.Element => (
	<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
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

const BADGE_CLASS = "rounded-[0.25rem] p-[4px] font-bold"

type PaymentDetailHeaderProps = {
	detail: StudentTransactionDetail
	studentGradeId: string
	downloading: boolean
	onDownload: () => void
}

const PaymentDetailHeader = ({
	detail,
	studentGradeId,
	downloading,
	onDownload,
}: PaymentDetailHeaderProps): JSX.Element => (
	<div className="mx-[-15px] mb-[16px] flex flex-wrap">
		<div className="relative w-full px-[15px] min-[768px]:w-1/2">
			<div className="relative mt-[2px] inline-block text-[16px] font-bold">Detail Pembayaran</div>{" "}
			<span className={`${BADGE_CLASS} bg-[rgba(var(--primary-rgb),0.1)] text-[var(--primary)]`}>
				{detail.transactionCode}
			</span>
			{detail.status === "invalid" ? (
				<>
					{" "}
					<span className={`${BADGE_CLASS} bg-[rgba(var(--danger-rgb),0.1)] text-[var(--danger)]`}>Dibatalkan</span>
				</>
			) : null}
			<p className="m-0! text-[var(--grey)]">Dibayar pada tanggal {formatIndoDateJam(detail.createdAt)}</p>
		</div>

		<div className="w-full px-[15px] text-right min-[768px]:w-1/2">
			<div className="mt-[16px] mb-[4px] flex items-center justify-start min-[992px]:mt-0 min-[992px]:mb-0 min-[992px]:justify-end">
				<LegacyTooltip content="Kembali" placement="left">
					<Link
						to="/student-invoices/$studentGradeId"
						params={{ studentGradeId }}
						className={legacyButtonClass(
							"light",
							"mr-[16px] bg-[rgba(var(--info-rgb),0.16)] p-[8px] text-[var(--info)] hover:bg-[var(--info)] hover:text-white",
						)}
					>
						<BackIcon />
					</Link>
				</LegacyTooltip>

				<a
					href={receiptPrintUrl(detail.id)}
					target="_blank"
					rel="noreferrer"
					title="Cetak"
					className={legacyButtonClass("secondary", "mr-[16px] inline-flex p-[8px]")}
				>
					<PrintIcon />
				</a>

				<button
					type="button"
					onClick={onDownload}
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

export default PaymentDetailHeader
