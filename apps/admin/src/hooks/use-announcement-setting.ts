import { useQueryClient, useQuery, type UseQueryResult } from "@tanstack/react-query"

import type { SettingAnnouncement } from "@roja/types"

import { adminApi } from "@/lib/api"

// Legacy Lainnya > Pengaturan > Pengumuman PSB (`SettingAnncsController`), the single `setting_anncs` row
export const announcementSettingKeys = {
	all: ["admin-announcement-setting"] as const,
	detail: () => [...announcementSettingKeys.all, "detail"] as const,
}

export const useAnnouncementSetting = (): UseQueryResult<SettingAnnouncement> =>
	useQuery({ queryKey: announcementSettingKeys.detail(), queryFn: () => adminApi.getAnnouncement() })

/** `setting/annc-ajax.js` reloads the page 1000 ms after saving; the port refetches the row. */
export const useRefetchAnnouncementSetting = (): (() => void) => {
	const queryClient = useQueryClient()
	return () => {
		void queryClient.invalidateQueries({ queryKey: announcementSettingKeys.all })
	}
}
