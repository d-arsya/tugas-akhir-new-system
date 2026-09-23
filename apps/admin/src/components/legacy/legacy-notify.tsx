import { useEffect, useRef, useState, useSyncExternalStore, type JSX } from "react"
import { createPortal } from "react-dom"

// Port of the legacy PNotify notices (`new PNotify({ title, text, type, width: "340px", animate_speed: "fast" })`)

type NoticeType = "error" | "success"
type Notice = { id: number; title: string; lines: string[]; type: NoticeType; delay: number }

// PNotify default delay
const DISMISS_MS = 8000
const FADE_MS = 200

let notices: Notice[] = []
let nextId = 1
const listeners = new Set<() => void>()
const emit = (): void => listeners.forEach((listener) => listener())

const push = (type: NoticeType, title: string, lines: string[], delay: number): void => {
	notices = [...notices, { id: nextId++, title, lines, type, delay }]
	emit()
}

const remove = (id: number): void => {
	notices = notices.filter((notice) => notice.id !== id)
	emit()
}

// Some legacy scripts pass their own `delay` (e.g. `setting/update-status.js` uses 2000)
type NotifyOptions = { delay?: number }

// Legacy texts use `<br />` between lines
export const legacyNotify = {
	error: (lines: string | string[], title = "Gagal!", options?: NotifyOptions): void =>
		push("error", title, Array.isArray(lines) ? lines : [lines], options?.delay ?? DISMISS_MS),
	success: (lines: string | string[], title = "Berhasil!", options?: NotifyOptions): void =>
		push("success", title, Array.isArray(lines) ? lines : [lines], options?.delay ?? DISMISS_MS),
}

const CONTAINER_TYPE: Record<NoticeType, string> = {
	error: "bg-[var(--danger)] shadow-[0px_8px_10px_0px_rgba(248,55,75,0.25)]",
	success: "bg-[var(--success)] shadow-[0px_8px_10px_0px_rgba(40,175,82,0.25)]",
}

const CloseIcon = (): JSX.Element => (
	<svg viewBox="0 0 352 512" width="11" height="16" fill="currentColor" aria-hidden="true">
		<path d="M242.72 256l100.07-100.07c12.28-12.28 12.28-32.19 0-44.48l-22.24-22.24c-12.28-12.28-32.19-12.28-44.48 0L176 189.28 75.93 89.21c-12.28-12.28-32.19-12.28-44.48 0L9.21 111.45c-12.28 12.28-12.28 32.19 0 44.48L109.28 256 9.21 356.07c-12.28 12.28-12.28 32.19 0 44.48l22.24 22.24c12.28 12.28 32.2 12.28 44.48 0L176 322.72l100.07 100.07c12.28 12.28 32.2 12.28 44.48 0l22.24-22.24c12.28-12.28 12.28-32.19 0-44.48L242.72 256z" />
	</svg>
)

const NoticeCard = ({ notice }: { notice: Notice }): JSX.Element => {
	const [visible, setVisible] = useState(false)
	const [hovered, setHovered] = useState(false)
	const timer = useRef<number | undefined>(undefined)

	const close = (): void => {
		setVisible(false)
		window.setTimeout(() => remove(notice.id), FADE_MS)
	}

	useEffect(() => {
		const frame = requestAnimationFrame(() => setVisible(true))
		return () => cancelAnimationFrame(frame)
	}, [])

	// PNotify `mouse_reset`: hovering restarts the countdown
	useEffect(() => {
		if (hovered) return undefined
		timer.current = window.setTimeout(close, notice.delay)
		return () => window.clearTimeout(timer.current)
	}, [hovered])

	return (
		<div
			role="alert"
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
			className={`relative w-[340px] rounded-[12px] transition-opacity duration-200 ${visible ? "opacity-100" : "opacity-0"}`}
		>
			<div className={`min-h-[16px] rounded-[12px] px-[24px] py-[20px] text-[12px] leading-[22.4px] text-white/70 ${CONTAINER_TYPE[notice.type]}`}>
				<button
					type="button"
					title="Close"
					onClick={close}
					className={`absolute top-[5px] right-[5px] flex h-[30px] w-[30px] cursor-pointer items-center justify-center text-white ${hovered ? "visible" : "invisible"}`}
				>
					<CloseIcon />
				</button>
				{/* "!" utilities: globals.css styles h4 outside any @layer */}
				<h4 className="m-0! mb-[5.6px]! text-[14px]! leading-[22.4px]! font-semibold! text-white!">{notice.title}</h4>
				<div className="text-[12px] leading-[18px] text-white">
					{notice.lines.map((line, index) => (
						<span key={index}>
							{index > 0 ? <br /> : null}
							{line}
						</span>
					))}
				</div>
			</div>
		</div>
	)
}

const subscribe = (listener: () => void): (() => void) => {
	listeners.add(listener)
	return () => listeners.delete(listener)
}

// Mounted once by the admin shell; notices stack downwards from the top-right corner
export const LegacyNotifyHost = (): JSX.Element => {
	const list = useSyncExternalStore(subscribe, () => notices)
	return createPortal(
		<div className="pointer-events-none fixed top-[15px] right-[15px] z-[99999] flex flex-col gap-[15px] [&>*]:pointer-events-auto">
			{list.map((notice) => (
				<NoticeCard key={notice.id} notice={notice} />
			))}
		</div>,
		document.body,
	)
}
