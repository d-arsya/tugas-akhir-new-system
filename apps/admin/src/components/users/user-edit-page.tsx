import { useState, type JSX } from "react"

import type { AdminUserDetail, AdminUserPayload } from "@roja/types"

import AdminPageTitle from "@/components/layout/admin-page-title"
import { useLegacySubmit } from "@/hooks/use-legacy-submit"
import { useUpdateUser, useUser } from "@/hooks/use-users"

import UserForm, { type UserFormValues } from "./user-form"

type UserEditPageProps = { userId: string }

const toFormValues = (user: AdminUserDetail): UserFormValues => ({
	name: user.name ?? "",
	gender: user.gender ?? "male",
	role: user.role ?? "",
	email: user.email ?? "",
	isBlocked: user.isBlocked,
})

const UserEditPage = ({ userId }: UserEditPageProps): JSX.Element => {
	const id = Number(userId)
	const { data: user } = useUser(id)
	const updateUser = useUpdateUser(id)
	const [reloadKey, setReloadKey] = useState(0)

	const save = useLegacySubmit({
		mutationFn: (payload: AdminUserPayload) => updateUser.mutateAsync(payload),
		onDone: () => setReloadKey((key) => key + 1),
	})

	return (
		<>
			<AdminPageTitle
				title="Detail Pengelola"
				breadcrumbs={[
					{ label: "Lainnya", dropdown: [{ label: "Lainnya", to: "/users" }] },
					{ label: "Pengelola", to: "/users" },
					{ label: "Semua", to: "/users" },
					{ label: "Detail" },
				]}
			/>

			{user ? (
				<UserForm
					key={`${userId}-${reloadKey}`}
					mode="edit"
					initial={toFormValues(user)}
					onSubmit={save.submit}
					submitting={save.submitting}
				/>
			) : null}
		</>
	)
}

export default UserEditPage
