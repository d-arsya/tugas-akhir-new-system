import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

import AdminPageTitle from "@/components/layout/admin-page-title"
import AcademicYearDeleteCard from "@/components/academic-years/academic-year-delete-card"
import { useDelegateAcademicYear } from "@/hooks/use-academic-year-delete"

// Legacy academic-year/delete/delegate-registrant.blade.php
// `$registrant_status` — true when any registrant still has `is_blocked = 0`, i.e. a live account.
const LOCKED_TEXT =
	"Oops... Terdapat data pendaftar yang sedang aktif akunnya. Silakan nonaktifkan terlebih dahulu sebelum menghapus tahun ajaran"

export const Route = createFileRoute("/_auth/academic-years/$academicYearId/delegate-registrant")({
	component: AcademicYearDelegateRegistrantPage,
})

function AcademicYearDelegateRegistrantPage(): JSX.Element {
	const { academicYearId } = Route.useParams()
	const id = Number(academicYearId)
	const submit = useDelegateAcademicYear(id, "delegate-registrant")

	return (
		<>
			<AdminPageTitle title="Hapus Tahun Ajaran" breadcrumbs={[{ label: "…", dropdown: [{ label: "Data Master", to: "/academic-years" }] }, { label: "Tahun Ajaran", to: "/academic-years" }, { label: "Semua", to: "/academic-years" }, { label: "Hapus" }]} />

			<AcademicYearDeleteCard
				academicYearId={id}
				step="delegate-registrant"
				noun="pendaftar"
				lockedText={LOCKED_TEXT}
				submit={submit}
			/>
		</>
	)
}

export default AcademicYearDelegateRegistrantPage
