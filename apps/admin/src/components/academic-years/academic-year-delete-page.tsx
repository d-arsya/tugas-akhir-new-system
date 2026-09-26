import type { JSX } from "react"

import AdminPageTitle from "@/components/layout/admin-page-title"
import { useDeleteAcademicYear } from "@/hooks/use-academic-year-delete"

import AcademicYearDeleteCard from "./academic-year-delete-card"

const AcademicYearDeletePage = ({ academicYearId }: { academicYearId: number }): JSX.Element => {
	const submit = useDeleteAcademicYear(academicYearId)

	return (
		<>
			<AdminPageTitle title="Hapus Tahun Ajaran" breadcrumbs={[{ label: "…", dropdown: [{ label: "Data Master", to: "/academic-years" }] }, { label: "Tahun Ajaran", to: "/academic-years" }, { label: "Semua", to: "/academic-years" }, { label: "Hapus" }]} />

			<AcademicYearDeleteCard academicYearId={academicYearId} step="delete" submit={submit} />
		</>
	)
}

export default AcademicYearDeletePage
