import type { JSX } from "react"

import CapabilityConfirmModal, { ConfirmActions, ConfirmBullets } from "./capability-confirm-modal"

/**
 * `student-capability/partials/modal-publish-mass-create.blade.php` — the
 * "Konfirmasi disepakati" gate in front of the mass-create and mass-edit Save buttons
 * (`mass-create.blade.php:131`, `mass-edit.blade.php:148` both call `showModalHelp('#modalPublish')`).
 *
 * ⚠ Legacy gives **two** different partials the dom id `#modalPublish`:
 * this one, which carries no form and whose Lanjut button submits `#main-form` over ajax
 * (`mass-create-ajax.js:120-122`), and `modal-publish.blade.php`, which wraps a real POST to
 * `publishInvoice` and ships on the level-5 item page. They are never on the same page, and
 * their second bullet differs, so they are two components here —
 * see `capability-publish-modal.tsx` for the level-5 one.
 */
type CapabilityPublishMassModalProps = {
	open: boolean
	submitting?: boolean
	/** `showProgressBar()` reveals the bar the moment the request starts. */
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
