import type { JSX } from "react"

import AdminPageTitle from "@/components/layout/admin-page-title"
import { useDelegateAcademicYear, type AcademicYearDelegateStep } from "@/hooks/use-academic-year-delete"

import AcademicYearDeleteCard from "./academic-year-delete-card"

type AcademicYearDelegatePageProps = { academicYearId: number; step: AcademicYearDelegateStep }

const STEP_COPY: Record<AcademicYearDelegateStep, { noun: string; lockedText?: string }> = {
	"delegate-registrant": {
		noun: "pendaftar",
		lockedText:
			"Oops... Terdapat data pendaftar yang sedang aktif akunnya. Silakan nonaktifkan terlebih dahulu sebelum menghapus tahun ajaran",
	},
	"delegate-student": {
		noun: "santri",
		lockedText:
			"Oops... Terdapat data santri yang sedang aktif KBM maupun akunnya. Silakan nonaktifkan terlebih dahulu sebelum menghapus tahun ajaran",
	},
	"delegate-alumni": { noun: "alumni" },
}

const AcademicYearDelegatePage = ({ academicYearId, step }: AcademicYearDelegatePageProps): JSX.Element => {
	const submit = useDelegateAcademicYear(academicYearId, step)

	return (
		<>
			<AdminPageTitle title="Hapus Tahun Ajaran" breadcrumbs={[{ label: "…", dropdown: [{ label: "Data Master", to: "/academic-years" }] }, { label: "Tahun Ajaran", to: "/academic-years" }, { label: "Semua", to: "/academic-years" }, { label: "Hapus" }]} />

			<AcademicYearDeleteCard academicYearId={academicYearId} step={step} {...STEP_COPY[step]} submit={submit} />
		</>
	)
}

export default AcademicYearDelegatePage
