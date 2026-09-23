import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

import AdminPageTitle from "@/components/layout/admin-page-title"
import AcademicYearDeleteCard from "@/components/academic-years/academic-year-delete-card"
import { useDelegateAcademicYear } from "@/hooks/use-academic-year-delete"

// Legacy academic-year/delete/delegate-student.blade.php
// `$student_status || $account_status` — a santri of this year is still active by KBM status
// (`student_status = 'active'`) or by account (`is_blocked = 0`).
const LOCKED_TEXT =
	"Oops... Terdapat data santri yang sedang aktif KBM maupun akunnya. Silakan nonaktifkan terlebih dahulu sebelum menghapus tahun ajaran"

export const Route = createFileRoute("/_auth/academic-years/$academicYearId/delegate-student")({
	component: AcademicYearDelegateStudentPage,
})

function AcademicYearDelegateStudentPage(): JSX.Element {
	const { academicYearId } = Route.useParams()
	const id = Number(academicYearId)
	const submit = useDelegateAcademicYear(id, "delegate-student")

	return (
		<>
			<AdminPageTitle title="Hapus Tahun Ajaran" breadcrumbs={[{ label: "…", dropdown: [{ label: "Data Master", to: "/academic-years" }] }, { label: "Tahun Ajaran", to: "/academic-years" }, { label: "Semua", to: "/academic-years" }, { label: "Hapus" }]} />

			<AcademicYearDeleteCard
				academicYearId={id}
				step="delegate-student"
				noun="santri"
				lockedText={LOCKED_TEXT}
				submit={submit}
			/>
		</>
	)
}

export default AcademicYearDelegateStudentPage
