import { useState, type FormEvent, type JSX, type ReactNode } from "react"

import type { EwalletTransactionStatus } from "@roja/types"

import LegacyButton from "@/components/legacy/legacy-button"
import LegacyConfirmIcon from "@/components/legacy/legacy-confirm-icon"
import { LegacyModalOverlay } from "@/components/legacy/legacy-modal"
import LegacyRichEditor from "@/components/legacy/legacy-rich-editor/legacy-rich-editor"
import { useLegacySubmit } from "@/hooks/use-legacy-submit"
import { useUpdateEwalletTransaction } from "@/hooks/use-ewallet-transactions"

import { PlainLabel, StatusLabel } from "./transaction-striped"

// Legacy ewallet/transaction-detail/{update-modal,invalid-update-modal}.blade.php and
// public/assets/js/ewallet/update-transaction.js + default-ajax2.js `specificForm`.

type PickableStatus = Exclude<EwalletTransactionStatus, "invalid">

// `changeStatusLabel()`: the label colour and the word both follow the radio that was clicked
const STATUS_TEXT: Record<PickableStatus, string> = { waiting: "Menunggu", process: "Diproses", valid: "Berhasil" }

// `.tbr_label` inside `.tbr_confirm_title` keeps its own 12px Montserrat Medium, not the title's 20px bold
const TITLE_LABEL = "text-[12px] leading-[22.4px] font-medium tracking-[0.5px]"

type ModalProps = { open: boolean; transactionId: number; onClose: () => void }

/** `.tbr_modal_confirm.tbr_modal_confirm-warning` > `.card > .card-body`, the shell both modals share. */
const ConfirmShell = ({ open, maxWidth, children }: { open: boolean; maxWidth: string; children: ReactNode }): JSX.Element => (
	<LegacyModalOverlay open={open} maxWidth={maxWidth}>
		<section>
			<div className="rounded-[20px] bg-[var(--bg-secondary)] p-[30px] shadow-[0px_8px_30px_0px_rgba(0,0,0,0.08)]">
				{/* `.tbr_confirm_icon.text-center` */}
				<div className="mb-[14px] text-center">
					<LegacyConfirmIcon variant="warning" />
				</div>
				{children}
			</div>
		</section>
	</LegacyModalOverlay>
)

/** `.tbr_confirm_actions.text-center.mt-4` — Batal / Ya, benar, the blade's newline kept between them. */
const Actions = ({ onClose, submitting }: { onClose: () => void; submitting: boolean }): JSX.Element => (
	<div className="mt-[24px] mb-[4px] text-center">
		<LegacyButton variant="light" className="mr-[8px] inline-flex" onClick={onClose}>
			Batal
		</LegacyButton>{" "}
		<LegacyButton type="submit" variant="warning" className="inline-flex" loading={submitting}>
			Ya, benar
		</LegacyButton>
	</div>
)

/** `#tbr_update_status_modal` — waiting, process and valid. */
export const StatusUpdateModal = ({
	open,
	transactionId,
	status,
	onClose,
}: ModalProps & { status: PickableStatus }): JSX.Element => {
	const update = useUpdateEwalletTransaction(transactionId)
	const { submit, submitting } = useLegacySubmit({
		mutationFn: () => update.mutateAsync({ status }),
		// `default-ajax2.js` reloads the page 1000 ms after the notice
		onDone: onClose,
	})

	const onSubmit = (event: FormEvent): void => {
		event.preventDefault()
		submit(undefined)
	}

	return (
		<ConfirmShell open={open} maxWidth="500px">
			<div className="mb-[26px] text-center">
				<div className="mb-[12px] text-[20px] leading-[22.4px] font-bold text-[var(--heading-txt-inverse)]">
					Konfirmasi{" "}
					<StatusLabel status={status} className={TITLE_LABEL} />
				</div>
				<div className="block">
					<div className="mr-[4px] text-center">
						Transaksi akan diubah statusnya menjadi <span>{STATUS_TEXT[status]}</span>.
					</div>
					<div className="text-center">Apakah benar ingin mengubahnya?</div>
				</div>
			</div>
			<form onSubmit={onSubmit}>
				<Actions onClose={onClose} submitting={submitting} />
			</form>
		</ConfirmShell>
	)
}

/** `#tbr_update_invalid_status_modal` — `invalid`, with the summernote note. */
export const InvalidUpdateModal = ({ open, transactionId, onClose }: ModalProps): JSX.Element => {
	const [note, setNote] = useState("")
	const update = useUpdateEwalletTransaction(transactionId)
	const { submit, submitting } = useLegacySubmit({
		mutationFn: () => update.mutateAsync({ status: "invalid", invalidNote: note }),
		onDone: onClose,
	})

	const onSubmit = (event: FormEvent): void => {
		event.preventDefault()
		submit(undefined)
	}

	return (
		<ConfirmShell open={open} maxWidth="800px">
			<div className="mb-[26px] text-center">
				<div className="mb-[12px] text-[20px] leading-[22.4px] font-bold text-[var(--heading-txt-inverse)]">
					Konfirmasi <PlainLabel variant="danger" className={TITLE_LABEL}>Gagal</PlainLabel>
				</div>
				<div className="text-center">Transaksi akan diubah statusnya menjadi gagal. Apakah benar ingin mengubahnya?</div>
			</div>
			<form onSubmit={onSubmit}>
				<div>
					<p className="mb-[8px] text-center leading-[24px] text-[var(--grey)] italic">Berikan catatan kenapa transaksi ini dikatakan gagal</p>
					<LegacyRichEditor toolbar="compact" value={note} onChange={setNote} height={120} />
				</div>
				<Actions onClose={onClose} submitting={submitting} />
			</form>
		</ConfirmShell>
	)
}
