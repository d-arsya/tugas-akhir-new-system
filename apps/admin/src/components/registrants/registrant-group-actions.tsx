import { useEffect, useRef, useState, type JSX } from "react"
import { Link } from "@tanstack/react-router"

import type { AdminRegistrantExportStatus } from "@roja/types"
import { cn } from "@roja/utils"

import { legacyButtonClass } from "@/components/legacy/legacy-button"
import { BackArrowIcon } from "@/components/legacy/legacy-icons"
import LegacyTooltip from "@/components/legacy/legacy-tooltip"
import { useDownloadRegistrants } from "@/hooks/use-registrants-write"
import { RIPPLE_CLASS, triggerRipple } from "@/lib/ripple"

const EXPORTS: ReadonlyArray<{ status: AdminRegistrantExportStatus; label: string }> = [
	{ status: "", label: "Semua" },
	{ status: "wait", label: "Baru" },
	{ status: "approve", label: "Diterima" },
	{ status: "reject", label: "Tidak Diterima" },
]

const SUCCESS_BUTTON =
	"bg-[var(--success)] text-white shadow-[0px_8px_10px_0px_rgba(40,175,82,0.25)] hover:shadow-none focus:shadow-none"

const ExportIcon = (): JSX.Element => (
	<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
		<rect width="24" height="24" fill="none" />
		<path
			d="M17,8a1,1,0,0,1,0-2h1a4,4,0,0,1,4,4v8a4,4,0,0,1-4,4H6a4,4,0,0,1-4-4V9.993a4,4,0,0,1,4-4H7a1,1,0,0,1,0,2H6a2,2,0,0,0-2,2V18a2,2,0,0,0,2,2H18a2,2,0,0,0,2-2V10a2,2,0,0,0-2-2Z"
			fill="#fff"
			opacity="0.3"
		/>
		<rect width="2" height="12" rx="1" transform="translate(13 14) rotate(180)" fill="#fff" opacity="0.3" />
		<path d="M12-2.586,14.293-.293a1,1,0,0,0,1.414,0,1,1,0,0,0,0-1.414l-3-3a1,1,0,0,0-1.414,0l-3,3a1,1,0,0,0,0,1.414,1,1,0,0,0,1.414,0Z" transform="translate(0 5)" fill="#fff" />
	</svg>
)

const DropdownArrow = (): JSX.Element => (
	<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
		<g transform="translate(0.318 18) rotate(-90)">
			<rect width="18" height="18" transform="translate(18 -0.319) rotate(90)" fill="#fff" opacity="0" />
			<path
				d="M12.256,15.225a.73.73,0,0,1-.57-.27L8.159,10.573a.73.73,0,0,1,0-.928l3.652-4.382a.731.731,0,1,1,1.125.935L9.671,10.112l3.155,3.915a.73.73,0,0,1-.57,1.2Z"
				transform="translate(-2.155 -1.348)"
				fill="#fff"
			/>
		</g>
	</svg>
)

const PlusIcon = (): JSX.Element => (
	<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
		<g transform="translate(16328 3344)">
			<circle cx="12" cy="12" r="12" transform="translate(-16328 -3344)" fill="#fff" opacity="0" />
			<g transform="translate(-16328 -3344)">
				<rect width="16" height="2" rx="1" transform="translate(4 11)" fill="#fff" />
				<rect width="16" height="2" rx="1" transform="translate(13 4) rotate(90)" fill="#fff" opacity="0.4" />
			</g>
		</g>
	</svg>
)

const RegistrantGroupActions = ({ academicYearId }: { academicYearId: number }): JSX.Element => {
	const [open, setOpen] = useState(false)
	const wrapper = useRef<HTMLDivElement>(null)
	const exportRegistrants = useDownloadRegistrants(academicYearId)

	useEffect(() => {
		if (!open) return undefined
		const close = (event: MouseEvent): void => {
			if (!wrapper.current?.contains(event.target as Node)) setOpen(false)
		}
		document.addEventListener("mousedown", close)
		return () => document.removeEventListener("mousedown", close)
	}, [open])

	const download = (status: AdminRegistrantExportStatus): void => {
		setOpen(false)
		exportRegistrants.mutate(status)
	}

	return (
		<div className="relative flex flex-wrap items-center justify-end max-[992px]:mb-[12px] max-[992px]:justify-center min-[1200px]:z-[9] min-[1200px]:mb-[-10px]">
			<LegacyTooltip content="Kembali" placement="left">
				<Link
					to="/registrants"
					onMouseDown={triggerRipple}
					className={legacyButtonClass("light", cn("h-[40px] w-[40px] min-w-[40px] bg-[var(--bg-inverse)] p-0 hover:shadow-none", RIPPLE_CLASS))}
				>
					<BackArrowIcon />
				</Link>
			</LegacyTooltip>

			<div ref={wrapper} className="relative">
				<LegacyTooltip content="Export" placement="top">
					<button
						type="button"
						aria-haspopup="true"
						aria-expanded={open}
						onMouseDown={triggerRipple}
						onClick={() => setOpen((current) => !current)}
						className={legacyButtonClass("success", cn("ml-[16px] p-[8px]", SUCCESS_BUTTON, RIPPLE_CLASS))}
					>
						<span className="mr-[24px] pr-[8px]">
							<ExportIcon />
						</span>
						<span className="absolute top-0 right-0 flex h-full w-[30px] items-center justify-center rounded-r-[6px] bg-[rgba(29,33,39,0.1)]">
							<DropdownArrow />
						</span>
					</button>
				</LegacyTooltip>
				{open ? (
					<div className="absolute top-full right-0 z-[1000] my-[10px] min-w-[160px] rounded-[6px] bg-[var(--bg-inverse)] p-[10px] shadow-[0px_18px_32px_0px_rgba(0,0,0,0.12)]">
						{EXPORTS.map((item) => (
							<a
								key={item.label}
								href="#"
								onClick={(event) => {
									event.preventDefault()
									download(item.status)
								}}
								className="relative block w-full rounded-[6px] py-[11px] pr-[24px] pl-[40px] text-[12px] font-normal whitespace-nowrap text-[var(--body-txt-inverse)] before:absolute before:top-[calc(50%-4px)] before:left-[15px] before:h-[8px] before:w-[8px] before:rounded-full before:bg-[var(--bg-primary)] before:content-[''] hover:bg-[var(--success)] hover:text-white hover:shadow-[0px_8px_10px_0px_rgba(40,175,82,0.25)]"
							>
								{item.label}
							</a>
						))}
					</div>
				) : null}
			</div>

			<LegacyTooltip content="Tambah" placement="bottom">
				<Link
					to="/registrants/create"
					onMouseDown={triggerRipple}
					className={legacyButtonClass("primary", cn("ml-[16px] inline-flex p-[8px]", RIPPLE_CLASS))}
				>
					<PlusIcon />
				</Link>
			</LegacyTooltip>
		</div>
	)
}

export default RegistrantGroupActions
