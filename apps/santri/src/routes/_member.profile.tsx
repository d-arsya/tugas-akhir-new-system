import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

const ProfilePage = (): JSX.Element => {
	return (
		<div className="flex flex-col gap-4">
			<h1 className="text-2xl font-bold text-[var(--heading-txt-inverse)]">Profil Santri</h1>
			<p className="text-xs text-[var(--muted-txt-color)]">Informasi data diri santri.</p>
		</div>
	)
}

export const Route = createFileRoute("/_member/profile")({
	component: ProfilePage,
})

export default ProfilePage
