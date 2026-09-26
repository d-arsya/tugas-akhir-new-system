import type { JSX } from "react"
import { Link } from "@tanstack/react-router"

import type { CapabilityStudentPage } from "@roja/types"

import { BackArrowIcon } from "@/components/legacy/legacy-icons"

import { HelpButton, Kembali, LIGHT_BACK_CLASS, SEARCH_INPUT_CLASS } from "./capability-chrome"

type CapabilityHistoryToolbarProps = {
	page: CapabilityStudentPage | undefined
	search: string
	onSearchChange: (search: string) => void
	onHelp: () => void
}

const CapabilityHistoryToolbar = ({ page, search, onSearchChange, onHelp }: CapabilityHistoryToolbarProps): JSX.Element => (
	<div className="mx-[-15px] mb-[8px] flex flex-wrap">
		<div className="mb-[16px] w-full px-[15px] min-[768px]:mb-0 min-[768px]:w-1/3">
			<div className="mr-[8px] inline-flex">
				<HelpButton onClick={onHelp} />
			</div>
			<div className="inline-flex">
				{page ? (
					<Kembali>
						<Link
							to="/student-capabilities/academic-years/$academicYearId/grades/$gradeId"
							params={{ academicYearId: String(page.academicYearId), gradeId: String(page.gradeId) }}
							className={`${LIGHT_BACK_CLASS} mr-[8px]`}
						>
							<BackArrowIcon />
						</Link>
					</Kembali>
				) : null}
			</div>
		</div>
		<div className="w-full px-[15px] min-[768px]:w-5/12" />
		<div className="w-full px-[15px] min-[768px]:w-1/4">
			<input
				type="text"
				value={search}
				placeholder="Search"
				onChange={(event) => onSearchChange(event.target.value)}
				className={SEARCH_INPUT_CLASS}
			/>
		</div>
	</div>
)

export default CapabilityHistoryToolbar
