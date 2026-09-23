import type { JSX } from "react"

import LegacyButton from "@/components/legacy/legacy-button"
import LegacyConfirmIcon from "@/components/legacy/legacy-confirm-icon"
import { LegacyModalOverlay } from "@/components/legacy/legacy-modal"

// `student-invoice/partials/modal-delete.blade.php`, opened by `delete-invoice.js` from the trash
// icon on each row of the Buat Pembayaran table.
//
// The shared `LegacyConfirmDelete` cannot be reused: its body text is the permanent-delete
// wording, and this modal only drops an invoice from the current selection — nothing is deleted.
// Its actions row also has no bottom margin, where the shared one carries `mb-2`.

type PaymentRemoveModalProps = { open: boolean; onCancel: () => void; onConfirm: () => void }

const PaymentRemoveModal = ({ open, onCancel, onConfirm }: PaymentRemoveModalProps): JSX.Element => (
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
					Data akan dihapus dari halaman ini. Benarkah santri ingin membatalkannya?
				</div>
				{/* `div.tbr_confirm_actions.text-center` is a block, so the newline between the two
				    inline-flex buttons renders as a space on top of `mr-2`. */}
				<div className="text-center">
					<LegacyButton variant="light" className="mr-[8px]" onClick={onCancel}>
						Batal
					</LegacyButton>{" "}
					<LegacyButton variant="danger" onClick={onConfirm}>
						Ya, hapus
					</LegacyButton>
				</div>
			</div>
		</section>
	</LegacyModalOverlay>
)

export default PaymentRemoveModal
