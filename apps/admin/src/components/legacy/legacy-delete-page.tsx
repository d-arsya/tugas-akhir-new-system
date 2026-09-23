import { Link } from "@tanstack/react-router"
import type { JSX, ReactNode } from "react"

import { cn } from "@roja/utils"

import LegacyButton, { legacyButtonClass } from "./legacy-button"
import LegacyConfirmIcon from "./legacy-confirm-icon"
import { BackArrowIcon } from "./legacy-icons"

/**
 * The shell shared by every Data Master delete and delegate page — eleven of them across
 * Tahun Ajaran, Jenjang and Akun. Port of `academic-year/delete/*.blade.php` and its twins:
 *
 *   .row.justify-content-center > .col-xl-9.col-lg-11
 *     .card.tbr_card.tbr_delete          ← Delete-Bg.svg behind the body
 *       a.tbr_btn-back                   ← 40×40 purple arrow, outside the body
 *       .card-body.p-4 > form#main-form
 *         .text-center.mb-3   → the 69×69 red "?" circle
 *         .text-center        → heading, optional picker, description, actions
 *
 * `locked` reproduces `.tbr_bulk_action.opacity`: 0.2 opacity and `pointer-events: none`,
 * with **no** `disabled` attribute — that is how legacy renders a step whose data is not
 * ready yet (an active registrant, an active santri).
 */
type LegacyDeletePageProps = {
	/** Both the back arrow and the "Batal" link. */
	backTo: string
	heading: ReactNode
	description?: ReactNode
	/** The centred `col-xl-7` block — a destination picker on the delegate steps. */
	children?: ReactNode
	/**
	 * Legacy prints this twice: one paragraph below 576px, two above. Pass both lines and the
	 * component renders both variants.
	 */
	helperLines?: readonly [string, string]
	confirmLabel?: string
	locked?: boolean
	loading: boolean
	onConfirm: () => void
}

const LegacyDeletePage = ({
	backTo,
	heading,
	description,
	children,
	helperLines,
	confirmLabel = "Ya, hapus",
	locked = false,
	loading,
	onConfirm,
}: LegacyDeletePageProps): JSX.Element => (
	<div className="mx-[-15px] flex flex-wrap justify-center">
		<div className="w-full px-[15px] min-[576px]:w-full min-[992px]:w-11/12 min-[1200px]:w-3/4">
			<div className="relative flex min-w-0 flex-col border-0 bg-transparent shadow-none">
				{/*
				 * `.tbr_delete .tbr_btn-back` (app.css 2822, 3009): 40×40, no padding, --bg-inverse,
				 * absolutely positioned against the card. Above 992px it hangs outside the card on
				 * the right (`right: -50px`, vertically at its static position, i.e. the card's top
				 * edge); at 992px and below it tucks into the card's top-right corner.
				 */}
				<Link
					to={backTo}
					className="absolute top-[10px] right-[10px] z-[1] inline-flex h-[40px] w-[40px] min-w-[40px] items-center justify-center rounded-[6px] bg-[var(--bg-inverse)] p-0 transition-all duration-300 min-[993px]:top-0 min-[993px]:right-[-50px]"
					aria-label="Kembali"
				>
					<BackArrowIcon />
				</Link>

				{/* `.tbr_delete .card-body` carries Delete-Bg.svg, contained, top-left, no repeat */}
				<div className="min-h-px flex-auto rounded-[20px] bg-[var(--bg-secondary)] bg-[url('/assets/svg/etc/Delete-Bg.svg')] bg-contain bg-[position:top_left] bg-no-repeat p-[24px] shadow-[0px_8px_30px_0px_rgba(0,0,0,0.08)]">
					<form
						onSubmit={(event) => {
							event.preventDefault()
							onConfirm()
						}}
					>
						<div className="mb-[16px] text-center">
							<LegacyConfirmIcon />
						</div>
						<div className="text-center">
							{/* `.tbr_card_title` carries margin-bottom 8px; `.tbr_delete` only overrides line-height */}
							<h4 className="mt-0! mb-[8px]! text-[20px]! leading-[26px]! font-bold! tracking-normal! text-[var(--heading-txt-inverse)]!">
								{heading}
							</h4>

							{children ? (
								<div className="mx-[-15px] mt-[24px] mb-[16px] flex flex-wrap justify-center">
									<div className="w-full px-[15px] min-[992px]:w-7/12">
										{/* `.tbr_delete .form-group .select2-container--bootstrap` (app.css 2816):
										    the picker is capped at 400px and centred inside the column */}
										<div className="mx-auto mb-[16px] max-w-[400px]">{children}</div>
										{helperLines ? (
											<>
												{/* porto's `p { line-height: 24px }` — these two are `.tbr_text-grey` paragraphs */}
												<div className="min-[576px]:hidden">
													<p className="mt-[8px] mb-0 leading-[24px] text-[var(--grey)]">
														{helperLines[0]} {helperLines[1]}
													</p>
												</div>
												<div className="hidden min-[576px]:block">
													<p className="mt-[8px] mb-0 leading-[24px] text-[var(--grey)]">{helperLines[0]}</p>
													<p className="mb-0 leading-[24px] text-[var(--grey)]">{helperLines[1]}</p>
												</div>
											</>
										) : null}
									</div>
								</div>
							) : null}

							{description ? <p className="mt-0 mb-[24px] leading-[24px]">{description}</p> : null}

							<div className="mb-[8px] text-center">
								{/* Legacy's Batal is `a.btn.tbr_btn.tbr_btn-light.d-inline-flex.mr-2`, i.e. the same box
								    as the button beside it — sharing `legacyButtonClass` keeps them on one baseline */}
								<Link to={backTo} className={legacyButtonClass("light", "mr-[8px]")}>
									Batal
								</Link>{" "}
								<LegacyButton
									type="submit"
									variant="danger"
									loading={loading}
									className={cn(locked && "pointer-events-none opacity-20")}
								>
									{confirmLabel}
								</LegacyButton>
							</div>
						</div>
					</form>
				</div>
			</div>
		</div>
	</div>
)

export default LegacyDeletePage
