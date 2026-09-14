import { type JSX } from "react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { adminApi } from "@/lib/api"
import { PageLoader } from "@roja/ui"
import { PsbLevel2Workbench } from "@/components/registrants/psb-level2-workbench"

export const Route = createFileRoute("/_auth/registrants/$academicYearId/workbench")({
	component: RegistrantsWorkbenchLevel2Page,
})

function RegistrantsWorkbenchLevel2Page(): JSX.Element {
	const navigate = useNavigate()
	const { academicYearId } = Route.useParams()

	const { data: ayData, isLoading: ayLoading } = useQuery({
		queryKey: ["admin-academic-years"],
		queryFn: () => adminApi.getAcademicYears(),
	})

	const { data: registrantsData, isLoading: regLoading } = useQuery({
		queryKey: ["admin-registrants", academicYearId],
		queryFn: () => adminApi.getRegistrants({}),
	})

	const academicYears = ayData?.data || []
	const registrants = registrantsData?.data?.items || []

	const currentAy = academicYears.find((a: any) => String(a.id) === String(academicYearId)) || {
		id: Number(academicYearId),
		year: "2026/2027",
		semester: "Ganjil",
	}

	if (ayLoading || regLoading) return <PageLoader />

	return (
		<PsbLevel2Workbench
			academicYear={currentAy}
			registrants={registrants}
			onBackToAy={() => {
				navigate({ to: "/registrants" as any })
			}}
			onOpenCreate={() => {
				navigate({ to: "/registrants/create" as any })
			}}
		/>
	)
}
