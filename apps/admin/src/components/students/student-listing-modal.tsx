import type { JSX, ReactNode } from "react"

import { cn } from "@roja/utils"

import LegacyButton from "@/components/legacy/legacy-button"
import LegacyConfirmIcon from "@/components/legacy/legacy-confirm-icon"
import { LegacyModalOverlay } from "@/components/legacy/legacy-modal"

import { StudentLabel, type StudentLabelVariant } from "./student-ui"

// `student/partials/modals/listing-confirm-*.blade.php` — `.tbr_modal_confirm.tbr_modal_confirm-warning`:
// the warning glyph beside the title, a 240px `.tbr_scrollable` list of the ticked santri, "Batal" and
// "Ya, data benar". The list is filled when the modal opens (`edit-general.js` `drawStudentData*`).

export type ListedStudent = {
	id: number
	name: string | null
	nis: string | null
	/** `parseStatusData()` — "Naik Kelas" / "Keluar" in red, else nothing */
	status: string | null
}

type Props = {
	open: boolean
	/** `.tbr_confirm_title` text, and the label after it when there is one */
	title: string
	label?: { text: string; variant: StudentLabelVariant }
	/** `.tbr_confirm_contents`; legacy swaps it for a centred notice on the Subkelas modal */
	contents: ReactNode
	/** The list, or a centred notice ("Silakan pilih … terlebih dahulu.") in its place */
	items: ListedStudent[] | { notice: string }
	/** `.tbr_disabled` on the submit until the modal was first opened with a choice */
	confirmEnabled: boolean
	submitting: boolean
	onCancel: () => void
	onConfirm: () => void
}

export const CONTENTS_KBM = (
	<>
		Pastikan data yang akan diubah <span className="font-semibold">keterangan KBM</span> nya sesuai dengan data yang Anda maksud.
	</>
)

const StudentListingModal = ({ open, title, label, contents, items, confirmEnabled, submitting, onCancel, onConfirm }: Props): JSX.Element => (
	<LegacyModalOverlay open={open} maxWidth="500px">
		<section>
			{/* `.tbr_custom_modal .card-body` (app.css 1911) — 30px, 20px radius */}
			<div className="rounded-[20px] bg-[var(--bg-secondary)] p-[30px] shadow-[0px_8px_30px_0px_rgba(0,0,0,0.08)]">
				<div className="flex items-start justify-start">
					<div className="mb-[14px]">
						<LegacyConfirmIcon variant="warning" />
					</div>
					<div className="pl-[16px] md:pl-[24px]">
						<div className="mb-[12px] text-[20px] leading-[22.4px] font-bold text-[var(--heading-txt-inverse)]">
							{title}
							{label ? (
								<>
									{" "}
									{/* `.tbr_modal_confirm .tbr_confirm_title .tbr_label` (app.css 2636-2641) */}
									<StudentLabel variant={label.variant} size="base" className="top-[-3px] left-[3px] text-[12px] font-medium">
										{label.text}
									</StudentLabel>
								</>
							) : null}
						</div>
						<div className="mb-[26px]">{contents}</div>
					</div>
				</div>
				{/* `.tbr_scrollable.mb-4 > .tbr_scrollable_content[style="height: 240px"] > .pr-3 > ol` (app.css 2643-2660) */}
				<div className="relative mb-[24px] block w-full overflow-hidden rounded-[20px] bg-[var(--bg-tertiary)] py-[24px] pl-[24px]">
					<div className="h-[240px] overflow-y-auto">
						<div className="pr-[16px]">
							<ol className="mb-[16px] list-decimal pl-[24px]">
								{Array.isArray(items) ? (
									items.map((item) => (
										<li key={item.id}>
											<span>{item.name}</span> <span className="font-medium italic">({item.nis})</span>{" "}
											{item.status ? (
												<span className="font-medium italic">
													<strong className="text-[var(--danger)]">{item.status}</strong>
												</span>
											) : null}
										</li>
									))
								) : (
									<div className="text-center">{items.notice}</div>
								)}
							</ol>
						</div>
					</div>
				</div>
				<div className="mb-[4px] pt-[8px] text-center">
					<LegacyButton variant="light" className="mr-[8px]" onClick={onCancel}>
						Batal
					</LegacyButton>{" "}
					<LegacyButton
						variant="warning"
						loading={submitting}
						onClick={onConfirm}
						className={cn(!confirmEnabled && "pointer-events-none opacity-50!")}
					>
						Ya, data benar
					</LegacyButton>
				</div>
			</div>
		</section>
	</LegacyModalOverlay>
)

export default StudentListingModal
