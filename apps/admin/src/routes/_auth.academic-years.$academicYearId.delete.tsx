import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

import AdminPageTitle from "@/components/layout/admin-page-title"
import AcademicYearDeleteCard from "@/components/academic-years/academic-year-delete-card"
import { useDeleteAcademicYear } from "@/hooks/use-academic-year-delete"

// Legacy academic-year/delete/delete.blade.php
export const Route = createFileRoute("/_auth/academic-years/$academicYearId/delete")({
	component: AcademicYearDeletePage,
})

function AcademicYearDeletePage(): JSX.Element {
	const { academicYearId } = Route.useParams()
	const id = Number(academicYearId)
	const submit = useDeleteAcademicYear(id)

	return (
		<>
			<AdminPageTitle title="Hapus Tahun Ajaran" breadcrumbs={[{ label: "…", dropdown: [{ label: "Data Master", to: "/academic-years" }] }, { label: "Tahun Ajaran", to: "/academic-years" }, { label: "Semua", to: "/academic-years" }, { label: "Hapus" }]} />

			<AcademicYearDeleteCard academicYearId={id} step="delete" submit={submit} />
		</>
	)
}

export default AcademicYearDeletePage
