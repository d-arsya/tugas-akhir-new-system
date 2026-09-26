import { useEffect, type JSX } from "react"
import { Link, useNavigate } from "@tanstack/react-router"

import AdminPageTitle from "@/components/layout/admin-page-title"
import { BackArrowIcon } from "@/components/legacy/legacy-icons"
import {
	useCapabilityAcademicYears,
	useCapabilityGrades,
	useCapabilityStudents,
} from "@/hooks/use-student-capabilities"

import { CapabilityCard, CARD_BACK_CLASS, Kembali, YearCrumb } from "./capability-chrome"
import CapabilityStudentTable from "./capability-student-table"

const NO_COST_TERM_STATUS = 422

const statusOf = (error: unknown): number | undefined => (error as { response?: { status?: number } })?.response?.status

type CapabilityStudentsPageProps = { academicYearId: string; gradeId: string }

const CapabilityStudentsPage = ({ academicYearId: yearParam, gradeId: gradeParam }: CapabilityStudentsPageProps): JSX.Element => {
	const academicYearId = Number(yearParam)
	const gradeId = Number(gradeParam)
	const navigate = useNavigate()

	const { data: years } = useCapabilityAcademicYears()
	const { data: grades } = useCapabilityGrades(academicYearId)
	const students = useCapabilityStudents(academicYearId, gradeId)

	const year = years?.find((row) => row.id === academicYearId)?.year ?? null
	const label = grades?.find((row) => row.id === gradeId)?.label ?? null

	useEffect(() => {
		if (statusOf(students.error) !== NO_COST_TERM_STATUS) return
		void navigate({
			to: "/student-capabilities/academic-years/$academicYearId",
			params: { academicYearId: yearParam },
			replace: true,
		})
	}, [students.error, navigate, yearParam])

	return (
		<>
			<AdminPageTitle
				title="Kesanggupan"
				breadcrumbs={[
					{ label: "…", dropdown: [{ label: "Pembayaran Santri", to: "/student-capabilities" }] },
					{ label: "Kesanggupan", to: "/student-capabilities" },
					{ label: year ?? "", node: <YearCrumb academicYearId={academicYearId} year={year} /> },
					{ label: `Kelas ${label ?? ""}` },
				]}
			/>

			<div className="mx-[-15px] flex flex-wrap">
				<div className="w-full min-w-0 flex-1 px-[15px]">
					<CapabilityCard
						title="Kelas"
						highlight={label}
						subtitle={<p className="m-0! leading-[24px] text-[var(--grey)]">Semua santri untuk tahun ajaran masuk {year}</p>}
						back={
							<Kembali>
								<Link
									to="/student-capabilities/academic-years/$academicYearId"
									params={{ academicYearId: yearParam }}
									className={CARD_BACK_CLASS}
								>
									<BackArrowIcon />
								</Link>
							</Kembali>
						}
					>
						<CapabilityStudentTable
							academicYearId={academicYearId}
							gradeId={gradeId}
							rows={students.data}
							loaded={students.isSuccess || students.isError}
							processing={students.isFetching}
						/>
					</CapabilityCard>
				</div>
			</div>
		</>
	)
}

export default CapabilityStudentsPage
