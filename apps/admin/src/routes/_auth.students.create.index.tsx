import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

import StudentCreatePage, { type StudentCreateSearch } from "@/components/students/student-create-page"

const text = (value: unknown): string | undefined =>
	typeof value === "string" || typeof value === "number" ? String(value) : undefined

export const Route = createFileRoute("/_auth/students/create/")({
	validateSearch: (search: Record<string, unknown>): StudentCreateSearch => {
		const out: StudentCreateSearch = {}
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
	return <StudentCreatePage search={search} />
}

export default Page
