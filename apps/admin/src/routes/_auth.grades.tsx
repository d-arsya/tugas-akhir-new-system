import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

import AdminPageTitle from "@/components/layout/admin-page-title"
import GradeCard from "@/components/grades/grade-card"
import SubGradeCard from "@/components/grades/sub-grade-card"
import { requireRoles } from "@/lib/route-guards"

// `.col-xl-6.col-lg-6.col-md-12.col-sm-12.col-12` — the two cards sit side by side from lg up
const COLUMN_CLASS = "w-full min-w-0 px-[15px] min-[992px]:max-w-[50%] min-[992px]:flex-[0_0_50%]"

// Legacy grade/index.blade.php (Kelas + Subkelas on one page)
export const Route = createFileRoute("/_auth/grades")({
	beforeLoad: () => requireRoles("superadmin", "admin"),
	component: GradesPage,
})

function GradesPage(): JSX.Element {
	return (
		<>
			<AdminPageTitle title="Kelas" breadcrumbs={[{ label: "Data Master", to: "/grades" }, { label: "Akademik", to: "/grades" }, { label: "Kelas" }]} />

			{/* `.row.justify-content-center` */}
			<div className="mx-[-15px] flex flex-wrap justify-center">
				<div className={COLUMN_CLASS}>
					<GradeCard />
				</div>
				<div className={COLUMN_CLASS}>
					<SubGradeCard />
				</div>
			</div>
		</>
	)
}

export default GradesPage
