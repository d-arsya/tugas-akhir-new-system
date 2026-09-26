import { useMutation, useQuery, useQueryClient, type QueryClient, type UseMutationResult, type UseQueryResult } from "@tanstack/react-query"

import type {
	AccountancyDelegatePayload,
	AccountancyDeleteStep,
	AccountancyDeleteTarget,
	AccountancyDetail,
	AccountancyOption,
	AccountancyPayload,
	AccountancyRow,
	AdminMessageResult,
} from "@roja/types"

import { useLegacyDeletePage, type LegacyDeletePageSubmit } from "@/hooks/use-legacy-delete-page"
import { adminApi } from "@/lib/api"

export const accountancyKeys = {
	all: ["admin-accountancies"] as const,
	list: () => [...accountancyKeys.all, "list"] as const,
	options: () => [...accountancyKeys.all, "options"] as const,
	detail: (id: number) => [...accountancyKeys.all, "detail", id] as const,
	deleteStep: (id: number, step: AccountancyDeleteTarget) => [...accountancyKeys.all, "delete-step", id, step] as const,
}

const markStale = (queryClient: QueryClient): Promise<void> =>
	queryClient.invalidateQueries({ queryKey: accountancyKeys.all, refetchType: "none" })

export const useAccountancies = (): UseQueryResult<AccountancyRow[]> =>
	useQuery({ queryKey: accountancyKeys.list(), queryFn: () => adminApi.getAccountancyRows() })

export const useAccountancyOptions = (): UseQueryResult<AccountancyOption[]> =>
	useQuery({ queryKey: accountancyKeys.options(), queryFn: () => adminApi.getAccountancyOptions() })

export const useAccountancy = (id: number): UseQueryResult<AccountancyDetail> =>
	useQuery({
		queryKey: accountancyKeys.detail(id),
		queryFn: () => adminApi.getAccountancy(id),
		enabled: Number.isFinite(id),
	})

export const useAccountancyDeleteStep = (id: number, step: AccountancyDeleteTarget): UseQueryResult<AccountancyDeleteStep> =>
	useQuery({
		queryKey: accountancyKeys.deleteStep(id, step),
		queryFn: () => adminApi.getAccountancyDeleteStep(id, step),
		enabled: Number.isFinite(id),
		staleTime: 0,
		retry: false,
	})

export const useCreateAccountancy = (): UseMutationResult<AdminMessageResult, Error, AccountancyPayload> => {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: (payload: AccountancyPayload) => adminApi.createAccountancy(payload),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: accountancyKeys.all }),
	})
}

export const useUpdateAccountancy = (id: number): UseMutationResult<AdminMessageResult, Error, AccountancyPayload> => {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: (payload: AccountancyPayload) => adminApi.updateAccountancy(id, payload),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: accountancyKeys.all }),
	})
}

export const useDeleteAccountancy = (id: number): LegacyDeletePageSubmit<void> => {
	const queryClient = useQueryClient()
	return useLegacyDeletePage<void>({
		mutationFn: async () => {
			const result = await adminApi.deleteAccountancy(id)
			await markStale(queryClient)
			return result
		},
	})
}

export const useDelegateAccountancyChild = (id: number): LegacyDeletePageSubmit<AccountancyDelegatePayload> => {
	const queryClient = useQueryClient()
	return useLegacyDeletePage<AccountancyDelegatePayload>({
		mutationFn: async (payload: AccountancyDelegatePayload) => {
			const result = await adminApi.delegateAccountancyChild(id, payload)
			await markStale(queryClient)
			return result
		},
	})
}
