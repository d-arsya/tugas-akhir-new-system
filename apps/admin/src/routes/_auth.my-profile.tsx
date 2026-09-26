import { createFileRoute } from "@tanstack/react-router"

import MyProfilePage from "@/components/settings/my-profile/my-profile-page"

export const Route = createFileRoute("/_auth/my-profile")({
	component: MyProfilePage,
})
