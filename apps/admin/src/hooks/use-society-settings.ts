import { useQuery, type UseQueryResult } from "@tanstack/react-query"

import type { SettingFormGroups, SettingFormItem } from "@roja/types"

import { settingFormKeys } from "@/hooks/use-setting-form"
import { adminApi } from "@/lib/api"

export const flattenSocietySettings = (groups: SettingFormGroups): SettingFormItem[] => {
	const byId = new Map<number, SettingFormItem>()
	const panes = [
		groups.personalDatas,
		groups.identityNumbers,
		groups.previousSchools,
		groups.healthDatas,
		groups.achievments,
		groups.religiousAchievments,
		groups.gifts,
		groups.familyDatas,
		groups.familyAddress,
		groups.guardianDatas,
		groups.guardianAddress,
		groups.attachments,
	]
	for (const pane of panes) for (const row of pane) byId.set(row.id, row)
	return [...byId.values()].sort((a, b) => a.id - b.id)
}

export const useSocietySettings = (): UseQueryResult<SettingFormItem[]> =>
	useQuery({
		queryKey: settingFormKeys.groups(),
		queryFn: () => adminApi.getSettingForms(),
		select: flattenSocietySettings,
		staleTime: 0,
	})
