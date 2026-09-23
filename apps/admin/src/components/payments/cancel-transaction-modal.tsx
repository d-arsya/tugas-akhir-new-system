import { useEffect, useState, type JSX } from "react"

import LegacyButton from "@/components/legacy/legacy-button"
import LegacyConfirmIcon from "@/components/legacy/legacy-confirm-icon"
import { LegacyModalOverlay } from "@/components/legacy/legacy-modal"
import LegacyTextarea from "@/components/legacy/legacy-textarea"

// `student-invoice/partials/modal-cancel.blade.php` + `cancel-transaction.js`.
//
// The trigger lives on the Riwayat Pembayaran tab of the Tagihan detail page, which belongs to
// the invoice workstream; the modal and `useCancelTransaction` live here because cancelling a
// payment is a payment concern. Import both from the tab's action column:
//
//   const cancel = useCancelTransaction(transactionId)
//   <CancelTransactionModal open={…} submitting={cancel.isPending} onConfirm={(note) => …} />
//
// On success legacy switches the page to the Dibatalkan tab and reloads with `?cancel=yes`, which
// is what makes that tab the active one on the way back in.

type CancelTransactionModalProps = {
	open: boolean
	submitting?: boolean
	onCancel: () => void
	onConfirm: (cancelNote: string) => void
}

const CancelTransactionModal = ({
	open,
	submitting = false,
	onCancel,
	onConfirm,
}: CancelTransactionModalProps): JSX.Element => {
	const [cancelNote, setCancelNote] = useState("")

	// magnificPopup destroys the inline node on close, so the textarea always reopens empty
	useEffect(() => {
		if (!open) setCancelNote("")
	}, [open])

	return (
		<LegacyModalOverlay open={open} maxWidth="500px">
			<section>
				<div className="rounded-[20px] bg-[var(--bg-secondary)] p-[30px] shadow-[0px_8px_30px_0px_rgba(0,0,0,0.08)]">
					<div className="mb-[14px] text-center">
						<LegacyConfirmIcon />
					</div>
					<div className="mb-[26px] text-center">
						<div className="mb-[12px] text-[20px] leading-[22.4px] font-bold text-[var(--heading-txt-inverse)]">
							Anda yakin?
						</div>
						Berikan alasan terlebih dahulu sebelum membatalkan.
					</div>
					<form
						id="cancel-transaction"
						onSubmit={(event) => {
							event.preventDefault()
							onConfirm(cancelNote)
						}}
					>
						<LegacyTextarea
							name="cancel_note"
							id="cancel_note"
							cols={10}
							rows={3}
							value={cancelNote}
							onChange={(event) => setCancelNote(event.target.value)}
						/>
						{/* `.tbr_confirm_actions.text-center.mt-4` */}
						<div className="mt-[24px] text-center">
							<LegacyButton variant="light" className="mr-[8px]" onClick={onCancel}>
								Batal
							</LegacyButton>{" "}
							<LegacyButton type="submit" variant="primary" loading={submitting}>
								Ya, batalkan
							</LegacyButton>
						</div>
					</form>
				</div>
			</section>
		</LegacyModalOverlay>
	)
}

export default CancelTransactionModal
