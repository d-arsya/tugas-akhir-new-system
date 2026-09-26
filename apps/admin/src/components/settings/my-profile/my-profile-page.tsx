import type { JSX } from "react"

import AdminPageTitle from "@/components/layout/admin-page-title"
import LegacyCard from "@/components/legacy/legacy-card"
import { useMyProfile, useRefetchMyProfile } from "@/hooks/use-my-profile"
import useAuthStore from "@/stores/auth.store"

import MyProfileForm from "./my-profile-form"

const MyProfilePage = (): JSX.Element => {
	const { data: profile } = useMyProfile()
	const refetch = useRefetchMyProfile()

	const onSaved = (name: string): void => {
		const { user, login } = useAuthStore.getState()
		if (user) login({ ...user, name })
		refetch()
	}

	return (
		<>
			<AdminPageTitle title="Profil Saya" breadcrumbs={[{ label: "Lainnya" }, { label: "Pengaturan" }, { label: "Profil Saya" }]} />

			<div className="mx-[-15px] flex flex-wrap justify-center">
				<div className="relative w-full max-w-full flex-[0_0_100%] px-[15px] min-[992px]:max-w-[83.333333%] min-[992px]:flex-[0_0_83.333333%] min-[1200px]:max-w-[75%] min-[1200px]:flex-[0_0_75%]">
					<LegacyCard bodyClassName="p-[24px] min-[992px]:px-[48px]">
						<MyProfileForm profile={profile} onSaved={onSaved} />
					</LegacyCard>
				</div>
			</div>
		</>
	)
}

export default MyProfilePage
