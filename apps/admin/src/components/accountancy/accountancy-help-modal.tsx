import type { JSX } from "react"

import LegacyButton from "@/components/legacy/legacy-button"
import LegacyConfirmIcon from "@/components/legacy/legacy-confirm-icon"
import { LegacyModalOverlay } from "@/components/legacy/legacy-modal"

type AccountancyHelpModalProps = { open: boolean; onClose: () => void }

const BULLET =
	"relative before:absolute before:top-[8px] before:left-[-13px] before:block before:h-[5px] before:w-[5px] before:rounded-full before:bg-[var(--warning)] before:content-['']"

const AccountancyHelpModal = ({ open, onClose }: AccountancyHelpModalProps): JSX.Element => (
	<LegacyModalOverlay open={open} maxWidth="500px">
		<section>
			<div className="rounded-[20px] bg-[var(--bg-secondary)] px-[8px] py-[24px] shadow-[0px_8px_30px_0px_rgba(0,0,0,0.08)]">
				<div className="mb-[14px] text-center">
					<LegacyConfirmIcon variant="warning" />
				</div>
				<div className="mb-[26px] text-center">
					<div className="mb-[12px] text-[20px] leading-[22.4px] font-bold text-[var(--heading-txt-inverse)]">
						Bantuan
					</div>
				</div>
				<ul className="mt-0 mb-[24px] list-none pl-[40px]">
					<li className={`mb-[8px] ${BULLET}`}>
						Pilih <span className="font-bold text-[var(--primary)]!">Induk Akun</span> jika akun yang Anda buat
						adalah akun induk atau akun utama
					</li>
					<li className={BULLET}>
						Pilih <span className="font-bold text-[var(--primary)]!">Anak Akun</span> jika Anda ingin menjadikan
						akun yang dibuat sebagai anak akun atau sub akun
					</li>
				</ul>
				<div className="mb-[4px] text-center">
					<LegacyButton variant="primary" className="mr-[8px]" onClick={onClose}>
						Tutup
					</LegacyButton>
				</div>
			</div>
		</section>
	</LegacyModalOverlay>
)

export default AccountancyHelpModal
