import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

import AdminPageTitle from "@/components/layout/admin-page-title"
import AcademicYearDeleteCard from "@/components/academic-years/academic-year-delete-card"
import { useDelegateAcademicYear } from "@/hooks/use-academic-year-delete"

// Legacy academic-year/delete/delegate-alumni.blade.php — the terminal step. It has no
// conditional paragraph and its button carries no `tbr_bulk_action` class, so it never locks.
export const Route = createFileRoute("/_auth/academic-years/$academicYearId/delegate-alumni")({
	component: AcademicYearDelegateAlumniPage,
})

function AcademicYearDelegateAlumniPage(): JSX.Element {
	const { academicYearId } = Route.useParams()
	const id = Number(academicYearId)
	const submit = useDelegateAcademicYear(id, "delegate-alumni")

	return (
		<>
			<AdminPageTitle title="Hapus Tahun Ajaran" breadcrumbs={[{ label: "…", dropdown: [{ label: "Data Master", to: "/academic-years" }] }, { label: "Tahun Ajaran", to: "/academic-years" }, { label: "Semua", to: "/academic-years" }, { label: "Hapus" }]} />

			<AcademicYearDeleteCard academicYearId={id} step="delegate-alumni" noun="alumni" submit={submit} />
		</>
	)
}

export default AcademicYearDelegateAlumniPage
