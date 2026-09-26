import { createFileRoute } from "@tanstack/react-router"

import SettingSchoolPage from "@/components/settings/school/setting-school-page"
import { requireRoles } from "@/lib/route-guards"

export const Route = createFileRoute("/_auth/settings/school")({
	beforeLoad: () => requireRoles("superadmin", "admin"),
	component: SettingSchoolPage,
})
