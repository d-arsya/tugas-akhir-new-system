import type { JSX } from "react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"

import type { AcademicYearPayload } from "@roja/types"

import AcademicYearEditor from "@/components/academic-years/academic-year-editor"
import { EMPTY_ACADEMIC_YEAR_FORM } from "@/components/academic-years/academic-year-form"
import AdminPageTitle from "@/components/layout/admin-page-title"
import { useAcademicYearQuotaRows, useCreateAcademicYear } from "@/hooks/use-academic-years"
import { useLegacySubmit } from "@/hooks/use-legacy-submit"

// Legacy academic-year/create.blade.php + default-ajax.js
export const Route = createFileRoute("/_auth/academic-years/create")({
	component: AcademicYearCreatePage,
})

function AcademicYearCreatePage(): JSX.Element {
	const navigate = useNavigate()
	const createAcademicYear = useCreateAcademicYear()
	const quotaRows = useAcademicYearQuotaRows()

	// `data-redirect="{{ route('academic-year.index') }}"`: the notice first, the redirect 1000 ms later
	const save = useLegacySubmit({
		mutationFn: (payload: AcademicYearPayload) => createAcademicYear.mutateAsync(payload),
		onDone: () => void navigate({ to: "/academic-years" }),
	})

	return (
		<>
			<AdminPageTitle title="Tambah Tahun Ajaran" breadcrumbs={[{ label: "Data Master", to: "/academic-years" }, { label: "Tahun Ajaran", to: "/academic-years" }, { label: "Tambah" }]} />

			<AcademicYearEditor
				mode="create"
				initial={EMPTY_ACADEMIC_YEAR_FORM}
				quotaRows={quotaRows.data ?? []}
				quotaProcessing={quotaRows.isFetching}
				quotaLoaded={quotaRows.isSuccess}
				onSubmit={save.submit}
				submitting={save.submitting}
			/>
		</>
	)
}

export default AcademicYearCreatePage
