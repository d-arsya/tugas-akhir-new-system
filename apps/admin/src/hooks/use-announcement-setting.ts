import { useQueryClient, useQuery, type UseQueryResult } from "@tanstack/react-query"

import type { AdminMessageResult, SettingAnnouncement, SettingAnnouncementPayload } from "@roja/types"

import { useLegacySubmit, type LegacySubmit } from "@/hooks/use-legacy-submit"
import { adminApi } from "@/lib/api"

export const announcementSettingKeys = {
	all: ["admin-announcement-setting"] as const,
	detail: () => [...announcementSettingKeys.all, "detail"] as const,
}

export const useAnnouncementSetting = (): UseQueryResult<SettingAnnouncement> =>
	useQuery({ queryKey: announcementSettingKeys.detail(), queryFn: () => adminApi.getAnnouncement() })

export const useRefetchAnnouncementSetting = (): (() => void) => {
	const queryClient = useQueryClient()
	return () => {
		void queryClient.invalidateQueries({ queryKey: announcementSettingKeys.all })
	}
}

export const useUpdateAnnouncement = (onDone: () => void): LegacySubmit<SettingAnnouncementPayload, AdminMessageResult> =>
	useLegacySubmit({
		mutationFn: (payload: SettingAnnouncementPayload) => adminApi.updateAnnouncement(payload),
		onDone,
	})
