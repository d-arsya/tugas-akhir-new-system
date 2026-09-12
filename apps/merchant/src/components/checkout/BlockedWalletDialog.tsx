import type { JSX } from "react"
import { ShieldX } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, Button } from "@roja/ui"

interface BlockedWalletDialogProps {
	open: boolean
	onClose: () => void
	message?: string
}

export default function BlockedWalletDialog({
	open,
	onClose,
	message = "E-Wallet telah diblokir karena salah memasukkan PIN sebanyak 3 kali.",
}: BlockedWalletDialogProps): JSX.Element {
	return (
		<Dialog open={open} onOpenChange={() => {}}>
			<DialogContent className="sm:max-w-md bg-white rounded-2xl p-6 text-center">
				<div className="mx-auto w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-3">
					<ShieldX className="w-6 h-6" />
				</div>
				<DialogHeader>
					<DialogTitle className="text-center text-base font-bold text-rose-600">
						E-Wallet Santri Diblokir
					</DialogTitle>
					<DialogDescription className="text-center text-xs text-slate-500 mt-2">
						{message} Demi keamanan, akun santri telah dinonaktifkan sementara. Santri dapat menghubungi pihak admin pondok untuk membuka blokir.
					</DialogDescription>
				</DialogHeader>
				<div className="pt-4">
					<Button
						type="button"
						onClick={onClose}
						className="w-full h-10 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl cursor-pointer"
					>
						Kembali ke Dompet Digital
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	)
}
