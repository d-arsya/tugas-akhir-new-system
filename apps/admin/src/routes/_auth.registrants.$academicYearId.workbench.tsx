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
		queryFn: () => adminApi.getAcademicYearRows(),
	})

	const { data: registrantsData, isLoading: regLoading } = useQuery({
		queryKey: ["admin-registrants", academicYearId],
		queryFn: () => adminApi.getRegistrants({}),
	})

	const academicYears = ayData ?? []
	const registrants = registrantsData?.data?.items || []

	const matchedAy = academicYears.find((a) => String(a.id) === String(academicYearId))
	// AcademicYearRow has no semester; the workbench header only renders the year.
	const currentAy = {
		id: Number(academicYearId),
		year: matchedAy?.year ?? "",
		semester: "",
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
