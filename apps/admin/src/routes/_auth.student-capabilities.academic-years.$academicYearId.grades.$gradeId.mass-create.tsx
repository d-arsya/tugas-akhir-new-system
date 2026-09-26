import type { JSX } from "react"
import { createFileRoute, redirect } from "@tanstack/react-router"
import { z } from "zod"

import CapabilityMassCreatePage from "@/components/student-capabilities/mass/capability-mass-create-page"

// The search parser JSON-decodes values, so a single id (`?students=99005`) arrives as a number
const searchSchema = z.object({
	students: z
		.union([z.string(), z.number()])
		.optional()
		.transform((value) => (value === undefined ? undefined : String(value))),
})

export const Route = createFileRoute("/_auth/student-capabilities/academic-years/$academicYearId/grades/$gradeId/mass-create")({
	validateSearch: searchSchema,
	beforeLoad: ({ search, params }) => {
		if (!search.students) {
			throw redirect({ to: "/student-capabilities/academic-years/$academicYearId/grades/$gradeId", params })
		}
	},
	component: StudentCapabilityMassCreatePage,
})

function StudentCapabilityMassCreatePage(): JSX.Element {
	const { academicYearId, gradeId } = Route.useParams()
	const { students } = Route.useSearch()
	return <CapabilityMassCreatePage academicYearId={academicYearId} gradeId={gradeId} students={students} />
}

export default StudentCapabilityMassCreatePage
