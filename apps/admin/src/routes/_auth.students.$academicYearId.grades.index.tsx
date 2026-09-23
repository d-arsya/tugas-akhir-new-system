import { type JSX } from "react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { adminApi } from "@/lib/api"
import { PageLoader } from "@roja/ui"
import { StudentLevel2Grade } from "@/components/students/student-level2-grade"

export const Route = createFileRoute("/_auth/students/$academicYearId/grades/")({
	component: StudentGradesLevel2Page,
})

function StudentGradesLevel2Page(): JSX.Element {
	const navigate = useNavigate()
	const { academicYearId } = Route.useParams()

	const { data: ayData, isLoading: ayLoading } = useQuery({
		queryKey: ["admin-academic-years"],
		queryFn: () => adminApi.getAcademicYearRows(),
	})

	const { data: gradesData, isLoading: gradesLoading } = useQuery({
		queryKey: ["admin-grades"],
		queryFn: () => adminApi.getGradeRows(),
	})

	const academicYears = ayData ?? []
	const grades = (gradesData ?? []).map((g) => ({
		id: g.id,
		name: g.name,
		levelName: g.levelName ?? "",
	}))

	const matchedAy = academicYears.find((a) => String(a.id) === String(academicYearId))
	// AcademicYearRow has no semester; the header only renders the year.
	const currentAy = {
		id: Number(academicYearId),
		year: matchedAy?.year ?? "",
		semester: "",
	}

	if (ayLoading || gradesLoading) return <PageLoader />

	return (
		<StudentLevel2Grade
			academicYear={currentAy}
			grades={grades}
			onSelectGrade={(g) => {
				navigate({
					to: "/students/$academicYearId/grades/$gradeId" as any,
					params: { academicYearId: String(academicYearId), gradeId: String(g.id) } as any,
				})
			}}
			onBackToAy={() => {
				navigate({ to: "/students" as any })
			}}
			onOpenImportModal={() => {
				alert("Membuka Modal Import Excel Santri...")
			}}
		/>
	)
}
