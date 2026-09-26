import type { JSX } from "react"

import type { AdminRegistrantDetail } from "@roja/types"
import { cn } from "@roja/utils"

export type RegistrantStepModal = "validation" | "indent" | "regular"

type ItemState = "success" | "waiting" | "failed" | "plain"

const ICON: Record<ItemState, string> = {
	plain: "bg-[var(--bg-form-border)] bg-[url('/assets/svg/etc/Widget-Progress-Unchecked.svg')]",
	success:
		"bg-[var(--secondary)] bg-[url('/assets/svg/etc/Widget-Progress-Unchecked.svg')] shadow-[0px_8px_10px_0px_rgba(141,195,30,0.25)]",
	waiting:
		"bg-[var(--warning)] bg-[url('/assets/svg/etc/Widget-Progress-Waiting.svg')] shadow-[0px_8px_10px_0px_rgba(255,168,0,0.25)]",
	failed: "bg-[var(--danger)] bg-[url('/assets/svg/etc/Widget-Progress-Failed.svg')] shadow-[0px_8px_10px_0px_rgba(248,55,75,0.25)]",
}

const NOTE: Record<ItemState, string> = {
	plain: "",
	success: "text-[var(--secondary)]",
	waiting: "text-[var(--warning)]",
	failed: "text-[var(--danger)]",
}

export const PROGRESS_ITEM =
	"relative flex items-center justify-start py-[8px] whitespace-normal before:absolute before:top-[1px] before:left-[18px] before:h-full before:w-px before:border-l before:border-dashed before:border-[var(--bg-quaternary)]! before:bg-transparent before:content-['']"

type ItemProps = { state: ItemState; title: string; note?: string; onOpen?: () => void }

const ProgressItem = ({ state, title, note, onOpen }: ItemProps): JSX.Element => {
	const body = (
		<>
			<div className={cn("z-[1] h-[36px] w-[36px] shrink-0 rounded-[8px] bg-center bg-no-repeat", ICON[state])} />
			<div className="pl-[22px]">
				<span className="mb-[-2px] block font-semibold text-[var(--body-txt-inverse)]">{title}</span>
				{note !== undefined ? <span className={cn("block text-[90%] font-semibold italic", NOTE[state])}>{note}</span> : null}
			</div>
		</>
	)
	if (onOpen === undefined) return <span className={PROGRESS_ITEM}>{body}</span>
	return (
		<a
			href="#"
			onClick={(event) => {
				event.preventDefault()
				onOpen()
			}}
			className={PROGRESS_ITEM}
		>
			{body}
		</a>
	)
}

type RegistrantProgressProps = { detail: AdminRegistrantDetail; onOpen: (modal: RegistrantStepModal) => void }

const RegistrantProgress = ({ detail, onOpen }: RegistrantProgressProps): JSX.Element => {
	const { dataValidation, registrationPath, indentTest, regularTest } = detail
	const open = (modal: RegistrantStepModal) => () => onOpen(modal)

	const validation =
		dataValidation === "valid" ? (
			<ProgressItem state="success" title="Validasi Data" note="Data Valid" onOpen={open("validation")} />
		) : dataValidation === "invalid" ? (
			<ProgressItem state="failed" title="Validasi Data" note="Data tidak valid" onOpen={open("validation")} />
		) : dataValidation === "fixed" ? (
			<ProgressItem state="waiting" title="Validasi Data" note="Sudah diperbaiki" onOpen={open("validation")} />
		) : (
			<ProgressItem state="plain" title="Validasi Data" onOpen={open("validation")} />
		)

	let indent: JSX.Element | null = null
	if (registrationPath === "indent") {
		indent =
			indentTest === "success" ? (
				<ProgressItem state="success" title="Tes Indent" note="Lolos tes" onOpen={open("indent")} />
			) : indentTest === "failed" ? (
				<ProgressItem state="failed" title="Tes Indent" note="Tidak lolos tes" onOpen={open("indent")} />
			) : dataValidation === "valid" ? (
				<ProgressItem state="plain" title="Tes Indent" onOpen={open("indent")} />
			) : (
				<ProgressItem state="plain" title="Tes Indent" />
			)
	}

	let regular: JSX.Element | null = null
	if ((registrationPath === "indent" && indentTest === "failed") || registrationPath === "reguler") {
		const reachable = dataValidation === "valid" || indentTest === "success"
		regular =
			regularTest === "success" ? (
				<ProgressItem state="success" title="Tes Regular" note="Lolos tes" onOpen={open("regular")} />
			) : regularTest === "failed" ? (
				<ProgressItem state="failed" title="Tes Regular" note="Tidak lolos tes" onOpen={open("regular")} />
			) : reachable ? (
				<ProgressItem state="plain" title="Tes Regular" onOpen={open("regular")} />
			) : (
				<ProgressItem state="plain" title="Tes Regular" />
			)
	}

	return (
		<>
			{validation}
			{indent}
			{regular}
		</>
	)
}

export default RegistrantProgress
