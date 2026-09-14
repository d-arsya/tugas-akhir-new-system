import { type JSX } from "react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { adminApi } from "@/lib/api"
import { PageLoader } from "@roja/ui"
import { StudentLevel1Ay } from "@/components/students/student-level1-ay"

export const Route = createFileRoute("/_auth/students/")({
	component: StudentIndexLevel1Page,
})

function StudentIndexLevel1Page(): JSX.Element {
	const navigate = useNavigate()

	const { data: ayData, isLoading: ayLoading } = useQuery({
		queryKey: ["admin-academic-years"],
		queryFn: () => adminApi.getAcademicYears(),
	})

	const academicYears = ayData?.data || []

	if (ayLoading) return <PageLoader />

	return (
		<StudentLevel1Ay
			academicYears={academicYears}
			onSelectAy={(ay) => {
				navigate({
					to: "/students/$academicYearId/grades" as any,
					params: { academicYearId: String(ay.id) } as any,
				})
			}}
			onOpenCreateModal={() => {
				navigate({ to: "/students/create" as any })
			}}
		/>
	)
}
