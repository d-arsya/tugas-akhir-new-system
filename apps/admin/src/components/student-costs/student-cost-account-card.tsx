import type { JSX, ReactNode } from "react"
import { Link } from "@tanstack/react-router"

import { legacyButtonClass } from "@/components/legacy/legacy-button"
import { BackArrowIcon } from "@/components/legacy/legacy-icons"
import LegacyTooltip from "@/components/legacy/legacy-tooltip"

type StudentCostAccountCardProps = {
	academicYearId: number
	year: string | null
	costPeriod: string
	gradeLabel: number | null
	children: ReactNode
}

const StudentCostAccountCard = ({
	academicYearId,
	year,
	costPeriod,
	gradeLabel,
	children,
}: StudentCostAccountCardProps): JSX.Element => (
	<div className="relative flex min-w-0 flex-col border-0 bg-transparent shadow-none">
		<div className="rounded-t-[12px] border-b-0 bg-[var(--bg-tertiary)] px-[24px] py-[18px]">
			<div className="mx-[-15px] flex flex-wrap items-center">
				<div className="w-full px-[15px] min-[992px]:w-1/2 min-[1200px]:w-7/12">
					<div className="relative">
						<div className="relative mt-[2px] inline-block text-[16px] font-bold">
							Kelas <span className="pl-[4px] text-[var(--primary)]!">{gradeLabel}</span>
						</div>
						<p className="m-0! leading-[24px] text-[var(--grey)]">
							Tahun ajaran {year} (Periode : {costPeriod})
						</p>
					</div>
				</div>
				<div className="w-full px-[15px] min-[992px]:w-1/2 min-[1200px]:w-5/12">
					<div className="mt-[16px] mb-[4px] flex items-center justify-start min-[992px]:mt-0 min-[992px]:mb-0 min-[992px]:justify-end">
						<LegacyTooltip content="Kembali" placement="left">
							<Link
								to="/student-costs/$academicYearId"
								params={{ academicYearId: String(academicYearId) }}
								className={legacyButtonClass(
									"light",
									"h-[40px] w-[40px] min-w-[40px] bg-[var(--bg-inverse)] p-0 hover:shadow-none",
								)}
							>
								<BackArrowIcon />
							</Link>
						</LegacyTooltip>
					</div>
				</div>
			</div>
		</div>
		<div className="z-[1] min-h-px flex-auto rounded-b-[12px] bg-[var(--bg-secondary)] p-[24px] shadow-[0px_8px_30px_0px_rgba(0,0,0,0.08)]">
			{children}
		</div>
	</div>
)

export default StudentCostAccountCard
