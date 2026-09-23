import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

import AdminPageTitle from "@/components/layout/admin-page-title"
import LegacyCard, { LegacyCardText, LegacyCardTitle } from "@/components/legacy/legacy-card"
import SchoolForm from "@/components/settings/school/school-form"
import { useRefetchSchoolSetting, useSchoolSetting } from "@/hooks/use-school-setting"
import { requireRoles } from "@/lib/route-guards"

// WS-B: legacy setting/school.blade.php
export const Route = createFileRoute("/_auth/settings/school")({
	beforeLoad: () => requireRoles("superadmin", "admin"),
	component: SettingSchoolPage,
})

function SettingSchoolPage(): JSX.Element {
	const { data: school } = useSchoolSetting()
	// Legacy reloads the page 1000 ms after saving; the port refetches the row instead
	const refetch = useRefetchSchoolSetting()

	return (
		<>
			<AdminPageTitle title="Profil Pondok" breadcrumbs={[{ label: "Lainnya" }, { label: "Pengaturan" }, { label: "Profil Pondok" }]} />

			{/* `.row.justify-content-center > .col-xl-9.col-lg-10.col-md-12.col-sm-12.col-12` */}
			<div className="mx-[-15px] flex flex-wrap justify-center">
				<div className="relative w-full max-w-full flex-[0_0_100%] px-[15px] min-[992px]:max-w-[83.333333%] min-[992px]:flex-[0_0_83.333333%] min-[1200px]:max-w-[75%] min-[1200px]:flex-[0_0_75%]">
					{/* `.card-body.p-4.px-lg-5` */}
					<LegacyCard bodyClassName="p-[24px] min-[992px]:px-[48px]">
						<LegacyCardTitle>Profil pondok</LegacyCardTitle>
						<LegacyCardText>Silakan inputkan data sesuai dengan profil pondok Anda.</LegacyCardText>
						<SchoolForm school={school} onSaved={refetch} />
					</LegacyCard>
				</div>
			</div>
		</>
	)
}

export default SettingSchoolPage
