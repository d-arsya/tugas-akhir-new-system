import type { JSX, ReactNode } from "react"

import LegacyButton from "@/components/legacy/legacy-button"
import LegacyConfirmIcon from "@/components/legacy/legacy-confirm-icon"
import { LegacyModalOverlay } from "@/components/legacy/legacy-modal"

type AcademicYearConfirmModalProps = {
	open: boolean
	/** `$("#status-1").is(":checked")` picks between the two blades */
	psbOpen: boolean
	/** `$("#is_current-1").is(":checked")` writes the second bullet */
	isCurrent: boolean
	onCancel: () => void
	onConfirm: () => void
}

// `span.tbr_weight-semi-bold.tbr_text-primary` inside the bullets
const Highlight = ({ children }: { children: ReactNode }): JSX.Element => (
	<span className="font-semibold text-[var(--primary)]!">{children}</span>
)

// `.tbr_modal_confirm-warning ul li::before` — a 5px warning dot in place of the list marker
const BULLET =
	"relative text-left before:absolute before:top-[8px] before:left-[-13px] before:block before:h-[5px] before:w-[5px] before:rounded-full before:bg-[var(--warning)] before:content-['']"

/**
 * `academic-year/confirmation-modal.blade.php` and `…-closed.blade.php`, opened by
 * `hide-type-checkbox.js` **before** any network call: clicking Simpan only opens this, and
 * `.confirm-button` is what actually submits the form.
 *
 * The two blades differ in the first bullet and the confirm label; the second bullet is written
 * by the modal's `open` callback from the `is_current` switch, so it is the same in both.
 */
const AcademicYearConfirmModal = ({
	open,
	psbOpen,
	isCurrent,
	onCancel,
	onConfirm,
}: AcademicYearConfirmModalProps): JSX.Element => (
	<LegacyModalOverlay open={open} maxWidth="500px">
		<section>
			<div className="rounded-[20px] bg-[var(--bg-secondary)] p-[30px] shadow-[0px_8px_30px_0px_rgba(0,0,0,0.08)]">
				{/* `.tbr_modal_confirm-warning .tbr_confirm_icon svg circle|path { fill: var(--warning) }` */}
				<div className="mb-[14px] text-center [&_svg_circle]:fill-[var(--warning)] [&_svg_path]:fill-[var(--warning)]">
					<LegacyConfirmIcon />
				</div>
				<div className="mb-[26px] text-center">
					<div className="mb-[12px] text-[20px] leading-[22.4px] font-bold text-[var(--heading-txt-inverse)]">
						Konfirmasi
					</div>
					Yang wajib diketahui sebelum menyimpan data tahun ajaran.
					<ul className="mt-0 mb-[16px] list-none pl-[40px]">
						<li className={BULLET}>
							{psbOpen ? (
								<>
									PSB - Pendaftaran jalur reguler atau indent akan <Highlight>dibuka</Highlight>. Sehingga PSB dapat
									diakses oleh publik atau pendaftar
								</>
							) : (
								<>
									PSB - Pendaftaran jalur reguler atau indent <Highlight>belum dibuka</Highlight>. Sehingga PSB tidak
									dapat diakses oleh publik atau pendaftar
								</>
							)}
						</li>
						<li className={BULLET}>
							{isCurrent ? (
								<>
									Akademik - Tahun ajaran ini dinyatakan <Highlight>sedang berjalan</Highlight>. Sehingga memungkinkan
									terdapat tahun ajaran lain dinyatakan berakhir
								</>
							) : (
								<>
									Akademik - Tahun ajaran ini dinyatakan <Highlight>tidak sedang berjalan</Highlight>. Sehingga
									memungkinkan terdapat tahun ajaran lain yang sedang berjalan
								</>
							)}
						</li>
					</ul>
				</div>
				<div className="mb-[4px] flex justify-center text-center">
					<LegacyButton variant="light" className="mr-[8px]" onClick={onCancel}>
						Batal
					</LegacyButton>{" "}
					{/* `.tbr_btn-warning` (app.css 779-797); the kit has no warning variant yet */}
					<LegacyButton
						variant="danger"
						className="bg-[var(--warning)] shadow-[0px_8px_10px_0px_rgba(255,168,0,0.25)]"
						onClick={onConfirm}
					>
						{psbOpen ? "Ya, buka PSB sekarang" : "Ya, simpan"}
					</LegacyButton>
				</div>
			</div>
		</section>
	</LegacyModalOverlay>
)

export default AcademicYearConfirmModal
