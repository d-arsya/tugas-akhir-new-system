import { createFileRoute } from "@tanstack/react-router"

import SettingSystemPage from "@/components/settings/system/setting-system-page"
import { requireRoles } from "@/lib/route-guards"

export const Route = createFileRoute("/_auth/settings/")({
	beforeLoad: () => requireRoles("superadmin"),
	component: SettingSystemPage,
})
