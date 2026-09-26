import type { JSX } from "react"

import AdminPageTitle from "@/components/layout/admin-page-title"
import LegacyCard, { LegacyCardText, LegacyCardTitle } from "@/components/legacy/legacy-card"
import { useAnnouncementSetting, useRefetchAnnouncementSetting } from "@/hooks/use-announcement-setting"

import AnnouncementForm from "./announcement-form"

const SettingAnnouncementPage = (): JSX.Element => {
	const { data: announcement } = useAnnouncementSetting()
	const refetch = useRefetchAnnouncementSetting()

	return (
		<>
			<AdminPageTitle title="Pengumuman PSB" breadcrumbs={[{ label: "Lainnya" }, { label: "Pengaturan" }, { label: "Pengumuman PSB" }]} />

			<div className="mx-[-15px] flex flex-wrap justify-center">
				<div className="relative w-full max-w-full flex-[0_0_100%] px-[15px] min-[992px]:max-w-[83.333333%] min-[992px]:flex-[0_0_83.333333%]">
					<LegacyCard bodyClassName="p-[24px]">
						<LegacyCardTitle>Keterangan</LegacyCardTitle>
						<LegacyCardText>
							Berikan informasi dengan singkat dan jelas untuk menginformasikan bahwa pendaftar diterima atau tidak
							diterima.
						</LegacyCardText>
						<AnnouncementForm announcement={announcement} onSaved={refetch} />
					</LegacyCard>
				</div>
			</div>
		</>
	)
}

export default SettingAnnouncementPage
