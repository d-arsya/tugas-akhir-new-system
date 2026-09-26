import type { JSX } from "react"

import type { AcademicYearDetail, AcademicYearPayload } from "@roja/types"

import AdminPageTitle from "@/components/layout/admin-page-title"
import {
	useAcademicYear,
	useAcademicYearQuotaRowsFor,
	useUpdateAcademicYear,
} from "@/hooks/use-academic-years"
import { useLegacySubmit } from "@/hooks/use-legacy-submit"

import AcademicYearEditor from "./academic-year-editor"
import type { AcademicYearFormValues } from "./academic-year-form-values"

const toFormValues = (detail: AcademicYearDetail): AcademicYearFormValues => ({
	startYear: detail.startYear === null ? "" : String(detail.startYear),
	endYear: detail.endYear === null ? "" : String(detail.endYear),
	costDateStart: detail.costDateStart ?? "",
	costDateEnd: detail.costDateEnd ?? "",
	activeKbm: detail.activeKbm ?? "",
	note: detail.note ?? "",
	serialNumber: detail.serialNumber ?? "",
	status: detail.status,
	type: detail.type === "indent" ? "indent" : "reguler",
	isCurrent: detail.isCurrent,
})

const AcademicYearEditPage = ({ academicYearId }: { academicYearId: number }): JSX.Element => {
	const detail = useAcademicYear(academicYearId)
	const quotaRows = useAcademicYearQuotaRowsFor(academicYearId)
	const updateAcademicYear = useUpdateAcademicYear(academicYearId)

	const save = useLegacySubmit({
		mutationFn: (payload: AcademicYearPayload) => updateAcademicYear.mutateAsync(payload),
	})

	return (
		<>
			<AdminPageTitle title="Detail Tahun Ajaran" breadcrumbs={[{ label: "…", dropdown: [{ label: "Data Master", to: "/academic-years" }] }, { label: "Tahun Ajaran", to: "/academic-years" }, { label: "Semua", to: "/academic-years" }, { label: "Detail" }]} />

			{detail.data === undefined ? null : (
				<AcademicYearEditor
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
