import type { JSX, ReactNode } from "react"
import { createPortal } from "react-dom"

import EditorIcon from "./legacy-editor-icons"

type EditorModalProps = { open: boolean; title: string; onClose: () => void; footer?: ReactNode; children: ReactNode }

/**
 * `div.modal.note-modal > .modal-dialog > .modal-content` restyled by public/assets/css/summernote.css 96-160:
 * 20px radius, 68px header/footer on `--bg-tertiary`, 30px body padding and a `row-reverse` header.
 */
const EditorModal = ({ open, title, onClose, footer, children }: EditorModalProps): JSX.Element | null => {
	if (!open) return null

	return createPortal(
		<>
			<div aria-hidden="true" className="fixed inset-0 z-[1040] bg-black opacity-50" onClick={onClose} />
			<div className="fixed inset-0 z-[1050] overflow-y-auto pr-0!">
				<div role="dialog" aria-modal="true" className="relative mx-auto my-[1.75rem] w-auto max-w-[500px] px-[0.5rem]">
					<div className="relative flex flex-col rounded-[20px] border-0 bg-transparent">
						<div className="flex min-h-[68px] flex-row-reverse items-center rounded-t-[20px] border-0 bg-[var(--bg-tertiary)] px-[30px]">
							<h4 className="m-0! text-[16px]! leading-[1.4rem]! font-normal! tracking-normal! text-[var(--heading-txt-inverse)]!">
								{title}
							</h4>
							<button
								type="button"
								aria-label="Tutup"
								onClick={onClose}
								className="float-none m-0 cursor-pointer border-0 bg-transparent p-0 text-[var(--body-txt-inverse)] [text-shadow:none]"
							>
								<EditorIcon name="close" />
							</button>
						</div>
						<div className="overflow-x-auto bg-[var(--bg-secondary)] p-[30px]">{children}</div>
						{footer !== undefined ? (
							<div className="flex min-h-[68px] items-center justify-end rounded-b-[20px] border-0 bg-[var(--bg-tertiary)] px-[30px]">
								{footer}
							</div>
						) : null}
					</div>
				</div>
			</div>
		</>,
		document.body,
	)
}

export default EditorModal
