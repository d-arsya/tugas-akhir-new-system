import type { JSX, ReactNode } from "react"
import { Link } from "@tanstack/react-router"

import type { SocietyStepKey } from "@roja/types"
import { cn } from "@roja/utils"

import { legacyButtonClass } from "@/components/legacy/legacy-button"
import { RIPPLE_CLASS, triggerRipple } from "@/lib/ripple"

export const WIZARD_STEPS: readonly SocietyStepKey[] = ["personal", "identity", "family", "guardian", "attachment"]

const StepArrow = (): JSX.Element => (
	<svg xmlns="http://www.w3.org/2000/svg" width="8" height="14" viewBox="0 0 8 14" className="tbr-arrow absolute left-[-3px] block">
		<path
			d="M6.707,15.707a1,1,0,0,1-1.414-1.414l6-6a1,1,0,0,1,1.383-.03l6,5.5a1,1,0,1,1-1.351,1.474L12.03,10.384Z"
			transform="translate(16 -5) rotate(90)"
			fill="#abb4be"
			opacity="0.3"
		/>
	</svg>
)

const StepIconFrame = ({ children }: { children: ReactNode }): JSX.Element => (
	<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="mr-[8px] block max-[1200px]:m-0">
		<g>
			<rect width="24" height="24" fill="#abb4be" opacity="0" />
			{children}
		</g>
	</svg>
)

const STEP_ICON: Record<SocietyStepKey, JSX.Element> = {
	personal: (
		<StepIconFrame>
			<path d="M12,11A4,4,0,1,0,8,7,4,4,0,0,0,12,11Zm0-6a2,2,0,1,1-2,2A2,2,0,0,1,12,5Z" fill="#abb4be" />
			<path d="M12,13a7,7,0,0,0-7,7,1,1,0,0,0,2,0,5,5,0,0,1,10,0,1,1,0,0,0,2,0,7,7,0,0,0-7-7Z" fill="#abb4be" />
		</StepIconFrame>
	),
	identity: (
		<StepIconFrame>
			<path
				d="M18,5V4a2,2,0,0,0-2-2H8A2,2,0,0,0,6,4V5A3,3,0,0,0,3,8V19a3,3,0,0,0,3,3H18a3,3,0,0,0,3-3V8A3,3,0,0,0,18,5ZM8,4h8V8H8ZM19,19a1,1,0,0,1-1,1H6a1,1,0,0,1-1-1V8A1,1,0,0,1,6,7V8a2,2,0,0,0,2,2h8a2,2,0,0,0,2-2V7a1,1,0,0,1,1,1Z"
				fill="#abb4be"
			/>
		</StepIconFrame>
	),
	family: (
		<StepIconFrame>
			<path d="M9,11A4,4,0,1,0,5,7,4,4,0,0,0,9,11ZM9,5A2,2,0,1,1,7,7,2,2,0,0,1,9,5Z" fill="#abb4be" />
			<path d="M17,13a3,3,0,1,0-3-3A3,3,0,0,0,17,13Zm0-4a1,1,0,1,1-1,1A1,1,0,0,1,17,9Z" fill="#abb4be" />
			<path
				d="M17,14a5,5,0,0,0-3.06,1.05A7,7,0,0,0,2,20a1,1,0,1,0,2,0,5,5,0,0,1,10,0,1,1,0,0,0,2,0,6.9,6.9,0,0,0-.86-3.35A3,3,0,0,1,20,19a1,1,0,1,0,2,0A5,5,0,0,0,17,14Z"
				fill="#abb4be"
			/>
		</StepIconFrame>
	),
	guardian: (
		<StepIconFrame>
			<path
				d="M19.4,7.34,16.66,4.6A2,2,0,0,0,14,4.53l-9,9a2,2,0,0,0-.57,1.21L4,18.91A1,1,0,0,0,5,20h.09l4.17-.38a2,2,0,0,0,1.21-.57l9-9a1.92,1.92,0,0,0-.07-2.71ZM9.08,17.62l-3,.28.27-3L12,9.32l2.7,2.7ZM16,10.68,13.32,8l1.95-2L18,8.73Z"
				fill="#abb4be"
			/>
		</StepIconFrame>
	),
	attachment: (
		<StepIconFrame>
			<path
				d="M9.29,21a6.23,6.23,0,0,1-4.43-1.88,6,6,0,0,1-.22-8.49L12,3.2A4.11,4.11,0,0,1,15,2a4.48,4.48,0,0,1,3.19,1.35,4.36,4.36,0,0,1,.15,6.13l-7.4,7.43a2.54,2.54,0,0,1-1.81.75,2.72,2.72,0,0,1-1.95-.82,2.68,2.68,0,0,1-.08-3.77l6.83-6.86A1,1,0,0,1,15.3,7.62L8.47,14.48a.68.68,0,0,0,.08.95.78.78,0,0,0,.53.23.56.56,0,0,0,.4-.16l7.39-7.43a2.36,2.36,0,0,0-.15-3.31,2.38,2.38,0,0,0-3.27-.15L6.06,12a4,4,0,0,0,.22,5.67,4.22,4.22,0,0,0,3,1.29,3.67,3.67,0,0,0,2.61-1.06l7.39-7.43a1,1,0,1,1,1.42,1.41l-7.39,7.43A5.65,5.65,0,0,1,9.29,21Z"
				fill="#abb4be"
			/>
		</StepIconFrame>
	),
}

const STEP_LABEL: Record<SocietyStepKey, string> = {
	personal: "Data Diri",
	identity: "Identitas",
	family: "Data Keluarga",
	guardian: "Data Wali",
	attachment: "Lampiran",
}

export const WizardStepper = ({ step }: { step: SocietyStepKey }): JSX.Element => {
	const current = WIZARD_STEPS.indexOf(step)
	return (
		<div className="flex min-h-[80px] items-center justify-between bg-[var(--bg-tertiary)] px-[40px] py-[10px] max-[480px]:px-[20px]">
			<div className="p-0">
				<ul className="m-0 flex flex-wrap justify-center p-0">
					{WIZARD_STEPS.map((key, index) => (
						<li
							key={key}
							className={cn(
								"relative flex list-none items-center py-[5px] pr-[24px] text-[var(--grey)]",
								index === 0 ? "pl-0" : "pl-[24px]",
								index <= current &&
									"text-[var(--warning)] [&_svg:not(.tbr-arrow)_path]:fill-[var(--warning)] [&_svg.tbr-arrow_path]:fill-[var(--warning)] [&_svg.tbr-arrow_path]:opacity-100",
							)}
						>
							{index > 0 ? <StepArrow /> : null}
							{STEP_ICON[key]}
							<span className="max-[1200px]:hidden">{STEP_LABEL[key]}</span>
						</li>
					))}
				</ul>
			</div>
		</div>
	)
}

export const WizardBody = ({ children }: { children: ReactNode }): JSX.Element => (
	<div className="min-h-[80px] bg-[var(--bg-secondary)] p-[40px] shadow-[0px_8px_30px_0px_rgba(0,0,0,0.08)] max-[480px]:px-[20px] max-[480px]:py-[10px]">
		{children}
	</div>
)

const LG = "h-[47px] min-h-0 rounded-[7px] px-[20px]"

const NextArrow = (): JSX.Element => (
	<svg xmlns="http://www.w3.org/2000/svg" width="8" height="14" viewBox="0 0 8 14" className="ml-[8px] inline-block align-middle">
		<path
			d="M6.707,15.707a1,1,0,0,1-1.414-1.414l6-6a1,1,0,0,1,1.383-.03l6,5.5a1,1,0,1,1-1.351,1.474L12.03,10.384Z"
			transform="translate(16 -5) rotate(90)"
			fill="#fff"
		/>
	</svg>
)

type WizardFooterProps = {
	previous: string | null
	submitting: boolean
}

export const WizardFooter = ({ previous, submitting }: WizardFooterProps): JSX.Element => (
	<div
		className={cn(
			"flex min-h-[80px] items-center bg-[linear-gradient(to_bottom,var(--bg-form-builder-panel)_0%,var(--bg-tertiary)_30%)] px-[40px] py-[10px] max-[480px]:px-[20px]",
			previous === null ? "justify-end" : "justify-between",
		)}
	>
		{previous !== null ? (
			<Link
				to={previous}
				onMouseDown={triggerRipple}
				className={cn(legacyButtonClass("light", cn(LG, RIPPLE_CLASS)), "bg-[var(--bg-inverse)]")}
			>
				<svg xmlns="http://www.w3.org/2000/svg" width="8" height="14" viewBox="0 0 8 14" className="mr-0 inline-block align-middle md:mr-[8px]">
					<path
						d="M1.707.293A1,1,0,0,0,.293,1.707l6,6a1,1,0,0,0,1.383.03l6-5.5A1,1,0,1,0,12.324.763L7.03,5.616Z"
						transform="translate(8) rotate(90)"
						fill="#abb4be"
					/>
				</svg>
				<span className="hidden md:block">Sebelumnya</span>
			</Link>
		) : null}
		<button
			type="submit"
			disabled={submitting}
			onMouseDown={triggerRipple}
			className={legacyButtonClass("primary", cn(LG, RIPPLE_CLASS))}
		>
			{submitting ? (
				<span
					role="status"
					className="absolute h-[32px] w-[32px] rounded-full bg-white opacity-0 [animation:legacy-spinner-grow_0.75s_linear_infinite]"
				/>
			) : null}
			<span className={cn("block", submitting && "invisible")}>
				Selanjutnya
				<NextArrow />
			</span>
		</button>
	</div>
)

export const WizardGroupDisabledAlert = (): JSX.Element => (
	<div role="alert" className="relative m-0 rounded-[8px] border-0 bg-[rgba(248,55,75,0.1)] px-[20px] py-[12px] text-[var(--danger)]">
		Kami belum membutuhkan data dibagian atau bidang ini. Silakan abaikan dan klik tombol selanjutnya.
	</div>
)
