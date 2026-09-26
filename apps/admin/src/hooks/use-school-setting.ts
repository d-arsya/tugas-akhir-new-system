import { useQueryClient, useQuery, type UseQueryResult } from "@tanstack/react-query"

import type { AdminMessageResult, AdminSchoolPayload, AdminSchoolSetting } from "@roja/types"

import { useLegacySubmit, type LegacySubmit } from "@/hooks/use-legacy-submit"
import { adminApi } from "@/lib/api"

export const schoolSettingKeys = {
	all: ["admin-school-setting"] as const,
	detail: () => [...schoolSettingKeys.all, "detail"] as const,
}

export const useSchoolSetting = (): UseQueryResult<AdminSchoolSetting> =>
	useQuery({ queryKey: schoolSettingKeys.detail(), queryFn: () => adminApi.getSchool() })

export const useRefetchSchoolSetting = (): (() => void) => {
	const queryClient = useQueryClient()
	return () => {
		void queryClient.invalidateQueries({ queryKey: schoolSettingKeys.all })
	}
}

export const useUpdateSchool = (onDone: () => void): LegacySubmit<AdminSchoolPayload, AdminMessageResult> =>
	useLegacySubmit({
		mutationFn: (payload: AdminSchoolPayload) => adminApi.updateSchool(payload),
		errorTitle: "Gagal!",
		onDone,
	})
