import { useQueryClient, useQuery, type UseQueryResult } from "@tanstack/react-query"

import type { AdminMessageResult, MyProfile, MyProfilePayload } from "@roja/types"

import { useLegacySubmit, type LegacySubmit } from "@/hooks/use-legacy-submit"
import { adminApi } from "@/lib/api"

export const myProfileKeys = {
	all: ["admin-my-profile"] as const,
	detail: () => [...myProfileKeys.all, "detail"] as const,
}

export const useMyProfile = (): UseQueryResult<MyProfile> =>
	useQuery({ queryKey: myProfileKeys.detail(), queryFn: () => adminApi.getMyProfile() })

export const useRefetchMyProfile = (): (() => void) => {
	const queryClient = useQueryClient()
	return () => {
		void queryClient.invalidateQueries({ queryKey: myProfileKeys.all })
	}
}

export const useUpdateMyProfile = (onDone: () => void): LegacySubmit<MyProfilePayload, AdminMessageResult> =>
	useLegacySubmit({
		mutationFn: (payload: MyProfilePayload) => adminApi.updateMyProfile(payload),
		onDone,
	})
