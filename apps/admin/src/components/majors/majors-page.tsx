import { useState, type JSX } from "react"

import AdminPageTitle from "@/components/layout/admin-page-title"
import LegacyCard from "@/components/legacy/legacy-card"

import MajorEditModal from "./major-edit-modal"
import MajorForm from "./major-form"
import MajorTable from "./major-table"

const MajorsPage = (): JSX.Element => {
	const [editingId, setEditingId] = useState<number | null>(null)

	return (
		<>
			<AdminPageTitle title="Jurusan" breadcrumbs={[{ label: "Data Master", to: "/majors" }, { label: "Akademik", to: "/majors" }, { label: "Jurusan" }]} />

			<div className="mx-[-15px] flex flex-wrap justify-center">
				<div className="w-full min-w-0 px-[15px] min-[992px]:max-w-[33.333333%] min-[992px]:flex-[0_0_33.333333%]">
					<MajorForm />
				</div>

				<div className="w-full min-w-0 px-[15px] min-[992px]:max-w-[66.666667%] min-[992px]:flex-[0_0_66.666667%]">
					<LegacyCard>
						<MajorTable onEdit={setEditingId} />
					</LegacyCard>
				</div>
			</div>

			<MajorEditModal majorId={editingId} onClose={() => setEditingId(null)} />
		</>
	)
}

export default MajorsPage
