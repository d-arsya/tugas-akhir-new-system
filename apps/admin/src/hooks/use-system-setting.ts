import { useMutation, useQuery, useQueryClient, type UseMutationResult, type UseQueryResult } from "@tanstack/react-query"

import type { AdminMessageResult, SmtpPayload, SystemSetting } from "@roja/types"

import { legacyNotify } from "@/components/legacy/legacy-notify"
import { useLegacySubmit, type LegacySubmit } from "@/hooks/use-legacy-submit"
import { adminApi } from "@/lib/api"
import { saveBlob } from "@/lib/download"
import { legacyErrors } from "@/lib/legacy-errors"

export const systemSettingKeys = {
	all: ["admin-system-setting"] as const,
	detail: () => [...systemSettingKeys.all, "detail"] as const,
}

export const useSystemSetting = (): UseQueryResult<SystemSetting> =>
	useQuery({ queryKey: systemSettingKeys.detail(), queryFn: () => adminApi.getSystemSetting() })

export const useRefetchSystemSetting = (): (() => void) => {
	const queryClient = useQueryClient()
	return () => {
		void queryClient.invalidateQueries({ queryKey: systemSettingKeys.all })
	}
}

export const useUpdateBackupFrequency = (onDone: () => void): LegacySubmit<number, AdminMessageResult> =>
	useLegacySubmit({ mutationFn: (backupFrequency: number) => adminApi.updateBackupFrequency(backupFrequency), onDone })

export const useUpdateSmtp = (onDone: () => void): LegacySubmit<SmtpPayload, AdminMessageResult> =>
	useLegacySubmit({ mutationFn: (payload: SmtpPayload) => adminApi.updateSmtp(payload), onDone })

export const useUpdateTwoFactor = (onDone: () => void): LegacySubmit<boolean, AdminMessageResult> =>
	useLegacySubmit({ mutationFn: (enabled2fa: boolean) => adminApi.updateTwoFactor(enabled2fa), onDone })

export const useDownloadDatabase = (): UseMutationResult<void, unknown, void> =>
	useMutation<void, unknown, void>({
		mutationFn: async () => {
			const { blob, fileName } = await adminApi.downloadDatabase()
			saveBlob(blob, fileName ?? "database-backup.txt")
		},
		onError: (error) => legacyNotify.error(legacyErrors(error)),
	})
