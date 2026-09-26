import type { JSX } from "react"

import LegacyButton from "@/components/legacy/legacy-button"
import LegacyConfirmIcon from "@/components/legacy/legacy-confirm-icon"
import { LegacyModalOverlay } from "@/components/legacy/legacy-modal"

// `registrant/partials/edit/modals/{accepted,rejected,reserved,waiting}.blade.php` —
// `#modal-{approve,reject,reserve,wait}.tbr_modal_confirm.tbr_modal_confirm-warning`, each posting one
// hidden `approval_status` through `specificForm()`.

export type ApprovalKind = "approve" | "reject" | "reserve" | "wait"

const COPY: Record<ApprovalKind, { question: string; button: string }> = {
	approve: { question: "benarkah akan diterima sebagai santri baru di pondok ROJA?", button: "Ya, pendaftar diterima" },
	reject: { question: "benarkah akan ditolak atau tidak diterima sebagai santri di pondok ROJA?", button: "Ya, pendaftar ditolak" },
	reserve: { question: "benarkah akan dijadikan sebagai cadangan?", button: "Ya, pendaftar dicadangkan" },
	wait: { question: "apakah benar masih menunggu pengumuman?", button: "Ya, benar" },
}

type RegistrantConfirmModalProps = {
	kind: ApprovalKind | null
	fullname: string | null
	registrantId: string | null
	submitting: boolean
	onCancel: () => void
	onConfirm: (kind: ApprovalKind) => void
}

const RegistrantConfirmModal = ({ kind, fullname, registrantId, submitting, onCancel, onConfirm }: RegistrantConfirmModalProps): JSX.Element => {
	const copy = COPY[kind ?? "wait"]
	return (
		<LegacyModalOverlay open={kind !== null} maxWidth="600px">
			<section>
				<div className="rounded-[20px] bg-[var(--bg-secondary)] p-[30px] shadow-[0px_8px_30px_0px_rgba(0,0,0,0.08)]">
					<div className="mb-[14px] text-center">
						<LegacyConfirmIcon variant="warning" />
					</div>
					<div className="mb-[26px] text-center">
						<div className="mb-[12px] text-[20px] leading-[22.4px] font-bold text-[var(--heading-txt-inverse)]">Anda yakin?</div>
						Pendaftar atas nama{" "}
						<span className="font-semibold">
							{fullname ?? ""} ({registrantId ?? ""})
						</span>{" "}
						{copy.question}
					</div>
					{/* `div.tbr_confirm_actions.text-center` — a block, so the newline between the buttons renders */}
					<div className="mb-[4px] text-center">
						<LegacyButton variant="light" className="mr-[8px]" onClick={onCancel}>
							Batal
						</LegacyButton>{" "}
						<LegacyButton variant="warning" loading={submitting} onClick={() => (kind !== null ? onConfirm(kind) : undefined)}>
							{copy.button}
						</LegacyButton>
					</div>
				</div>
			</section>
		</LegacyModalOverlay>
	)
}

export default RegistrantConfirmModal
