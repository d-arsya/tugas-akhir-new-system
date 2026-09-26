import { useState, type JSX, type ReactNode } from "react"
import { Link } from "@tanstack/react-router"
import { QRCodeSVG } from "qrcode.react"

import type { EwalletOwner } from "@roja/types"
import { cn } from "@roja/utils"

import LegacyCard from "@/components/legacy/legacy-card"
import { legacyButtonClass } from "@/components/legacy/legacy-button"
import { RIPPLE_CLASS, triggerRipple } from "@/lib/ripple"

import { ArrowDownIcon, PrintIcon } from "./ewallet-icons"

const SOLID = {
	primary: "bg-[var(--primary)] shadow-[0px_8px_10px_0px_rgba(var(--primary-rgb),0.25)]",
	warning: "bg-[var(--warning)] shadow-[0px_8px_10px_0px_rgba(var(--warning-rgb),0.25)]",
	success: "bg-[var(--success)] shadow-[0px_8px_10px_0px_rgba(var(--success-rgb),0.25)]",
	danger: "bg-[var(--danger)] shadow-[0px_8px_10px_0px_rgba(var(--danger-rgb),0.25)]",
} as const

const SolidLabel = ({ variant, center = false, children }: { variant: keyof typeof SOLID; center?: boolean; children: ReactNode }): JSX.Element => (
	<span
		className={cn(
			"absolute inline-block rounded-[6px] px-[14px] py-[4px] text-[var(--white)]",
			SOLID[variant],
			center ? "top-[-15px] left-1/2 -translate-x-1/2" : "right-[-10px] bottom-[30px]",
		)}
	>
		{children}
	</span>
)

const BlockInfo = ({ label, value }: { label: string; value: ReactNode }): JSX.Element => (
	<div className="relative -mx-[8px] rounded-[8px] border-b border-[var(--bg-tertiary)] px-[8px] py-[12px] last:border-b-0 hover:bg-[var(--bg-tertiary)]">
		<div>{label}</div>
		<div className="text-[var(--grey)] italic">{value}</div>
	</div>
)

type OwnerCardProps = {
	owner: EwalletOwner
	isActive: boolean
	dashForMissingName?: boolean
}

export const EwalletOwnerCard = ({ owner, isActive, dashForMissingName = true }: OwnerCardProps): JSX.Element => {
	const [open, setOpen] = useState(false)
	const student = owner.kind === "santri"

	return (
		<LegacyCard className="mb-[24px]">
			<div className="relative mb-[12px] rounded-[10px]">
				<img src={owner.photoUrl ?? "/assets/svg/etc/No-Photo.svg"} alt={owner.name ?? ""} className="h-auto w-full rounded-[10px]" />
				<SolidLabel variant={student ? "primary" : "warning"} center>
					{student ? "Santri" : "Merchant"}
				</SolidLabel>
				<SolidLabel variant={isActive ? "success" : "danger"}>{isActive ? "Aktif" : "Nonaktif"}</SolidLabel>
			</div>

			<div className="flex items-center justify-between">
				<p className="m-0 leading-[24px]">Lihat detail {student ? "santri" : "merchant"}</p>
				<a
					href="#tbr_student_detail"
					role="button"
					aria-expanded={open}
					aria-controls="tbr_student_detail"
					onClick={(event) => {
						event.preventDefault()
						setOpen((value) => !value)
					}}
				>
					<ArrowDownIcon className={cn("transition-transform duration-300 ease-[cubic-bezier(0.785,0.135,0.15,0.86)]", open && "rotate-180")} />
				</a>
			</div>

			<div
				id="tbr_student_detail"
				className={cn("grid transition-[grid-template-rows] duration-[350ms] ease-in-out", open ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}
			>
				<div className="overflow-hidden">
					{student ? (
						<>
							<BlockInfo label="Nama" value={owner.name} />
							<BlockInfo label="Jenjang & Kelas" value={owner.levelAndGrade} />
							<BlockInfo label="Nama Orang Tua atau Wali" value={owner.parentName} />
						</>
					) : (
						<>
							<BlockInfo label="Nama" value={owner.name ?? (dashForMissingName ? "-" : "")} />
							<BlockInfo label="Nama Merchant" value={owner.merchantName ?? "-"} />
							<BlockInfo label="Alamat" value={owner.address ?? "-"} />
							<BlockInfo label="Nomor Telepon" value={owner.phone ?? "-"} />
						</>
					)}
				</div>
			</div>
		</LegacyCard>
	)
}

type QrCardProps = { ewalletId: number; qrValue: string | null; caption: string }

export const EwalletQrCard = ({ ewalletId, qrValue, caption }: QrCardProps): JSX.Element => (
	<LegacyCard className="mt-0 mb-[24px]">
		<Link
			to="/ewallets/$ewalletId/qr"
			params={{ ewalletId: String(ewalletId) }}
			target="_blank"
			onClick={triggerRipple}
			className={legacyButtonClass(
				"light-danger",
				cn("absolute top-[7px] right-[7px] z-[1] p-[8px]", RIPPLE_CLASS, "[&:hover_path]:fill-white [&:hover_rect:last-of-type]:fill-white"),
			)}
		>
			<PrintIcon />
		</Link>
		<div className="flex justify-center">
			<QRCodeSVG value={qrValue ?? ""} size={100} level="Q" />
		</div>
		<p className="mt-[16px] mb-0 text-center leading-[24px]">{caption}</p>
	</LegacyCard>
)
