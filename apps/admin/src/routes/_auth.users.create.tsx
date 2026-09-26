import { createFileRoute } from "@tanstack/react-router"

import UserCreatePage from "@/components/users/user-create-page"

export const Route = createFileRoute("/_auth/users/create")({
	component: UserCreatePage,
})
