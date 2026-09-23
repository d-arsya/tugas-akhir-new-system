import { useState, type JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

import AdminPageTitle from "@/components/layout/admin-page-title"
import LegacyTabs from "@/components/legacy/legacy-tabs"
import BackupDatabaseTab from "@/components/settings/system/backup-database-tab"
import EmailTab from "@/components/settings/system/email-tab"
import SecurityTab from "@/components/settings/system/security-tab"
import SystemTabIcon from "@/components/settings/system/system-tab-icon"
import { useRefetchSystemSetting, useSystemSetting } from "@/hooks/use-system-setting"
import { requireRoles } from "@/lib/route-guards"

type SystemTab = "database-backup" | "email" | "security"

// `span.mx-2.tbr_weight-medium` — the kit's tab span carries the 8px margins, this adds the weight
const tabLabel = (text: string): JSX.Element => <span className="font-medium">{text}</span>

// WS-D: legacy setting/setting.blade.php (backup, email, keamanan tabs)
export const Route = createFileRoute("/_auth/settings/")({
	beforeLoad: () => requireRoles("superadmin"),
	component: SettingSystemPage,
})

function SettingSystemPage(): JSX.Element {
	const [tab, setTab] = useState<SystemTab>("database-backup")
	const { data: setting } = useSystemSetting()
	// Legacy reloads the page 1000 ms after each save; the port refetches and keeps the open tab
	const refetch = useRefetchSystemSetting()

	return (
		<>
			<AdminPageTitle title="Sistem" breadcrumbs={[{ label: "Lainnya" }, { label: "Pengaturan" }, { label: "Sistem" }]} />

			{/* `.row.justify-content-center > .col-xl-9.col-lg-10.col-md-12.col-sm-12.col-12` */}
			<div className="mx-[-15px] flex flex-wrap justify-center">
				<div className="relative w-full max-w-full flex-[0_0_100%] px-[15px] min-[992px]:max-w-[83.333333%] min-[992px]:flex-[0_0_83.333333%] min-[1200px]:max-w-[75%] min-[1200px]:flex-[0_0_75%]">
					<LegacyTabs
						active={tab}
						onChange={setTab}
						tabs={[
							{
								key: "database-backup",
								icon: <SystemTabIcon name="hard-drive" active={tab === "database-backup"} />,
								label: tabLabel("Backup Database"),
								content: <BackupDatabaseTab setting={setting} onSaved={refetch} />,
							},
							{
								key: "email",
								icon: <SystemTabIcon name="paper-plane" active={tab === "email"} />,
								label: tabLabel("Email"),
								content: <EmailTab setting={setting} onSaved={refetch} />,
							},
							{
								key: "security",
								icon: <SystemTabIcon name="shield" active={tab === "security"} />,
								label: tabLabel("Keamanan"),
								content: <SecurityTab setting={setting} onSaved={refetch} />,
							},
						]}
					/>
				</div>
			</div>
		</>
	)
}

export default SettingSystemPage
