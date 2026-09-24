import type { JSX } from "react"

import CapabilityConfirmModal, { ConfirmActions, ConfirmBullets } from "./capability-confirm-modal"

/**
 * `student-capability/partials/modal-publish.blade.php` — the "Telah Disepakati" gate on the
 * level-5 item page. Legacy wrapped a real `POST publishInvoice` form here; the port calls
 * `publishCapability(capabilityId, studentGradeId)` from `onConfirm` instead.
 *
 * ⚠ Shares the dom id `#modalPublish` with `modal-publish-mass-create.blade.php`
 * (`capability-publish-mass-modal.tsx`). The two are never rendered on the same page and
 * their second bullet is different copy — this one warns about **empty** amounts, the mass
 * one warns about the **selection**.
 */
type CapabilityPublishModalProps = {
	open: boolean
	submitting?: boolean
	percent?: number
	onCancel: () => void
	onConfirm: () => void
}

const CapabilityPublishModal = ({
	open,
	submitting = false,
	percent = 0,
	onCancel,
	onConfirm,
}: CapabilityPublishModalProps): JSX.Element => (
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
			{/* Legacy's lower-case "pastikan" is its own; kept verbatim */}
			<li>
				pastikan setiap item kesanggupan (akun) <span className="font-bold text-[var(--primary)]">sudah punya</span> nilai.
				Apabila tidak punya nilai maka item kesanggupan (akun){" "}
				<span className="font-bold text-[var(--primary)]">tidak dapat</span> dibuat sebagai tagihan
			</li>
		</ConfirmBullets>
	</CapabilityConfirmModal>
)

export default CapabilityPublishModal
