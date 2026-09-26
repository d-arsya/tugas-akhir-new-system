import type { JSX } from "react"
import { Link } from "@tanstack/react-router"

import AdminPageTitle from "@/components/layout/admin-page-title"
import { BackArrowIcon } from "@/components/legacy/legacy-icons"
import { useCapabilityAcademicYears } from "@/hooks/use-student-capabilities"

import { CapabilityCard, CARD_BACK_CLASS, Kembali } from "./capability-chrome"
import CapabilityGradeTable from "./capability-grade-table"

const CapabilityGradesPage = ({ academicYearId }: { academicYearId: number }): JSX.Element => {
	const { data: years } = useCapabilityAcademicYears()
	const year = years?.find((row) => row.id === academicYearId)?.year ?? null

	return (
		<>
			<AdminPageTitle
				title="Kesanggupan"
				breadcrumbs={[
					{ label: "Pembayaran Santri", to: "/student-capabilities" },
					{ label: "Kesanggupan", to: "/student-capabilities" },
					{ label: year ?? "" },
				]}
			/>

			<div className="mx-[-15px] flex flex-wrap">
				<div className="w-full min-w-0 flex-1 px-[15px]">
					<CapabilityCard
						title="Tahun ajaran"
						highlight={year}
						subtitle={<div>Atur kesanggupan untuk semua santri pada setiap kelasnya.</div>}
						back={
							<Kembali>
								<Link to="/student-capabilities" className={CARD_BACK_CLASS}>
									<BackArrowIcon />
								</Link>
							</Kembali>
						}
					>
						<CapabilityGradeTable academicYearId={academicYearId} year={year} />
					</CapabilityCard>
				</div>
			</div>
		</>
	)
}

export default CapabilityGradesPage
