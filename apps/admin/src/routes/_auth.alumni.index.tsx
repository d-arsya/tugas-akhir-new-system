import { type JSX } from "react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { adminApi } from "@/lib/api"
import { PageLoader } from "@roja/ui"
import { AlumniOverview } from "@/components/alumni/alumni-overview"

export const Route = createFileRoute("/_auth/alumni/")({
	component: AlumniIndexLevel1Page,
})

function AlumniIndexLevel1Page(): JSX.Element {
	const navigate = useNavigate()

	const { data: alumniData, isLoading } = useQuery({
		queryKey: ["admin-alumni"],
		queryFn: () => adminApi.getAlumni({}),
	})

	const archiveAlumni = alumniData?.data?.items || [
		{ id: 1, fullName: "Ahmad Zaki Al-Mahdali", phone: "081234567890", province: "DKI Jakarta", regency: "Jakarta Selatan", talents: "Tahfizh 30 Juz & IT Software" },
		{ id: 2, fullName: "Siti Aminah Az-Zahra", phone: "081298765432", province: "Jawa Barat", regency: "Kota Bandung", talents: "Bahasa Arab & Medicine" },
	]

	const graduationYears = [
		{ year: "2025", totalCount: 48, maleCount: 26, femaleCount: 22 },
		{ year: "2024", totalCount: 42, maleCount: 22, femaleCount: 20 },
		{ year: "2023", totalCount: 38, maleCount: 20, femaleCount: 18 },
	]

	if (isLoading) return <PageLoader />

	return (
		<AlumniOverview
			graduationYears={graduationYears}
			archiveAlumni={archiveAlumni}
			onSelectYear={(year) => {
				navigate({
					to: "/alumni/$graduationYear" as any,
					params: { graduationYear: String(year) } as any,
				})
			}}
		/>
	)
}
