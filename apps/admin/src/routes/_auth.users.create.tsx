import type { JSX } from "react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"

import type { AdminUserPayload } from "@roja/types"

import AdminPageTitle from "@/components/layout/admin-page-title"
import UserForm, { EMPTY_USER_FORM } from "@/components/users/user-form"
import { useLegacySubmit } from "@/hooks/use-legacy-submit"
import { useCreateUser } from "@/hooks/use-users"

// WS-A: legacy user/create.blade.php + default-ajax.js
export const Route = createFileRoute("/_auth/users/create")({
	component: UserCreatePage,
})

function UserCreatePage(): JSX.Element {
	const navigate = useNavigate()
	const createUser = useCreateUser()

	// `data-redirect="{{ route('user.index') }}"`: the notice first, the redirect 1000 ms later
	const save = useLegacySubmit({
		mutationFn: (payload: AdminUserPayload) => createUser.mutateAsync(payload),
		onDone: () => void navigate({ to: "/users" }),
	})

	return (
		<>
			<AdminPageTitle
				title="Tambah Pengelola"
				breadcrumbs={[{ label: "Lainnya", to: "/users" }, { label: "Pengelola", to: "/users" }, { label: "Tambah" }]}
			/>

			<UserForm mode="create" initial={EMPTY_USER_FORM} onSubmit={save.submit} submitting={save.submitting} />
		</>
	)
}

export default UserCreatePage
