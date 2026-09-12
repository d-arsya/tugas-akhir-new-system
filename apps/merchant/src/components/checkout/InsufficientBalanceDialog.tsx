import type { JSX } from "react"
import { AlertTriangle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, Button } from "@roja/ui"

interface InsufficientBalanceDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	buyerName: string
	message?: string
}

export default function InsufficientBalanceDialog({
	open,
	onOpenChange,
	buyerName,
	message = "Saldo e-wallet santri tidak mencukupi untuk melakukan pembayaran ini.",
}: InsufficientBalanceDialogProps): JSX.Element {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md bg-white rounded-2xl p-6 text-center">
				<div className="mx-auto w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-3">
					<AlertTriangle className="w-6 h-6" />
				</div>
				<DialogHeader>
					<DialogTitle className="text-center text-base font-bold text-slate-800">
						Saldo Santri Tidak Mencukupi
					</DialogTitle>
					<DialogDescription className="text-center text-xs text-slate-500 mt-2">
						{message} Silakan minta santri <strong>{buyerName}</strong> untuk melakukan top up saldo terlebih dahulu atau sesuaikan jumlah item belanja.
					</DialogDescription>
				</DialogHeader>
				<div className="pt-4">
					<Button
						type="button"
						onClick={() => onOpenChange(false)}
						className="w-full h-10 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl cursor-pointer"
					>
						Tutup & Sesuaikan Belanja
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	)
}
