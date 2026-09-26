import type { JSX } from "react"
import { Link } from "@tanstack/react-router"

import AdminPageTitle from "@/components/layout/admin-page-title"
import { BackArrowIcon } from "@/components/legacy/legacy-icons"
import { CapabilityCard, CARD_BACK_CLASS, Kembali } from "@/components/student-capabilities/capability-chrome"
import { useStudentAcademicYear } from "@/hooks/use-students"

import StudentGradeTable from "./student-grade-table"

type StudentGradesPageProps = { academicYearId: number }

const StudentGradesPage = ({ academicYearId }: StudentGradesPageProps): JSX.Element => {
	const { data } = useStudentAcademicYear(academicYearId)
	const year = data?.year ?? ""

	return (
		<>
			<AdminPageTitle
				title="Data Santri - Pilih Kelas"
				breadcrumbs={[
					{ label: "Akademik", dropdown: [{ label: "Akademik", to: "/students" }] },
					{ label: "Santri", to: "/students" },
					{ label: "Data Santri", to: "/students" },
					{ label: year },
				]}
			/>

			<div className="mx-[-15px] flex flex-wrap">
				<div className="w-full min-w-0 flex-1 px-[15px]">
					<CapabilityCard
						title="Tahun Ajaran"
						highlight={year}
						subtitle={<p className="m-0 text-[var(--grey)]">Data semua kelas untuk tahun ajaran {year}</p>}
						back={
							<Kembali>
								<Link to="/students" className={CARD_BACK_CLASS}>
									<BackArrowIcon />
								</Link>
							</Kembali>
						}
					>
						<StudentGradeTable academicYearId={academicYearId} />
					</CapabilityCard>
				</div>
			</div>
		</>
	)
}

export default StudentGradesPage
