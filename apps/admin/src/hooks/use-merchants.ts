import { useMutation, useQuery, useQueryClient, type UseMutationResult, type UseQueryResult } from "@tanstack/react-query"

import type { AdminRedirectResult, MerchantDetail, MerchantPayload, MerchantRow } from "@roja/types"

import { adminApi } from "@/lib/api"

// Legacy Merchant pages (merchant.list / create / edit / store / update)
export const merchantKeys = {
	all: ["admin-merchants"] as const,
	list: () => [...merchantKeys.all, "list"] as const,
	detail: (id: number) => [...merchantKeys.all, "detail", id] as const,
	/** `generateUniqueNumber()` — the disabled "Nomor Merchant" field on the create form */
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

/**
 * The number is only ever displayed: the field is `disabled`, so it is never submitted and the
 * server regenerates it on store. Refetching it on mount matches legacy, which recomputed it in
 * `create()` on every page load.
 */
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
