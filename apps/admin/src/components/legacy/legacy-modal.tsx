import { useEffect, useState, type JSX, type ReactNode } from "react"
import { createPortal } from "react-dom"

import { cn } from "@roja/utils"

const REMOVAL_DELAY_MS = 300

type OverlayProps = { open: boolean; maxWidth: string; children: ReactNode }

export const LegacyModalOverlay = ({ open, maxWidth, children }: OverlayProps): JSX.Element | null => {
	const [mounted, setMounted] = useState(open)
	const [ready, setReady] = useState(false)

	useEffect(() => {
		if (open) {
			setMounted(true)
			const frame = requestAnimationFrame(() => setReady(true))
			return () => cancelAnimationFrame(frame)
		}
		setReady(false)
		const timer = window.setTimeout(() => setMounted(false), REMOVAL_DELAY_MS)
		return () => window.clearTimeout(timer)
	}, [open])

	if (!mounted) return null

	return createPortal(
		<>
			<div
				aria-hidden="true"
				className={cn(
					"fixed inset-0 z-[10000] overflow-hidden bg-[#0f111a] transition-opacity duration-300 ease-out",
					ready ? "opacity-60" : "opacity-0",
				)}
			/>
			<div
				role="dialog"
				aria-modal="true"
				style={{ maxWidth }}
				className={cn(
					"fixed top-0 right-0 left-0 z-[10001] mx-auto my-[40px] px-[10px] text-left transition-all duration-200 ease-in-out",
					ready ? "scale-100 opacity-100" : "scale-[0.8] opacity-0",
				)}
			>
				{children}
			</div>
		</>,
		document.body,
	)
}

type LegacyModalProps = {
	open: boolean
	onClose: () => void
	size?: "default" | "sm"
	title?: ReactNode
	icon?: ReactNode
	footer?: ReactNode
	children: ReactNode
}

const LegacyModal = ({ open, size = "default", title, icon, footer, children }: LegacyModalProps): JSX.Element | null => (
	<LegacyModalOverlay open={open} maxWidth={size === "sm" ? "400px" : "600px"}>
		<section className="flex max-h-[calc(100vh-70px)] flex-col overflow-hidden rounded-[20px]">
			{title !== undefined || icon !== undefined ? (
				<header className="flex min-h-[68px] shrink-0 items-center justify-between rounded-t-[20px] border-0 bg-[var(--bg-tertiary)] px-[30px]">
					<h2 className="m-0! p-0! text-[16px]! leading-[18px]! font-semibold! tracking-normal! text-[var(--heading-txt-inverse)]!">
						{title}
					</h2>
					{icon}
				</header>
			) : null}
			<div
				className={cn(
					"overflow-y-auto bg-[var(--bg-secondary)] p-[30px]",
					title === undefined && icon === undefined && "rounded-t-[20px]",
					footer === undefined && "rounded-b-[20px]",
				)}
			>
				{children}
			</div>
			{footer !== undefined ? (
				<footer className="-mt-[5px] flex min-h-[68px] shrink-0 items-center justify-end rounded-b-[20px] border-0 bg-[var(--bg-tertiary)] px-[30px]">
					<div className="text-right">{footer}</div>
				</footer>
			) : null}
		</section>
	</LegacyModalOverlay>
)

export default LegacyModal
