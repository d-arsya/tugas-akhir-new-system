import { useState, type FormEvent, type JSX, type ReactNode } from "react"

import type { EwalletTransactionStatus } from "@roja/types"

import LegacyButton from "@/components/legacy/legacy-button"
import LegacyConfirmIcon from "@/components/legacy/legacy-confirm-icon"
import { LegacyModalOverlay } from "@/components/legacy/legacy-modal"
import LegacyRichEditor from "@/components/legacy/legacy-rich-editor/legacy-rich-editor"
import { useLegacySubmit } from "@/hooks/use-legacy-submit"
import { useUpdateEwalletTransaction } from "@/hooks/use-ewallet-transactions"

import { PlainLabel, StatusLabel } from "./transaction-striped"

export type PickableStatus = Exclude<EwalletTransactionStatus, "invalid">

const STATUS_TEXT: Record<PickableStatus, string> = { waiting: "Menunggu", process: "Diproses", valid: "Berhasil" }

const TITLE_LABEL = "text-[12px] leading-[22.4px] font-medium tracking-[0.5px]"

type ModalProps = { open: boolean; transactionId: number; onClose: () => void }

const ConfirmShell = ({ open, maxWidth, children }: { open: boolean; maxWidth: string; children: ReactNode }): JSX.Element => (
	<LegacyModalOverlay open={open} maxWidth={maxWidth}>
		<section>
			<div className="rounded-[20px] bg-[var(--bg-secondary)] p-[30px] shadow-[0px_8px_30px_0px_rgba(0,0,0,0.08)]">
				<div className="mb-[14px] text-center">
					<LegacyConfirmIcon variant="warning" />
				</div>
				{children}
			</div>
		</section>
	</LegacyModalOverlay>
)

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

export const StatusUpdateModal = ({
	open,
	transactionId,
	status,
	onClose,
}: ModalProps & { status: PickableStatus }): JSX.Element => {
	const update = useUpdateEwalletTransaction(transactionId)
	const { submit, submitting } = useLegacySubmit({
		mutationFn: () => update.mutateAsync({ status }),
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
