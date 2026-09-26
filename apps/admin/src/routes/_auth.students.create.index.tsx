import { useEffect, useState, type JSX } from "react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"

import type { SocietyValues } from "@roja/types"

import StudentWizard from "@/components/students/student-wizard"

// Legacy student/create/data/personal.blade.php — step 1 of the Tambah Santri wizard (`Student\PersonalController`).
//
// The roster's "Tambah" arrives with `?academic_year=&grade=&level_id=` (legacy `StudentController::create:359`):
// the personal draft is reset to those values, shown locked, and the query is dropped from the address like
// legacy's redirect to `/create/personal`. The sidebar's plain `/students/create` keeps any unfinished draft
// (legacy `?sidebar=true` never cleared it — kept).
type CreateSearch = { academic_year?: string; grade?: string; level_id?: string }

const text = (value: unknown): string | undefined =>
	typeof value === "string" || typeof value === "number" ? String(value) : undefined

export const Route = createFileRoute("/_auth/students/create/")({
	validateSearch: (search: Record<string, unknown>): CreateSearch => {
		const out: CreateSearch = {}
		const year = text(search["academic_year"])
		const grade = text(search["grade"])
		const level = text(search["level_id"])
		if (year !== undefined) out.academic_year = year
		if (grade !== undefined) out.grade = grade
		if (level !== undefined) out.level_id = level
		return out
	},
	component: Page,
})

function Page(): JSX.Element {
	const search = Route.useSearch()
	const navigate = useNavigate()
	// Read once: the wizard seeds the draft from it on mount, then the query goes away
	const [locked] = useState<SocietyValues | undefined>(() =>
		search.academic_year === undefined && search.grade === undefined && search.level_id === undefined
			? undefined
			: { academic_year_id: search.academic_year ?? "", grade: search.grade ?? "", level_id: search.level_id ?? "" },
	)

	useEffect(() => {
		if (locked) void navigate({ to: "/students/create", search: {}, replace: true })
	}, [locked, navigate])

	return <StudentWizard step="personal" {...(locked ? { lockedValues: locked } : {})} />
}

export default Page
