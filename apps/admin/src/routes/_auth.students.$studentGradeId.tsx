import { useEffect, useState, type JSX } from "react"
import { createFileRoute, Link } from "@tanstack/react-router"

import AdminPageTitle, { CRUMB_LINK_CLASS } from "@/components/layout/admin-page-title"
import StudentEditForm from "@/components/students/student-edit-form"
import { clearCreatedFlash, peekCreatedFlash } from "@/components/students/student-flash"
import { useSocietySettings } from "@/hooks/use-society-settings"
import { useStudentDetail, useStudentOptions } from "@/hooks/use-students"

// Legacy student/edit.blade.php (+ partials/edit/*) — `StudentController::edit:397`, saved by `update:425`.
export const Route = createFileRoute("/_auth/students/$studentGradeId")({
	component: Page,
})

function Page(): JSX.Element {
	const { studentGradeId } = Route.useParams()
	const id = Number(studentGradeId)
	const detail = useStudentDetail(id)
	const { data: options } = useStudentOptions()
	const { data: settings } = useSocietySettings()
	// `session()->flash('success')` from the wizard: shown on this visit only
	const [created] = useState(() => peekCreatedFlash(id))
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
				// `student/partials/edit/alert.blade.php` — legacy's text said "pendaftar" on the Santri page (wrong word, fixed)
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

export default Page
