import { createFileRoute } from "@tanstack/react-router"

import SettingAnnouncementPage from "@/components/settings/announcement/setting-announcement-page"
import { requireRoles } from "@/lib/route-guards"

export const Route = createFileRoute("/_auth/settings/announcements")({
	beforeLoad: () => requireRoles("superadmin", "admin"),
	component: SettingAnnouncementPage,
})
