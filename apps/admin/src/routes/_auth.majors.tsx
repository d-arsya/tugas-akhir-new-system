import { useState, type JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

import AdminPageTitle from "@/components/layout/admin-page-title"
import LegacyCard from "@/components/legacy/legacy-card"
import MajorEditModal from "@/components/majors/major-edit-modal"
import MajorForm from "@/components/majors/major-form"
import MajorTable from "@/components/majors/major-table"
import { requireRoles } from "@/lib/route-guards"

// Legacy major/index.blade.php
export const Route = createFileRoute("/_auth/majors")({
	beforeLoad: () => requireRoles("superadmin", "admin"),
	component: MajorsPage,
})

function MajorsPage(): JSX.Element {
	// `editData(event, '#edit-modal-mojor', url, id)` — one modal, refetched per row
	const [editingId, setEditingId] = useState<number | null>(null)

	return (
		<>
			<AdminPageTitle title="Jurusan" breadcrumbs={[{ label: "Data Master", to: "/majors" }, { label: "Akademik", to: "/majors" }, { label: "Jurusan" }]} />

			{/* `.row.justify-content-center` */}
			<div className="mx-[-15px] flex flex-wrap justify-center">
				{/* `.col-xl-4.col-lg-4.col-md-12.col-sm-12.col-12` */}
				<div className="w-full min-w-0 px-[15px] min-[992px]:max-w-[33.333333%] min-[992px]:flex-[0_0_33.333333%]">
					<MajorForm />
				</div>

				{/* `.col-xl-8.col-lg-8.col-md-12.col-sm-12.col-12` */}
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
