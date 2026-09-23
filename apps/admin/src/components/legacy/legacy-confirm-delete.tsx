import type { JSX } from "react"

import LegacyButton from "./legacy-button"
import { LegacyModalOverlay } from "./legacy-modal"

// `include/modal-delete.blade.php` — 69x69, circle r=28.5 at .2 opacity + question mark, both `--danger`
const ConfirmIcon = (): JSX.Element => (
	<svg xmlns="http://www.w3.org/2000/svg" width="69" height="69" viewBox="0 0 69 69" aria-hidden="true" className="inline-block">
		<rect width="69" height="69" fill="none" />
		<circle cx="28.5" cy="28.5" r="28.5" transform="translate(6 6)" fill="#f8374b" opacity="0.2" />
		<path
			d="M20.745,34.9a2.875,2.875,0,1,1-2.875,2.875A2.875,2.875,0,0,1,20.745,34.9Zm-4.051-3.254v-4.77h3.623a7.792,7.792,0,0,0,7.909-8.09,7.792,7.792,0,0,0-7.909-8.09c-4.649,0-7.849,3.5-7.849,8.09H7.336A12.746,12.746,0,0,1,20.317,5.922a12.861,12.861,0,1,1,0,25.72Z"
			transform="translate(13.755 11.104)"
			fill="#f8374b"
			fillRule="evenodd"
		/>
	</svg>
)

type LegacyConfirmDeleteProps = { open: boolean; onCancel: () => void; onConfirm: () => void; loading?: boolean }

// Port of `#modalDelete.tbr_modal_confirm.tbr_modal_confirm-danger` (app.css 1935-1973, max-width 500px)
const LegacyConfirmDelete = ({ open, onCancel, onConfirm, loading = false }: LegacyConfirmDeleteProps): JSX.Element => (
	<LegacyModalOverlay open={open} maxWidth="500px">
		<section>
			<div className="rounded-[20px] bg-[var(--bg-secondary)] p-[30px] shadow-[0px_8px_30px_0px_rgba(0,0,0,0.08)]">
				<div className="mb-[14px] text-center">
					<ConfirmIcon />
				</div>
				<div className="mb-[26px] text-center">
					<div className="mb-[12px] text-[20px] leading-[22.4px] font-bold text-[var(--heading-txt-inverse)]">Anda yakin?</div>
					Data akan dihapus dari database secara permanen. Anda tidak akan bisa mengembalikannya lagi.
				</div>
				<div className="mb-[4px] flex justify-center text-center">
					<LegacyButton variant="light" className="mr-[8px]" onClick={onCancel}>
						Batal
					</LegacyButton>
					<LegacyButton variant="danger" loading={loading} onClick={onConfirm}>
						Ya, hapus
					</LegacyButton>
				</div>
			</div>
		</section>
	</LegacyModalOverlay>
)

export default LegacyConfirmDelete
