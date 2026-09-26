import type { JSX } from "react"

import CapabilityConfirmModal, { ConfirmActions, ConfirmBullets } from "./capability-confirm-modal"

type CapabilityPublishMassModalProps = {
	open: boolean
	submitting?: boolean
	percent?: number
	onCancel: () => void
	onConfirm: () => void
}

const CapabilityPublishMassModal = ({
	open,
	submitting = false,
	percent = 0,
	onCancel,
	onConfirm,
}: CapabilityPublishMassModalProps): JSX.Element => (
	<CapabilityConfirmModal
		open={open}
		variant="warning"
		title="Konfirmasi disepakati"
		footer={<ConfirmActions onCancel={onCancel} onConfirm={onConfirm} confirmLabel="Lanjut" submitting={submitting} />}
		progress={{ visible: submitting, label: "Sedang proses membuat tagihan.", percent }}
	>
		<ConfirmBullets variant="warning">
			<li className="mb-[8px]">
				Secara otomatis sistem akan membuat <span className="font-bold text-[var(--primary)]">tagihan</span> secara massal
				untuk santri ini
			</li>
			<li>
				Pastikan setiap santri adalah <span className="font-bold text-[var(--primary)]">benar</span> yang Anda pilih. Dan
				pastikan juga setiap <span className="font-bold text-[var(--primary)]">item kesanggupan</span> sudah sesuai dengan
				kebutuhan pondok.
			</li>
		</ConfirmBullets>
	</CapabilityConfirmModal>
)

export default CapabilityPublishMassModal
