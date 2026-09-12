import type { JSX } from "react"
import { QRCodeSVG } from "qrcode.react"
import { QrCode, Store, QrCode as QrIcon } from "lucide-react"
import { RojaCard } from "@roja/ui"

export interface QRDisplayProps {
	qrValue: string
	merchantName?: string
	transactionCode?: string
	totalAmountFormatted?: string
	className?: string
}

export const QRDisplay = ({
	qrValue,
	merchantName = "Kantin Utama Roja",
	transactionCode,
	totalAmountFormatted,
	className = "",
}: QRDisplayProps): JSX.Element => {
	return (
		<RojaCard className={`p-6 md:p-8 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-center max-w-sm mx-auto shadow-sm ${className}`}>
			<div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#e4007e]/10 text-[#e4007e] mb-3">
				<QrIcon className="w-6 h-6" />
			</div>

			<h3 className="text-base font-bold text-slate-800 dark:text-white mb-1">
				Scan QR Untuk Pembayaran
			</h3>
			<p className="text-xs text-slate-500 mb-5">
				Minta Santri untuk melakukan scan pada QR Code di bawah
			</p>

			{/* QR Canvas Box */}
			<div className="bg-white p-4 rounded-2xl inline-block border-2 border-slate-100 shadow-inner mb-4">
				<QRCodeSVG
					value={qrValue}
					size={200}
					level="H"
					includeMargin={true}
				/>
			</div>

			{/* Transaction Info Footer */}
			<div className="space-y-1 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
				<div className="flex items-center justify-center gap-1.5 font-semibold text-slate-700 dark:text-slate-200">
					<Store className="w-3.5 h-3.5 text-[#e4007e]" />
					{merchantName}
				</div>
				{transactionCode && (
					<p className="text-[11px] text-slate-400 font-mono">Kode: {transactionCode}</p>
				)}
				{totalAmountFormatted && (
					<p className="text-sm font-extrabold text-[#e4007e] pt-1">
						Total: {totalAmountFormatted}
					</p>
				)}
			</div>
		</RojaCard>
	)
}

export default QRDisplay
