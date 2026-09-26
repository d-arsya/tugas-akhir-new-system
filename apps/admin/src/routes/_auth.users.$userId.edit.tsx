import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

import UserEditPage from "@/components/users/user-edit-page"

export const Route = createFileRoute("/_auth/users/$userId/edit")({
	component: UserEditRoute,
})

function UserEditRoute(): JSX.Element {
	const { userId } = Route.useParams()
	return <UserEditPage userId={userId} />
}

export default UserEditRoute
