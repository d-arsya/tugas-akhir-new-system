import { useEffect, useState, type JSX } from "react"

import LegacyButton from "@/components/legacy/legacy-button"
import LegacyConfirmIcon from "@/components/legacy/legacy-confirm-icon"
import { LegacyModalOverlay } from "@/components/legacy/legacy-modal"
import LegacyTextarea from "@/components/legacy/legacy-textarea"

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
