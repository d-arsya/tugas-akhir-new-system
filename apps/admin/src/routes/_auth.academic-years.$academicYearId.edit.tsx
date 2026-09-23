import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

import type { AcademicYearDetail, AcademicYearPayload } from "@roja/types"

import AcademicYearEditor from "@/components/academic-years/academic-year-editor"
import type { AcademicYearFormValues } from "@/components/academic-years/academic-year-form"
import AdminPageTitle from "@/components/layout/admin-page-title"
import {
	useAcademicYear,
	useAcademicYearQuotaRowsFor,
	useUpdateAcademicYear,
} from "@/hooks/use-academic-years"
import { useLegacySubmit } from "@/hooks/use-legacy-submit"

// Legacy academic-year/edit.blade.php + default-ajax.js
export const Route = createFileRoute("/_auth/academic-years/$academicYearId/edit")({
	component: AcademicYearEditPage,
})

const toFormValues = (detail: AcademicYearDetail): AcademicYearFormValues => ({
	startYear: detail.startYear === null ? "" : String(detail.startYear),
	endYear: detail.endYear === null ? "" : String(detail.endYear),
	costDateStart: detail.costDateStart ?? "",
	costDateEnd: detail.costDateEnd ?? "",
	activeKbm: detail.activeKbm ?? "",
	note: detail.note ?? "",
	serialNumber: detail.serialNumber ?? "",
	status: detail.status,
	// The radios are pre-checked from `$academic_year->type`; the blade falls back to reguler
	type: detail.type === "indent" ? "indent" : "reguler",
	isCurrent: detail.isCurrent,
})

function AcademicYearEditPage(): JSX.Element {
	const { academicYearId } = Route.useParams()
	const id = Number(academicYearId)
	const detail = useAcademicYear(id)
	const quotaRows = useAcademicYearQuotaRowsFor(id)
	const updateAcademicYear = useUpdateAcademicYear(id)

	// The edit form has no `data-redirect`, so `default-ajax.js` reloads the page 1000 ms later
	const save = useLegacySubmit({
		mutationFn: (payload: AcademicYearPayload) => updateAcademicYear.mutateAsync(payload),
	})

	return (
		<>
			<AdminPageTitle title="Detail Tahun Ajaran" breadcrumbs={[{ label: "…", dropdown: [{ label: "Data Master", to: "/academic-years" }] }, { label: "Tahun Ajaran", to: "/academic-years" }, { label: "Semua", to: "/academic-years" }, { label: "Detail" }]} />

			{detail.data === undefined ? null : (
				<AcademicYearEditor
					// Legacy re-renders the whole page after a save; remount when the record changes
					key={detail.dataUpdatedAt}
					mode="edit"
					initial={toFormValues(detail.data)}
					quotaRows={quotaRows.data ?? []}
					quotaProcessing={quotaRows.isFetching}
					quotaLoaded={quotaRows.isSuccess}
					onSubmit={save.submit}
					submitting={save.submitting}
				/>
			)}
		</>
	)
}

export default AcademicYearEditPage
