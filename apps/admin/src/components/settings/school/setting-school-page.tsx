import type { JSX } from "react"

import AdminPageTitle from "@/components/layout/admin-page-title"
import LegacyCard, { LegacyCardText, LegacyCardTitle } from "@/components/legacy/legacy-card"
import { useRefetchSchoolSetting, useSchoolSetting } from "@/hooks/use-school-setting"

import SchoolForm from "./school-form"

const SettingSchoolPage = (): JSX.Element => {
	const { data: school } = useSchoolSetting()
	const refetch = useRefetchSchoolSetting()

	return (
		<>
			<AdminPageTitle title="Profil Pondok" breadcrumbs={[{ label: "Lainnya" }, { label: "Pengaturan" }, { label: "Profil Pondok" }]} />

			<div className="mx-[-15px] flex flex-wrap justify-center">
				<div className="relative w-full max-w-full flex-[0_0_100%] px-[15px] min-[992px]:max-w-[83.333333%] min-[992px]:flex-[0_0_83.333333%] min-[1200px]:max-w-[75%] min-[1200px]:flex-[0_0_75%]">
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
