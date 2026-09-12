import type { JSX } from "react"
import { AlertCircle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, Button } from "@roja/ui"

interface VoidConfirmDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	onConfirmVoid: () => void
}

export default function VoidConfirmDialog({
	open,
	onOpenChange,
	onConfirmVoid,
}: VoidConfirmDialogProps): JSX.Element {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-sm text-center space-y-4 bg-white rounded-2xl p-6">
				<div className="mx-auto w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
					<AlertCircle className="w-6 h-6" />
				</div>
				<DialogHeader>
					<DialogTitle className="text-center text-base font-bold text-slate-800">
						Batalkan Transaksi Ini?
					</DialogTitle>
					<DialogDescription className="text-center text-xs text-slate-500">
						Apakah Anda yakin ingin membatalkan transaksi belanja ini? Data keranjang yang belum terbayar akan dibuang.
					</DialogDescription>
				</DialogHeader>
				<div className="flex gap-2 pt-2">
					<Button
						type="button"
						variant="outline"
						onClick={() => onOpenChange(false)}
						className="flex-1 h-10 text-xs rounded-xl cursor-pointer"
					>
						Kembali
					</Button>
					<Button
						type="button"
						onClick={onConfirmVoid}
						className="flex-1 h-10 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl cursor-pointer"
					>
						Ya, Batalkan
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	)
}
