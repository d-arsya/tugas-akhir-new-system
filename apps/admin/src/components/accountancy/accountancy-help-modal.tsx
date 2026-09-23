import type { JSX } from "react"

import LegacyButton from "@/components/legacy/legacy-button"
import LegacyConfirmIcon from "@/components/legacy/legacy-confirm-icon"
import { LegacyModalOverlay } from "@/components/legacy/legacy-modal"

/**
 * `#modalHelp` (`accountancy/partials/modal-help.blade.php`), opened by `modalHelp()` in
 * `assets/js/account/general.js` from the orange "?" beside "Terapkan sebagai".
 *
 * It is a `.tbr_modal_confirm.tbr_modal_confirm-warning` (app.css 1933-1999): 500px wide, and
 * the `-warning` modifier re-fills `svg circle, svg path` with `--warning`. The partial's own
 * `fill="#f8374b"` is a presentation attribute, which any stylesheet rule outranks — so the
 * glyph the blade writes in red actually renders **orange**.
 *
 * The same modifier drops the list markers and draws its own 5px orange dot per `li`.
 */
type AccountancyHelpModalProps = { open: boolean; onClose: () => void }

// `.tbr_modal_confirm-warning ul li::before`: a 5px disc at left:-13px, top:8px
const BULLET =
	"relative before:absolute before:top-[8px] before:left-[-13px] before:block before:h-[5px] before:w-[5px] before:rounded-full before:bg-[var(--warning)] before:content-['']"

const AccountancyHelpModal = ({ open, onClose }: AccountancyHelpModalProps): JSX.Element => (
	<LegacyModalOverlay open={open} maxWidth="500px">
		<section>
			{/* `.card-body.px-2.py-4`, radius 20px from `.tbr_modal_confirm .card-body` */}
			<div className="rounded-[20px] bg-[var(--bg-secondary)] px-[8px] py-[24px] shadow-[0px_8px_30px_0px_rgba(0,0,0,0.08)]">
				<div className="mb-[14px] text-center">
					<LegacyConfirmIcon variant="warning" />
				</div>
				<div className="mb-[26px] text-center">
					<div className="mb-[12px] text-[20px] leading-[22.4px] font-bold text-[var(--heading-txt-inverse)]">
						Bantuan
					</div>
				</div>
				{/* `<ul class="mb-4">` — no bootstrap reset, so the browser's 40px list indent stands, and
				    the list inherits the modal's 22.4px line height rather than porto's 24px for `<p>` */}
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
				{/* `div.tbr_confirm_actions.text-center` — a block, so the blade's trailing space survives */}
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
