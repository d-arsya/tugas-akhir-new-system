import { useState, type JSX } from "react"
import { Link } from "@tanstack/react-router"

import AdminPageTitle, { CRUMB_LINK_CLASS } from "@/components/layout/admin-page-title"
import { useAlumniDetail } from "@/hooks/use-alumni"
import { useSocietySettings } from "@/hooks/use-society-settings"

import AlumniDetailForm from "./alumni-detail-form"

// OWNER: AK-A. Legacy `alumni/edit.blade.php` ("Detail Alumni", `/alumni/graduation-year/detail/{alumni}`) with
// `alumni/partials/edit/page-header.blade.php`. After a save legacy reloads the page; here the record is read
// again (every Akademik write invalidates it) and the form remounts on the fresh data.

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
					// Only a save remounts the form: a background refetch must not wipe what is being typed
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
