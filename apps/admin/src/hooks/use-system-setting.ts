import { useMutation, useQuery, useQueryClient, type UseMutationResult, type UseQueryResult } from "@tanstack/react-query"

import type { SystemSetting } from "@roja/types"

import { legacyNotify } from "@/components/legacy/legacy-notify"
import { adminApi } from "@/lib/api"
import { saveBlob } from "@/lib/download"
import { legacyErrors } from "@/lib/legacy-errors"

// Legacy Lainnya > Pengaturan > Sistem (`SettingController`), the single `settings` row
export const systemSettingKeys = {
	all: ["admin-system-setting"] as const,
	detail: () => [...systemSettingKeys.all, "detail"] as const,
}

export const useSystemSetting = (): UseQueryResult<SystemSetting> =>
	useQuery({ queryKey: systemSettingKeys.detail(), queryFn: () => adminApi.getSystemSetting() })

/** Legacy reloads the page after each save; the port refetches the row and keeps the open tab. */
export const useRefetchSystemSetting = (): (() => void) => {
	const queryClient = useQueryClient()
	return () => {
		void queryClient.invalidateQueries({ queryKey: systemSettingKeys.all })
	}
}

// `a[href=setting.downloadDB]` — a plain link in legacy, an authenticated fetch + save here
export const useDownloadDatabase = (): UseMutationResult<void, unknown, void> =>
	useMutation<void, unknown, void>({
		mutationFn: async () => {
			const { blob, fileName } = await adminApi.downloadDatabase()
			saveBlob(blob, fileName ?? "database-backup.txt")
		},
		onError: (error) => legacyNotify.error(legacyErrors(error)),
	})
