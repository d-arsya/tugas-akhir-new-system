import type { JSX, ReactNode } from "react"
import { Link } from "@tanstack/react-router"

import { CRUMB_DROPDOWN_LINK_CLASS, CRUMB_LINK_CLASS } from "@/components/layout/admin-page-title"
import { legacyButtonClass } from "@/components/legacy/legacy-button"
import { InfoCircleIcon } from "@/components/legacy/legacy-icons"
import LegacyTooltip from "@/components/legacy/legacy-tooltip"

export const CARD_BACK_CLASS = legacyButtonClass(
	"light",
	"h-[40px] w-[40px] min-w-[40px] bg-[var(--bg-inverse)] p-0 hover:shadow-none",
)

export const LIGHT_BACK_CLASS = legacyButtonClass("light", "p-[8px]")

export const SEARCH_INPUT_CLASS =
	"h-[40px] w-full rounded-[6px] border-2 border-[var(--bg-form-border)]! bg-[var(--bg-form)] px-[16px] py-[6px] text-[12px] leading-[22.2px] text-[var(--body-txt-inverse)] outline-none placeholder:text-[var(--grey)] focus:border-[var(--secondary)]!"

export const HelpButton = ({ onClick }: { onClick: () => void }): JSX.Element => (
	<button
		type="button"
		onClick={onClick}
		className={legacyButtonClass(
			"light",
			"mr-[8px] bg-[rgba(255,168,0,0.16)] p-[8px] text-[var(--warning)] hover:bg-[var(--warning)] hover:text-white [&:hover_circle]:fill-white [&:hover_path]:fill-white",
		)}
	>
		<InfoCircleIcon />
	</button>
)

export const Kembali = ({ children }: { children: ReactNode }): JSX.Element => (
	<LegacyTooltip content="Kembali" placement="left">
		{children}
	</LegacyTooltip>
)

type CapabilityCardProps = {
	title: string
	highlight: string | number | null
	subtitle: ReactNode
	back: ReactNode
	children: ReactNode
}

export const CapabilityCard = ({ title, highlight, subtitle, back, children }: CapabilityCardProps): JSX.Element => (
	<div className="relative flex min-w-0 flex-col border-0 bg-transparent shadow-none">
		<div className="rounded-t-[12px] border-b-0 bg-[var(--bg-tertiary)] px-[24px] py-[18px]">
			<div className="mx-[-15px] flex flex-wrap items-center">
				<div className="w-full px-[15px] min-[992px]:w-1/2 min-[1200px]:w-7/12">
					<div className="relative">
						<div className="relative mt-[2px] inline-block text-[16px] font-bold">
							{title}
							<span className="pl-[4px] text-[var(--primary)]!">{highlight}</span>
						</div>
						{subtitle}
					</div>
				</div>
				<div className="w-full px-[15px] min-[992px]:w-1/2 min-[1200px]:w-5/12">
					<div className="mt-[16px] mb-[4px] flex items-center justify-start min-[992px]:mt-0 min-[992px]:mb-0 min-[992px]:justify-end">
						{back}
					</div>
				</div>
			</div>
		</div>
		<div className="z-[1] min-h-px flex-auto rounded-b-[12px] bg-[var(--bg-secondary)] p-[24px] shadow-[0px_8px_30px_0px_rgba(0,0,0,0.08)]">
			{children}
		</div>
	</div>
)

type YearCrumbProps = {
	academicYearId: number
	year: string | null
	inDropdown?: boolean
}

export const YearCrumb = ({ academicYearId, year, inDropdown }: YearCrumbProps): JSX.Element => (
	<Link
		to="/student-capabilities/academic-years/$academicYearId"
		params={{ academicYearId: String(academicYearId) }}
		className={inDropdown === true ? CRUMB_DROPDOWN_LINK_CLASS : CRUMB_LINK_CLASS}
	>
		{year}
	</Link>
)

export const GradeCrumb = ({
	academicYearId,
	gradeId,
	label,
}: {
	academicYearId: number
	gradeId: number
	label: string | number | null
}): JSX.Element => (
	<Link
		to="/student-capabilities/academic-years/$academicYearId/grades/$gradeId"
		params={{ academicYearId: String(academicYearId), gradeId: String(gradeId) }}
		className={CRUMB_LINK_CLASS}
	>
		Kelas {label}
	</Link>
)

export const DetailCrumb = ({ studentGradeId }: { studentGradeId: number }): JSX.Element => (
	<Link
		to="/student-capabilities/students/$studentGradeId"
		params={{ studentGradeId: String(studentGradeId) }}
		className={CRUMB_LINK_CLASS}
	>
		Detail
	</Link>
)
