import { useMutation, useQuery, useQueryClient, type UseMutationResult, type UseQueryResult } from "@tanstack/react-query"

import type { SettingFormGroups, SettingFormItem, SettingFormPatch, SettingFormPatchResult } from "@roja/types"

import { legacyNotify } from "@/components/legacy/legacy-notify"
import { adminApi } from "@/lib/api"
import { legacyErrors } from "@/lib/legacy-errors"

export const settingFormKeys = {
	all: ["admin-setting-forms"] as const,
	groups: () => [...settingFormKeys.all, "groups"] as const,
}

export type SettingFormUpdateVariables = {
	id: number
	data: SettingFormPatch
	notifyDelay?: number
}

type UpdateContext = { previous: SettingFormGroups | undefined }

const notifyOptions = ({ notifyDelay }: SettingFormUpdateVariables): { delay: number } | undefined =>
	notifyDelay === undefined ? undefined : { delay: notifyDelay }

const mergeItem = (item: SettingFormItem, data: SettingFormPatch): SettingFormItem => ({
	...item,
	status: data.status ?? item.status,
	visibility: data.visibility ?? item.visibility,
	registrantRequired: data.registrantRequired ?? item.registrantRequired,
	adminRequired: data.adminRequired ?? item.adminRequired,
	customName: data.customName ?? item.customName,
	label: data.customName ?? item.label,
})

const replace = (items: SettingFormItem[], id: number, next: (item: SettingFormItem) => SettingFormItem): SettingFormItem[] =>
	items.map((item) => (item.id === id ? next(item) : item))

const withItem = (
	groups: SettingFormGroups,
	id: number,
	next: (item: SettingFormItem) => SettingFormItem,
): SettingFormGroups => ({
	...groups,
	personalDatas: replace(groups.personalDatas, id, next),
	previousSchools: replace(groups.previousSchools, id, next),
	identityNumbers: replace(groups.identityNumbers, id, next),
	healthDatas: replace(groups.healthDatas, id, next),
	achievments: replace(groups.achievments, id, next),
	religiousAchievments: replace(groups.religiousAchievments, id, next),
	gifts: replace(groups.gifts, id, next),
	familyDatas: replace(groups.familyDatas, id, next),
	familyAddress: replace(groups.familyAddress, id, next),
	guardianDatas: replace(groups.guardianDatas, id, next),
	guardianAddress: replace(groups.guardianAddress, id, next),
	attachments: replace(groups.attachments, id, next),
})

export const useSettingForms = (): UseQueryResult<SettingFormGroups> =>
	useQuery({ queryKey: settingFormKeys.groups(), queryFn: () => adminApi.getSettingForms() })

export const useUpdateSettingForm = (): UseMutationResult<
	SettingFormPatchResult,
	unknown,
	SettingFormUpdateVariables,
	UpdateContext
> => {
	const queryClient = useQueryClient()

	return useMutation<SettingFormPatchResult, unknown, SettingFormUpdateVariables, UpdateContext>({
		mutationFn: ({ id, data }) => adminApi.updateSettingForm(id, data),

		onMutate: async ({ id, data }) => {
			await queryClient.cancelQueries({ queryKey: settingFormKeys.groups() })
			const previous = queryClient.getQueryData<SettingFormGroups>(settingFormKeys.groups())
			if (previous) {
				queryClient.setQueryData(
					settingFormKeys.groups(),
					withItem(previous, id, (item) => mergeItem(item, data)),
				)
			}
			return { previous }
		},

		onSuccess: (result, variables) => {
			queryClient.setQueryData<SettingFormGroups>(settingFormKeys.groups(), (groups) =>
				groups === undefined ? groups : { ...withItem(groups, result.id, () => result.item), alphabet: result.alphabet },
			)
			legacyNotify.success(result.message, "Berhasil!", notifyOptions(variables))
		},

		onError: (error, variables, context) => {
			if (context?.previous) queryClient.setQueryData(settingFormKeys.groups(), context.previous)
			legacyNotify.error(legacyErrors(error), "Gagal!", notifyOptions(variables))
		},
	})
}
