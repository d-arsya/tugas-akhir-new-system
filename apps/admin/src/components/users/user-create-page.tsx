import type { JSX } from "react"
import { useNavigate } from "@tanstack/react-router"

import type { AdminUserPayload } from "@roja/types"

import AdminPageTitle from "@/components/layout/admin-page-title"
import { useLegacySubmit } from "@/hooks/use-legacy-submit"
import { useCreateUser } from "@/hooks/use-users"

import UserForm, { EMPTY_USER_FORM } from "./user-form"

const UserCreatePage = (): JSX.Element => {
	const navigate = useNavigate()
	const createUser = useCreateUser()

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
