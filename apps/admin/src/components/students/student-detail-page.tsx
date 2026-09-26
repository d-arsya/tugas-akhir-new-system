import { useEffect, useState, type JSX } from "react"
import { Link } from "@tanstack/react-router"

import AdminPageTitle, { CRUMB_LINK_CLASS } from "@/components/layout/admin-page-title"
import { useSocietySettings } from "@/hooks/use-society-settings"
import { useStudentDetail, useStudentOptions } from "@/hooks/use-students"

import StudentEditForm from "./student-edit-form"
import { clearCreatedFlash, peekCreatedFlash } from "./student-flash"

type StudentDetailPageProps = { studentGradeId: number }

const StudentDetailPage = ({ studentGradeId }: StudentDetailPageProps): JSX.Element => {
	const detail = useStudentDetail(studentGradeId)
	const { data: options } = useStudentOptions()
	const { data: settings } = useSocietySettings()
	const [created] = useState(() => peekCreatedFlash(studentGradeId))
	useEffect(() => clearCreatedFlash(), [])
	const data = detail.data

	const yearCrumb =
		data?.academicYearId != null ? (
			<Link to="/students/academic-years/$academicYearId" params={{ academicYearId: String(data.academicYearId) }} className={CRUMB_LINK_CLASS}>
				{data.currentAcademicYear}
			</Link>
		) : null
	const gradeCrumb =
		data?.academicYearId != null && data.grade !== null && data.levelId !== null ? (
			<Link
				to="/students/academic-years/$academicYearId/grades/$grade/levels/$levelId"
				params={{ academicYearId: String(data.academicYearId), grade: String(data.grade), levelId: String(data.levelId) }}
				className={CRUMB_LINK_CLASS}
			>
				Kelas {data.grade}
			</Link>
		) : null

	return (
		<>
			<AdminPageTitle
				title="Detail Santri"
				breadcrumbs={[
					{
						label: "Data Santri",
						dropdown: [
							{ label: "Data Santri", to: "/students" },
							{ label: "Santri", to: "/students" },
							{ label: "Akademik", to: "/students" },
						],
					},
					{ label: data?.currentAcademicYear ?? "", node: yearCrumb },
					{ label: `Kelas ${data?.grade ?? ""}`, node: gradeCrumb },
					{ label: "Detail" },
				]}
			/>

			{created ? (
				<div className="mb-[24px]">
					<div role="alert" className="relative mb-[16px] rounded-[8px] border-0 bg-[rgba(var(--success-rgb),0.1)] px-[20px] py-[12px] text-[var(--success)]">
						Anda berhasil menambahkan santri baru dengan data di bawah ini.
					</div>
				</div>
			) : null}

			{data && settings ? (
				<StudentEditForm
					key={detail.dataUpdatedAt}
					detail={data}
					options={options}
					settings={settings}
					onReload={() => void detail.refetch()}
				/>
			) : null}
		</>
	)
}

export default StudentDetailPage
