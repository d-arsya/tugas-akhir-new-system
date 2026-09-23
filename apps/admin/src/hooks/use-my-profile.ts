import { useQueryClient, useQuery, type UseQueryResult } from "@tanstack/react-query"

import type { MyProfile } from "@roja/types"

import { adminApi } from "@/lib/api"

// Legacy Lainnya > Pengaturan > Profil Saya (`MyprofileController`), the logged-in admin's own row
export const myProfileKeys = {
	all: ["admin-my-profile"] as const,
	detail: () => [...myProfileKeys.all, "detail"] as const,
}

export const useMyProfile = (): UseQueryResult<MyProfile> =>
	useQuery({ queryKey: myProfileKeys.detail(), queryFn: () => adminApi.getMyProfile() })

/** Legacy reloads the page after saving; the port refetches the row instead. */
export const useRefetchMyProfile = (): (() => void) => {
	const queryClient = useQueryClient()
	return () => {
		void queryClient.invalidateQueries({ queryKey: myProfileKeys.all })
	}
}
