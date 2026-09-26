import type { JSX, ReactNode } from "react"

import { cn } from "@roja/utils"

import LegacyButton from "@/components/legacy/legacy-button"
import LegacyConfirmIcon from "@/components/legacy/legacy-confirm-icon"
import { LegacyModalOverlay } from "@/components/legacy/legacy-modal"

type CapabilityConfirmModalProps = {
	open: boolean
	variant: "danger" | "warning"
	title: string
	children: ReactNode
	wide?: boolean
	footer: ReactNode
	progress?: { visible: boolean; label: string; percent: number }
}

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
			<div
				className={cn(
					"rounded-[20px] bg-[var(--bg-secondary)] py-[24px] shadow-[0px_8px_30px_0px_rgba(0,0,0,0.08)]",
					wide ? "px-[24px]" : "px-[8px]",
				)}
			>
				<div className="mb-[14px] text-center">
					<LegacyConfirmIcon variant={variant} />
				</div>
				<div className="mb-[26px] text-center">
					<div className="mb-[12px] text-[20px] leading-[22.4px] font-bold text-[var(--heading-txt-inverse)]">{title}</div>
				</div>
				{children}
				<div className="mb-[4px] text-center">{footer}</div>
				{progress !== undefined && progress.visible ? (
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
