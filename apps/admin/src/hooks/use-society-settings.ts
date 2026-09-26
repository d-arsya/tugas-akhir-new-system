import { useQuery, type UseQueryResult } from "@tanstack/react-query"

import type { SettingFormGroups, SettingFormItem } from "@roja/types"

import { settingFormKeys } from "@/hooks/use-setting-form"
import { adminApi } from "@/lib/api"

/**
 * Every `tbr_setting_forms` row, flat and sorted by id — what legacy hands the society blades as
 * `$setting_forms` (`SettingForm::orderBy('id')->get()`). The API groups them for the Pengaturan
 * page; the union of the panes covers ids 1–69 (a row sits in exactly one pane).
 */
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

/**
 * The setting forms for `SocietyFormSection` (`settings` prop). Shares the Pengaturan query key, so
 * a toggle there is reflected here; read fresh on every mount like the legacy page load.
 */
export const useSocietySettings = (): UseQueryResult<SettingFormItem[]> =>
	useQuery({
		queryKey: settingFormKeys.groups(),
		queryFn: () => adminApi.getSettingForms(),
		select: flattenSocietySettings,
		staleTime: 0,
	})
