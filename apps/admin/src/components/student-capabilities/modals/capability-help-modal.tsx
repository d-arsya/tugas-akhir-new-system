import type { JSX } from "react"

import LegacyButton from "@/components/legacy/legacy-button"

import CapabilityConfirmModal, { ConfirmBullets } from "./capability-confirm-modal"

const CapabilityHelpModal = ({ open, onClose }: { open: boolean; onClose: () => void }): JSX.Element => (
	<CapabilityConfirmModal
		open={open}
		variant="warning"
		title="Bantuan"
		footer={
			<LegacyButton variant="primary" className="mr-[8px]" onClick={onClose}>
				Tutup
			</LegacyButton>
		}
	>
		<ConfirmBullets variant="warning">
			<li className="mb-[8px]">
				Klik tombol <span className="font-bold text-[var(--primary)]">buat kesanggupan</span> untuk memulai membuat
				kesanggupan pertama kali
			</li>
			<li>
				Klik tombol <span className="font-bold text-[var(--primary)]">ubah kesepakatan</span> untuk membatalkan kesepakatan
				sebelumnya dan membuat kesepakatan baru
			</li>
		</ConfirmBullets>
	</CapabilityConfirmModal>
)

export default CapabilityHelpModal
