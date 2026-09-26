import type { JSX, ReactNode } from "react"

import { cn } from "@roja/utils"

import LegacyButton from "@/components/legacy/legacy-button"
import LegacyConfirmIcon from "@/components/legacy/legacy-confirm-icon"
import { LegacyModalOverlay } from "@/components/legacy/legacy-modal"

import { StudentLabel, type StudentLabelVariant } from "./student-ui"

export type ListedStudent = {
	id: number
	name: string | null
	nis: string | null
	status: string | null
}

type Props = {
	open: boolean
	title: string
	label?: { text: string; variant: StudentLabelVariant }
	contents: ReactNode
	items: ListedStudent[] | { notice: string }
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
									<StudentLabel variant={label.variant} size="base" className="top-[-3px] left-[3px] text-[12px] font-medium">
										{label.text}
									</StudentLabel>
								</>
							) : null}
						</div>
						<div className="mb-[26px]">{contents}</div>
					</div>
				</div>
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
