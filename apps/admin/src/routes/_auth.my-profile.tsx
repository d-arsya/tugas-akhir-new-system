import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

import AdminPageTitle from "@/components/layout/admin-page-title"
import LegacyCard from "@/components/legacy/legacy-card"
import MyProfileForm from "@/components/settings/my-profile/my-profile-form"
import { useMyProfile, useRefetchMyProfile } from "@/hooks/use-my-profile"
import useAuthStore from "@/stores/auth.store"

// WS-B: legacy setting/my-profile.blade.php + password-meter.js
export const Route = createFileRoute("/_auth/my-profile")({
	component: MyProfilePage,
})

function MyProfilePage(): JSX.Element {
	const { data: profile } = useMyProfile()
	const refetch = useRefetchMyProfile()

	// Legacy reloads the page, which redraws the header with the new name
	const onSaved = (name: string): void => {
		const { user, login } = useAuthStore.getState()
		if (user) login({ ...user, name })
		refetch()
	}

	return (
		<>
			<AdminPageTitle title="Profil Saya" breadcrumbs={[{ label: "Lainnya" }, { label: "Pengaturan" }, { label: "Profil Saya" }]} />

			{/* `.row.justify-content-center > .col-xl-9.col-lg-10.col-md-12.col-sm-12.col-12` */}
			<div className="mx-[-15px] flex flex-wrap justify-center">
				<div className="relative w-full max-w-full flex-[0_0_100%] px-[15px] min-[992px]:max-w-[83.333333%] min-[992px]:flex-[0_0_83.333333%] min-[1200px]:max-w-[75%] min-[1200px]:flex-[0_0_75%]">
					{/* `.card-body.p-4.px-lg-5` */}
					<LegacyCard bodyClassName="p-[24px] min-[992px]:px-[48px]">
						<MyProfileForm profile={profile} onSaved={onSaved} />
					</LegacyCard>
				</div>
			</div>
		</>
	)
}

export default MyProfilePage
