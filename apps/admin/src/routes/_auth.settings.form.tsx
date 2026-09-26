import { createFileRoute } from "@tanstack/react-router"

import SettingFormPage from "@/components/settings/form-builder/setting-form-page"
import { requireRoles } from "@/lib/route-guards"

export const Route = createFileRoute("/_auth/settings/form")({
	beforeLoad: () => requireRoles("superadmin", "admin"),
	component: SettingFormPage,
})
