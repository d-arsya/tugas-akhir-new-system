import { type JSX } from "react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { adminApi } from "@/lib/api"
import { PageLoader } from "@roja/ui"
import { PsbLevel1Ay } from "@/components/registrants/psb-level1-ay"

export const Route = createFileRoute("/_auth/registrants/")({
	component: RegistrantsIndexLevel1Page,
})

function RegistrantsIndexLevel1Page(): JSX.Element {
	const navigate = useNavigate()

	const { data: ayData, isLoading } = useQuery({
		queryKey: ["admin-academic-years"],
		queryFn: () => adminApi.getAcademicYearRows(),
	})

	const academicYears = ayData ?? []

	if (isLoading) return <PageLoader />

	return (
		<PsbLevel1Ay
			academicYears={academicYears}
			onSelectAy={(ay) => {
				navigate({
					to: "/registrants/$academicYearId/workbench" as any,
					params: { academicYearId: String(ay.id) } as any,
				})
			}}
			onOpenCreate={() => {
				navigate({ to: "/registrants/create" as any })
			}}
		/>
	)
}
