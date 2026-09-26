import { useEffect, useRef, useState, type JSX } from "react"

import { cn } from "@roja/utils"

import LegacyTooltip from "@/components/legacy/legacy-tooltip"

import { StudentLabel, type StudentLabelVariant } from "./student-ui"

const NOTE: Record<string, { text: string; variant: StudentLabelVariant }> = {
	pendaftaran: { text: "Pendaftaran", variant: "primary" },
	"naik kelas": { text: "Naik Kelas", variant: "success" },
	"tinggal kelas": { text: "Tinggal Kelas", variant: "warning" },
	keluar: { text: "Keluar", variant: "danger" },
	mutasi: { text: "Mutasi", variant: "tertiary" },
	"santri lama": { text: "Santri lama", variant: "tertiary" },
	"kenaikan kelas": { text: "Kenaikan Kelas", variant: "info" },
	lulus: { text: "Lulus", variant: "secondary" },
}

export const kbmNoteText = (note: string | null): string => (note === null ? "" : (NOTE[note]?.text ?? ""))

type Props = { gradeStatus: string | null; gradeNote: string | null; fullname: string | null; dropoutNote: string | null }

const Dot = ({ active }: { active: boolean }): JSX.Element => (
	<LegacyTooltip content={`Status KBM : ${active ? "Active" : "Deactive"}`} className="mr-[8px]">
		<span className={cn("inline-block h-[12px] w-[12px] rounded-[12px]", active ? "bg-[var(--success)]" : "bg-[var(--danger)]")} />
	</LegacyTooltip>
)

const ReadMoreDots = (): JSX.Element => (
	<svg xmlns="http://www.w3.org/2000/svg" width="18" height="4" viewBox="0 0 18 4" className="block">
		<g transform="translate(11928 4187)">
			<circle cx="2" cy="2" r="2" transform="translate(-11928 -4187)" fill="#f8374b" />
			<circle cx="2" cy="2" r="2" transform="translate(-11921 -4187)" fill="#f8374b" />
			<circle cx="2" cy="2" r="2" transform="translate(-11914 -4187)" fill="#f8374b" />
		</g>
	</svg>
)

const DropoutNote = ({ active, fullname, dropoutNote }: { active: boolean; fullname: string | null; dropoutNote: string | null }): JSX.Element => {
	const [open, setOpen] = useState(false)
	const ref = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (!open) return undefined
		const close = (event: MouseEvent): void => {
			if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false)
		}
		document.addEventListener("mousedown", close)
		return () => document.removeEventListener("mousedown", close)
	}, [open])

	return (
		<div ref={ref} className="relative">
			<div className="flex min-w-full items-center">
				<Dot active={active} />
				<StudentLabel variant="danger" className="w-[calc(100%-72px)]! min-w-[calc(100%-72px)]!">
					Keluar
				</StudentLabel>
				<button
					type="button"
					aria-haspopup="true"
					aria-expanded={open}
					onClick={() => setOpen((value) => !value)}
					className="ml-[8px] flex h-[30px] w-[30px] min-w-[30px] cursor-pointer items-center justify-center rounded-[6px] bg-[rgba(var(--danger-rgb),0.1)] text-[var(--danger)]"
				>
					<ReadMoreDots />
				</button>
			</div>
			{open ? (
				<div className="absolute top-full right-0 z-[1000] mt-[2px] min-w-[300px] rounded-[10px] bg-[var(--bg-inverse)] p-[24px] text-left text-[12px] leading-[20px] text-[var(--body-txt-inverse)] shadow-[0px_18px_32px_0px_rgba(0,0,0,0.12)]">
					<p className="mb-[4px] font-semibold">{fullname}</p>
					{dropoutNote}
				</div>
			) : null}
		</div>
	)
}

const StudentKbmStatus = ({ gradeStatus, gradeNote, fullname, dropoutNote }: Props): JSX.Element | null => {
	const active = gradeStatus === "active"
	if (gradeNote === "keluar") return <DropoutNote active={active} fullname={fullname} dropoutNote={dropoutNote} />
	const note = gradeNote === null ? undefined : NOTE[gradeNote]
	if (!note) return null
	return (
		<div className="flex min-w-full items-center">
			<Dot active={active} />
			<StudentLabel variant={note.variant} className="min-w-[122px]!">
				{note.text}
			</StudentLabel>
		</div>
	)
}

export default StudentKbmStatus
