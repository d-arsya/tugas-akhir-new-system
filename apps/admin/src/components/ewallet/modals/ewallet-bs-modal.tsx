import { useEffect, useState, type JSX, type ReactNode } from "react"
import { createPortal } from "react-dom"

import { cn } from "@roja/utils"

const REMOVAL_MS = 300

let openCount = 0
const lockBody = (lock: boolean): void => {
	openCount += lock ? 1 : -1
	document.body.style.overflow = openCount > 0 ? "hidden" : ""
}

type EwalletBsModalProps = {
	id: string
	open: boolean
	onClose?: () => void
	isStatic?: boolean
	children: ReactNode
}

const EwalletBsModal = ({ id, open, onClose, isStatic = false, children }: EwalletBsModalProps): JSX.Element | null => {
	const [mounted, setMounted] = useState(open)
	const [shown, setShown] = useState(false)

	useEffect(() => {
		if (open) {
			setMounted(true)
			const frame = requestAnimationFrame(() => setShown(true))
			return () => cancelAnimationFrame(frame)
		}
		setShown(false)
		const timer = window.setTimeout(() => setMounted(false), REMOVAL_MS)
		return () => window.clearTimeout(timer)
	}, [open])

	useEffect(() => {
		if (!mounted) return
		lockBody(true)
		return () => lockBody(false)
	}, [mounted])

	useEffect(() => {
		if (!open || isStatic || !onClose) return
		const onKey = (event: KeyboardEvent): void => {
			if (event.key === "Escape") onClose()
		}
		document.addEventListener("keydown", onKey)
		return () => document.removeEventListener("keydown", onKey)
	}, [open, isStatic, onClose])

	if (!mounted) return null

	return createPortal(
		<>
			<div
				aria-hidden="true"
				className={cn("fixed top-0 left-0 z-[1090] h-screen w-screen bg-black transition-opacity duration-150 ease-linear", shown ? "opacity-50" : "opacity-0")}
			/>
			<div
				id={id}
				role="dialog"
				aria-modal="true"
				tabIndex={-1}
				className={cn("fixed top-0 left-0 z-[1100] h-full w-full overflow-x-hidden overflow-y-auto outline-0 transition-opacity duration-150 ease-linear", shown ? "opacity-100" : "opacity-0")}
				onMouseDown={(event) => {
					if (event.target === event.currentTarget && !isStatic) onClose?.()
				}}
			>
				<div
					className={cn(
						"pointer-events-none relative m-[8px] w-auto max-w-[440px] transition-transform duration-300 ease-out min-[576px]:mx-auto min-[576px]:my-[28px]",
						shown ? "transform-none" : "-translate-y-[50px]",
					)}
				>
					<div className="pointer-events-auto relative flex w-full flex-col rounded-[20px] border border-black/20 bg-white bg-clip-padding outline-0">
						<div className="relative flex-auto p-[30px]">{children}</div>
					</div>
				</div>
			</div>
		</>,
		document.body,
	)
}

export default EwalletBsModal
