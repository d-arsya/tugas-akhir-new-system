import type { JSX } from "react"

import LegacyButton from "@/components/legacy/legacy-button"

import CapabilityConfirmModal, { ConfirmBullets } from "./capability-confirm-modal"

const CapabilityHelpCreateModal = ({ open, onClose }: { open: boolean; onClose: () => void }): JSX.Element => (
	<CapabilityConfirmModal
		open={open}
		variant="warning"
		title="Bantuan"
		wide
		footer={
			<LegacyButton variant="primary" className="mr-[8px]" onClick={onClose}>
				Tutup
			</LegacyButton>
		}
	>
		<ConfirmBullets variant="warning">
			<li className="mb-[8px]">Gunakan filter disamping kanan untuk mengaktifkan fitur serentak.</li>
			<li className="mb-[8px]">
				Tombol <span className="text-[var(--primary)]">Buat atau ubah kesanggupan</span> bisa digunakan:
				<ul className="-ml-[16px] list-none pl-0 [&>li]:relative [&>li]:before:absolute [&>li]:before:top-[8px] [&>li]:before:left-[-13px] [&>li]:before:block [&>li]:before:h-[5px] [&>li]:before:w-[5px] [&>li]:before:rounded-full [&>li]:before:bg-[var(--warning)] [&>li]:before:content-['']">
					<li className="my-[8px]">Membuat kesanggupan baru untuk santri yang belum memiliki kesanggupan.</li>
					<li className="mb-[8px]">
						Mengubah kesanggupan santri dan kesanggupan yang sudah ada sebelumnya. Atau dengan kata lain, membuat
						kesanggupan baru dan membatalkan kesanggupan lama
					</li>
				</ul>
			</li>
			<li className="mb-[8px]">
				Baris pada table yang berwarna merah, sebagai indikator bahwa santri belum memiliki kesanggupan sama sekali.
			</li>
		</ConfirmBullets>
	</CapabilityConfirmModal>
)

export default CapabilityHelpCreateModal
