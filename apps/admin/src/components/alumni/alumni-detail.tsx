import { useState, type JSX } from "react"
import { Link } from "@tanstack/react-router"

import AdminPageTitle, { CRUMB_LINK_CLASS } from "@/components/layout/admin-page-title"
import { useAlumniDetail } from "@/hooks/use-alumni"
import { useSocietySettings } from "@/hooks/use-society-settings"

import AlumniDetailForm from "./alumni-detail-form"

const AlumniDetail = ({ alumniId }: { alumniId: number }): JSX.Element => {
	const detail = useAlumniDetail(alumniId)
	const settings = useSocietySettings()
	const [generation, setGeneration] = useState(0)

	const year = detail.data?.graduationYear ?? ""

	return (
		<>
			<AdminPageTitle
				title="Detail Alumni"
				breadcrumbs={[
					{
						label: "",
						dropdown: [
							{ label: "Alumni", to: "/alumni" },
							{ label: "Akademik", to: "/alumni" },
						],
					},
					{ label: "Data Alumni", to: "/alumni" },
					{
						label: year,
						...(year
							? {
									node: (
										<Link to="/alumni/graduation-year/$year" params={{ year }} className={CRUMB_LINK_CLASS}>
											{year}
										</Link>
									),
								}
							: {}),
					},
					{ label: "Detail" },
				]}
			/>

			{detail.data && settings.data ? (
				<AlumniDetailForm
					// Remount only after a save, so a background refetch never wipes unsaved input
					key={generation}
					detail={detail.data}
					settings={settings.data}
					onSaved={() => {
						void detail.refetch().then(() => setGeneration((value) => value + 1))
					}}
				/>
			) : null}
		</>
	)
}

export default AlumniDetail
