import type { JSX } from "react"

import CapabilityConfirmModal, { ConfirmActions, ConfirmBullets } from "./capability-confirm-modal"

/**
 * `student-capability/partials/modal-change.blade.php` — the `#modalChange` gate in front of
 * "Ubah kesepakatan" on the level-4 page. Legacy posted a form to `studentCapability.change`;
 * the port calls `changeCapability(studentGradeId)` from `onConfirm`.
 *
 * The two bullets describe the carry-over rules the publish path applies to the santri's
 * existing invoices; they are reproduced verbatim, including the missing space in
 * "belum dibayar(belum melewati…)".
 */
type CapabilityChangeModalProps = {
	open: boolean
	submitting?: boolean
	percent?: number
	onCancel: () => void
	onConfirm: () => void
}

const CapabilityChangeModal = ({
	open,
	submitting = false,
	percent = 0,
	onCancel,
	onConfirm,
}: CapabilityChangeModalProps): JSX.Element => (
	<CapabilityConfirmModal
		open={open}
		variant="warning"
		title="Konfirmasi ubah kesepakatan"
		footer={<ConfirmActions onCancel={onCancel} onConfirm={onConfirm} confirmLabel="Lanjut" submitting={submitting} />}
		progress={{ visible: submitting, label: "Sedang proses menghapus tagihan.", percent }}
	>
		<ConfirmBullets variant="warning">
			<li className="mb-[8px]">
				Tagihan yang sudah dibuat, <span className="font-bold text-[var(--primary)]">sudah dibayarkan</span> dan/atau sudah{" "}
				<span className="font-bold text-[var(--primary)]">melewati</span> tanggal jatuh tempo, maka tidak akan berubah
				nominal biayanya. Dengan demikian transaksi sebelumnya{" "}
				<span className="font-bold text-[var(--success)]">tetap aman</span>
			</li>
			<li>
				Tagihan yang sudah terlanjur dibuat dan <span className="font-bold text-[var(--primary)]">belum dibayar</span>(belum
				melewati tanggal jatuh tempo), maka nominal biaya akan mengikuti nilai kesanggupan yang baru
			</li>
		</ConfirmBullets>
	</CapabilityConfirmModal>
)

export default CapabilityChangeModal
