import { useState, type JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

import type { AdminUserPayload } from "@roja/types"

import AdminPageTitle from "@/components/layout/admin-page-title"
import UserForm, { type UserFormValues } from "@/components/users/user-form"
import { useLegacySubmit } from "@/hooks/use-legacy-submit"
import { useUpdateUser, useUser } from "@/hooks/use-users"

// WS-A: legacy user/edit.blade.php
export const Route = createFileRoute("/_auth/users/$userId/edit")({
	component: UserEditPage,
})

function UserEditPage(): JSX.Element {
	const { userId } = Route.useParams()
	const id = Number(userId)
	const { data: user } = useUser(id)
	const updateUser = useUpdateUser(id)
	// Legacy has no `data-redirect` here, so `default-ajax.js` reloads the page instead
	const [reloadKey, setReloadKey] = useState(0)

	const save = useLegacySubmit({
		mutationFn: (payload: AdminUserPayload) => updateUser.mutateAsync(payload),
		onDone: () => setReloadKey((key) => key + 1),
	})

	const initial: UserFormValues | null = user
		? {
				name: user.name ?? "",
				gender: user.gender ?? "male",
				role: user.role ?? "",
				email: user.email ?? "",
				isBlocked: user.isBlocked,
			}
		: null

	return (
		<>
			<AdminPageTitle
				title="Detail Pengelola"
				breadcrumbs={[
					// Legacy collapses "Lainnya" into the three-dot hover crumb on this page only
					{ label: "Lainnya", dropdown: [{ label: "Lainnya", to: "/users" }] },
					{ label: "Pengelola", to: "/users" },
					{ label: "Semua", to: "/users" },
					{ label: "Detail" },
				]}
			/>

			{initial ? (
				<UserForm
					key={`${userId}-${reloadKey}`}
					mode="edit"
					initial={initial}
					onSubmit={save.submit}
					submitting={save.submitting}
				/>
			) : null}
		</>
	)
}

export default UserEditPage
