import type { JSX, ReactNode } from "react"

import { cn } from "@roja/utils"

import EditorIcon, { type EditorIconName } from "./legacy-editor-icons"

const BTN =
	"inline-block cursor-pointer rounded-none border-0 bg-[var(--bg-inverse)] px-[10.4px] py-[4.48px] text-center align-middle text-[12px] leading-[1.5] whitespace-nowrap text-[var(--body-txt-inverse)] outline-none select-none"
const BTN_ACTIVE = "bg-[#dae0e5]"

export const ROUND_L = "rounded-l-[6px]"
export const ROUND_R = "rounded-r-[6px]"
export const ROUND_ALL = "rounded-[6px]"

type EditorButtonProps = {
	title: string
	icon?: EditorIconName
	active?: boolean
	className?: string
	onAction: () => void
	children?: ReactNode
	caret?: boolean
}

const Caret = (): JSX.Element => (
	<>
		{" "}
		<EditorIcon name="caret" />
	</>
)

export const EditorButton = ({ title, icon, active = false, className, onAction, children, caret = false }: EditorButtonProps): JSX.Element => (
	<button
		type="button"
		tabIndex={-1}
		title={title}
		aria-label={title}
		aria-pressed={active}
		onMouseDown={(event) => event.preventDefault()}
		onClick={onAction}
		className={cn(BTN, active && BTN_ACTIVE, className)}
	>
		{icon !== undefined ? <EditorIcon name={icon} /> : null}
		{children}
		{caret ? <Caret /> : null}
	</button>
)

export const EditorGroup = ({ className, children }: { className?: string; children: ReactNode }): JSX.Element => (
	<div className={cn("relative mt-[5px] mr-[5px] inline-flex align-middle", className)}>{children}</div>
)

export const EditorDropdown = ({ className, children }: { className?: string; children: ReactNode }): JSX.Element => (
	<div
		role="list"
		className={cn(
			"absolute top-full left-0 z-[1020] mt-[2px] block w-auto rounded-[0.25rem] border border-[rgba(0,0,0,0.15)]! bg-white py-[8px] text-left text-[12px] text-[var(--body-txt-inverse)]",
			className,
		)}
	>
		{children}
	</div>
)

export const EditorDropdownItem = ({ onAction, children }: { onAction: () => void; children: ReactNode }): JSX.Element => (
	<a
		href="#"
		role="listitem"
		onMouseDown={(event) => event.preventDefault()}
		onClick={(event) => {
			event.preventDefault()
			onAction()
		}}
		className="block w-full bg-transparent px-[24px] py-[4px] text-left whitespace-nowrap text-[var(--body-txt-inverse)] hover:bg-[#f8f9fa]"
	>
		{children}
	</a>
)
