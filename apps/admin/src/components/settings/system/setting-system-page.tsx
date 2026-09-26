import { useState, type JSX } from "react"

import AdminPageTitle from "@/components/layout/admin-page-title"
import LegacyTabs from "@/components/legacy/legacy-tabs"
import { useRefetchSystemSetting, useSystemSetting } from "@/hooks/use-system-setting"

import BackupDatabaseTab from "./backup-database-tab"
import EmailTab from "./email-tab"
import SecurityTab from "./security-tab"
import SystemTabIcon from "./system-tab-icon"

type SystemTab = "database-backup" | "email" | "security"

const tabLabel = (text: string): JSX.Element => <span className="font-medium">{text}</span>

const SettingSystemPage = (): JSX.Element => {
	const [tab, setTab] = useState<SystemTab>("database-backup")
	const { data: setting } = useSystemSetting()
	const refetch = useRefetchSystemSetting()

	return (
		<>
			<AdminPageTitle title="Sistem" breadcrumbs={[{ label: "Lainnya" }, { label: "Pengaturan" }, { label: "Sistem" }]} />

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
