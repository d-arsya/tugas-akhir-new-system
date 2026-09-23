import type { JSX } from "react"

import LegacyButton from "./legacy-button"
import LegacyConfirmIcon from "./legacy-confirm-icon"
import { LegacyModalOverlay } from "./legacy-modal"

type LegacyConfirmDeleteProps = { open: boolean; onCancel: () => void; onConfirm: () => void; loading?: boolean }

// Port of `#modalDelete.tbr_modal_confirm.tbr_modal_confirm-danger` (app.css 1935-1973, max-width 500px)
const LegacyConfirmDelete = ({ open, onCancel, onConfirm, loading = false }: LegacyConfirmDeleteProps): JSX.Element => (
	<LegacyModalOverlay open={open} maxWidth="500px">
		<section>
			<div className="rounded-[20px] bg-[var(--bg-secondary)] p-[30px] shadow-[0px_8px_30px_0px_rgba(0,0,0,0.08)]">
				<div className="mb-[14px] text-center">
					<LegacyConfirmIcon />
				</div>
				<div className="mb-[26px] text-center">
					<div className="mb-[12px] text-[20px] leading-[22.4px] font-bold text-[var(--heading-txt-inverse)]">Anda yakin?</div>
					Data akan dihapus dari database secara permanen. Anda tidak akan bisa mengembalikannya lagi.
				</div>
				{/*
				 * `div.tbr_confirm_actions.text-center.mb-2` is a **block**, not a flex row: the two
				 * inline-flex buttons sit in normal flow, so the newline between them in the blade
				 * renders as a ~3.73px space on top of `mr-2`. A flex container would discard it.
				 */}
				<div className="mb-[4px] text-center">
					<LegacyButton variant="light" className="mr-[8px]" onClick={onCancel}>
						Batal
					</LegacyButton>{" "}
					<LegacyButton variant="danger" loading={loading} onClick={onConfirm}>
						Ya, hapus
					</LegacyButton>
				</div>
			</div>
		</section>
	</LegacyModalOverlay>
)

export default LegacyConfirmDelete
