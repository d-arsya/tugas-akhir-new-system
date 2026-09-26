import { useState, type JSX } from "react"
import { Link } from "@tanstack/react-router"

import { cn } from "@roja/utils"

import { legacyButtonClass } from "@/components/legacy/legacy-button"
import { BackArrowIcon } from "@/components/legacy/legacy-icons"
import { legacyNotify } from "@/components/legacy/legacy-notify"
import LegacyTooltip from "@/components/legacy/legacy-tooltip"
import { CARD_BACK_CLASS, Kembali } from "@/components/student-capabilities/capability-chrome"
import { adminApi } from "@/lib/api"
import { saveBlob } from "@/lib/download"
import { legacyErrors } from "@/lib/legacy-errors"
import { RIPPLE_CLASS, triggerRipple } from "@/lib/ripple"

import { StudentLabel } from "./student-ui"

// `student/partials/listing-student/card-header.blade.php`: "Santri Kelas N" with the row count
// (`showStudentCount()`), the class line, Kembali, Export (`student.download`) and Tambah (`student.create`
// with the year, Kelas and Jenjang). The commented-out Import button stays out.

type Props = {
	academicYearId: number
	year: string | null
	grade: number
	levelId: number
	levelName: string | null
	count: number
}

const ExportIcon = (): JSX.Element => (
	<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="block">
		<rect width="24" height="24" fill="none" />
		<path
			d="M17,8a1,1,0,0,1,0-2h1a4,4,0,0,1,4,4v8a4,4,0,0,1-4,4H6a4,4,0,0,1-4-4V9.993a4,4,0,0,1,4-4H7a1,1,0,0,1,0,2H6a2,2,0,0,0-2,2V18a2,2,0,0,0,2,2H18a2,2,0,0,0,2-2V10a2,2,0,0,0-2-2Z"
			fill="#fff"
			opacity="0.3"
		/>
		<rect width="2" height="12" rx="1" transform="translate(13 14) rotate(180)" fill="#fff" opacity="0.3" />
		<path
			d="M12-2.586,14.293-.293a1,1,0,0,0,1.414,0,1,1,0,0,0,0-1.414l-3-3a1,1,0,0,0-1.414,0l-3,3a1,1,0,0,0,0,1.414,1,1,0,0,0,1.414,0Z"
			transform="translate(0 5)"
			fill="#fff"
		/>
	</svg>
)

const PlusIcon = (): JSX.Element => (
	<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="block">
		<g transform="translate(16328 3344)">
			<circle cx="12" cy="12" r="12" transform="translate(-16328 -3344)" fill="#fff" opacity="0" />
			<g transform="translate(-16328 -3344)">
				<rect width="16" height="2" rx="1" transform="translate(4 11)" fill="#fff" />
				<rect width="16" height="2" rx="1" transform="translate(13 4) rotate(90)" fill="#fff" opacity="0.4" />
			</g>
		</g>
	</svg>
)

const StudentRosterHeader = ({ academicYearId, year, grade, levelId, levelName, count }: Props): JSX.Element => {
	const [downloading, setDownloading] = useState(false)

	const download = (): void => {
		if (downloading) return
		setDownloading(true)
		adminApi
			.downloadStudentRoster(academicYearId, grade, levelId)
			.then(({ blob, fileName }) => saveBlob(blob, fileName ?? "Hasil export data santri.xlsx"))
			.catch((error: unknown) => legacyNotify.error(legacyErrors(error)))
			.finally(() => setDownloading(false))
	}

	return (
		<div className="rounded-t-[12px] border-b-0 bg-[var(--bg-tertiary)] px-[24px] py-[18px]">
			<div className="mx-[-15px] flex flex-wrap items-center">
				<div className="w-full px-[15px] min-[992px]:w-1/2 min-[1200px]:w-7/12">
					<div className="relative">
						{/* `.tbr_card_intro .tbr_title` */}
						<div className="relative mt-[2px] inline-block text-[16px] font-bold">
							Santri <span className="pl-[4px] text-[var(--primary)]">Kelas {grade}</span>{" "}
							<StudentLabel variant="primary" size="base">
								{count}
							</StudentLabel>
						</div>
						<p className="m-0 text-[var(--grey)]">
							Data santri Kelas {grade} jenjang {levelName} pada tahun ajaran {year}
						</p>
					</div>
				</div>
				<div className="w-full px-[15px] min-[992px]:w-1/2 min-[1200px]:w-5/12">
					<div className="mt-[16px] mb-[4px] flex items-center justify-start min-[992px]:mt-0 min-[992px]:mb-0 min-[992px]:justify-end">
						<Kembali>
							<Link to="/students/academic-years/$academicYearId" params={{ academicYearId: String(academicYearId) }} className={CARD_BACK_CLASS}>
								<BackArrowIcon />
							</Link>
						</Kembali>
						<LegacyTooltip content="Export" className="ml-[16px]">
							<button
								type="button"
								onMouseDown={triggerRipple}
								onClick={download}
								className={legacyButtonClass("success", cn("p-[8px]", RIPPLE_CLASS))}
							>
								<ExportIcon />
							</button>
						</LegacyTooltip>
						<LegacyTooltip content="Tambah" className="ml-[16px]">
							<Link
								to="/students/create"
								search={{ academic_year: String(academicYearId), grade: String(grade), level_id: String(levelId) }}
								onMouseDown={triggerRipple}
								className={legacyButtonClass("primary", cn("p-[8px]", RIPPLE_CLASS))}
							>
								<PlusIcon />
							</Link>
						</LegacyTooltip>
					</div>
				</div>
			</div>
		</div>
	)
}

export default StudentRosterHeader
