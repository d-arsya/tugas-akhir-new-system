import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

import AdminPageTitle from "@/components/layout/admin-page-title"
import LegacyCard, { LegacyCardText, LegacyCardTitle } from "@/components/legacy/legacy-card"
import AnnouncementForm from "@/components/settings/announcement/announcement-form"
import { useAnnouncementSetting, useRefetchAnnouncementSetting } from "@/hooks/use-announcement-setting"
import { requireRoles } from "@/lib/route-guards"

// WS-B: legacy setting/annc.blade.php + summernote
export const Route = createFileRoute("/_auth/settings/announcements")({
	beforeLoad: () => requireRoles("superadmin", "admin"),
	component: SettingAnnouncementPage,
})

function SettingAnnouncementPage(): JSX.Element {
	const { data: announcement } = useAnnouncementSetting()
	// Legacy reloads the page 1000 ms after saving; the port refetches the row instead
	const refetch = useRefetchAnnouncementSetting()

	return (
		<>
			<AdminPageTitle title="Pengumuman PSB" breadcrumbs={[{ label: "Lainnya" }, { label: "Pengaturan" }, { label: "Pengumuman PSB" }]} />

			{/* `.row.justify-content-center > .col-xl-10.col-lg-10.col-md-12.col-sm-12.col-12` */}
			<div className="mx-[-15px] flex flex-wrap justify-center">
				<div className="relative w-full max-w-full flex-[0_0_100%] px-[15px] min-[992px]:max-w-[83.333333%] min-[992px]:flex-[0_0_83.333333%]">
					{/* `.card-body.p-4` */}
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
