import { useMutation, useQuery, useQueryClient, type UseMutationResult, type UseQueryResult } from "@tanstack/react-query"

import type { AdminRedirectResult, MerchantDetail, MerchantPayload, MerchantRow } from "@roja/types"

import { adminApi } from "@/lib/api"

export const merchantKeys = {
	all: ["admin-merchants"] as const,
	list: () => [...merchantKeys.all, "list"] as const,
	detail: (id: number) => [...merchantKeys.all, "detail", id] as const,
	nextNumber: () => [...merchantKeys.all, "next-number"] as const,
}

export const useMerchants = (): UseQueryResult<MerchantRow[]> =>
	useQuery({ queryKey: merchantKeys.list(), queryFn: () => adminApi.getMerchantRows() })

export const useMerchant = (id: number): UseQueryResult<MerchantDetail> =>
	useQuery({
		queryKey: merchantKeys.detail(id),
		queryFn: () => adminApi.getMerchant(id),
		enabled: Number.isFinite(id),
	})

export const useMerchantNextNumber = (): UseQueryResult<{ uniqueNumber: string }> =>
	useQuery({ queryKey: merchantKeys.nextNumber(), queryFn: () => adminApi.getMerchantNextNumber() })

export const useCreateMerchant = (): UseMutationResult<AdminRedirectResult, Error, MerchantPayload> => {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: (payload: MerchantPayload) => adminApi.createMerchant(payload),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: merchantKeys.all }),
	})
}

export const useUpdateMerchant = (id: number): UseMutationResult<AdminRedirectResult, Error, MerchantPayload> => {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: (payload: MerchantPayload) => adminApi.updateMerchant(id, payload),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: merchantKeys.all }),
	})
}
