import type { JSX, ReactNode } from "react"

import { cn } from "@roja/utils"

import LegacyButton from "@/components/legacy/legacy-button"
import LegacyConfirmIcon from "@/components/legacy/legacy-confirm-icon"
import { LegacyModalOverlay } from "@/components/legacy/legacy-modal"

/**
 * The `.tbr_modal_confirm` shell the Kesanggupan menu reuses five times
 * (`modal-student-cost`, `modal-publish`, `modal-publish-mass-create`, `modal-change`,
 * `modal-help`, `modal-help-create-capability`).
 *
 * app.css 1933-1999: 500px wide, a 69px glyph tinted by the `-danger` / `-warning` suffix
 * with 14px under it, a 20px bold title with 12px under it, 26px under the title block,
 * and 4px under the actions. `.tbr_modal_confirm-warning ul` strips the list marker and
 * paints its own 5px `--warning` dot at `left: -13px; top: 8px`.
 */
type CapabilityConfirmModalProps = {
	open: boolean
	variant: "danger" | "warning"
	title: string
	children: ReactNode
	/** `.card-body` is `px-2 py-4` on every one of these except the help-create modal (`px-4 py-4`). */
	wide?: boolean
	footer: ReactNode
	/** `mass-create-ajax.js` `showProgressBar()` — the striped bar under the actions while posting. */
	progress?: { visible: boolean; label: string; percent: number }
}

/**
 * `.tbr_modal_confirm-warning ul li::before`. Written as a component rather than a global
 * rule so nothing outside this menu inherits the dot.
 */
export const ConfirmBullets = ({ variant, children }: { variant: "danger" | "warning"; children: ReactNode }): JSX.Element => (
	<ul
		className={cn(
			"mb-[24px] list-none pl-0",
			"[&>li]:relative [&>li]:before:absolute [&>li]:before:top-[8px] [&>li]:before:left-[-13px] [&>li]:before:block [&>li]:before:h-[5px] [&>li]:before:w-[5px] [&>li]:before:rounded-full [&>li]:before:content-['']",
			variant === "warning" ? "[&>li]:before:bg-[var(--warning)]" : "[&>li]:before:bg-[var(--danger)]",
		)}
	>
		{children}
	</ul>
)

const CapabilityConfirmModal = ({
	open,
	variant,
	title,
	children,
	wide = false,
	footer,
	progress,
}: CapabilityConfirmModalProps): JSX.Element => (
	<LegacyModalOverlay open={open} maxWidth="500px">
		<section>
			{/* `.card-body.px-2.py-4` — 20px radius, `--bg-secondary` */}
			<div
				className={cn(
					"rounded-[20px] bg-[var(--bg-secondary)] py-[24px] shadow-[0px_8px_30px_0px_rgba(0,0,0,0.08)]",
					wide ? "px-[24px]" : "px-[8px]",
				)}
			>
				{/* `.tbr_confirm_icon.text-center` */}
				<div className="mb-[14px] text-center">
					<LegacyConfirmIcon variant={variant} />
				</div>
				{/* `.tbr_confirm_contents.text-center` */}
				<div className="mb-[26px] text-center">
					<div className="mb-[12px] text-[20px] leading-[22.4px] font-bold text-[var(--heading-txt-inverse)]">{title}</div>
				</div>
				{children}
				{/* `.tbr_confirm_actions.text-center` */}
				<div className="mb-[4px] text-center">{footer}</div>
				{progress !== undefined && progress.visible ? (
					// `.progress-wrapper.p-4` + a 5px `.progress` bar on `--secondary`-adjacent #8DC31E
					<div className="p-[24px]">
						<p className="m-0">{progress.label}</p>
						<div className="h-[5px] overflow-hidden rounded-[4px] bg-[var(--bg-tertiary)]">
							<div
								role="progressbar"
								className="h-full bg-[#8DC31E] transition-[width] duration-150"
								style={{ width: `${progress.percent}%` }}
							/>
						</div>
					</div>
				) : null}
			</div>
		</section>
	</LegacyModalOverlay>
)

export default CapabilityConfirmModal

/** The `Batal` / `Lanjut` pair every confirm modal here ends with. */
export const ConfirmActions = ({
	onCancel,
	onConfirm,
	confirmLabel,
	confirmVariant = "primary",
	submitting = false,
}: {
	onCancel: () => void
	onConfirm: () => void
	confirmLabel: string
	confirmVariant?: "primary" | "danger"
	submitting?: boolean
}): JSX.Element => (
	<>
		<LegacyButton variant="light" className="mr-[8px]" onClick={onCancel}>
			Batal
		</LegacyButton>{" "}
		<LegacyButton variant={confirmVariant} className="mr-[8px]" loading={submitting} onClick={onConfirm}>
			{confirmLabel}
		</LegacyButton>
	</>
)
