import { useMutation, useQuery, useQueryClient, type UseMutationResult, type UseQueryResult } from "@tanstack/react-query"

import type { AdminMessageResult, EwalletAmountDto, EwalletMoneyResult, EwalletPendingWithdraw } from "@roja/types"

import { ewalletKeys } from "@/hooks/use-ewallets"
import { adminApi } from "@/lib/api"
import { unmaskRupiah } from "@/lib/legacy-currency"

export const ewalletMoneyKeys = {
	all: ["admin-ewallet-money"] as const,
	pending: (ewalletId: number) => [...ewalletMoneyKeys.all, "pending", ewalletId] as const,
}

// An empty field is sent without `amount` so the server answers with its own "required" message
const amountBody = (masked: string): EwalletAmountDto => (masked === "" ? ({} as EwalletAmountDto) : { amount: unmaskRupiah(masked) })

export const useEwalletTopUp = (ewalletId: number): UseMutationResult<EwalletMoneyResult, unknown, string> =>
	useMutation({ mutationFn: (masked: string) => adminApi.topUpEwallet(ewalletId, amountBody(masked)) })

export const useEwalletParkWithdraw = (ewalletId: number): UseMutationResult<EwalletMoneyResult, unknown, string> =>
	useMutation({ mutationFn: (masked: string) => adminApi.parkEwalletWithdraw(ewalletId, amountBody(masked)) })

export const useEwalletPendingWithdraw = (ewalletId: number): UseQueryResult<EwalletPendingWithdraw | null> =>
	useQuery({
		queryKey: ewalletMoneyKeys.pending(ewalletId),
		queryFn: () => adminApi.getEwalletPendingWithdraw(ewalletId),
		staleTime: 0,
		gcTime: 0,
		retry: false,
	})

export const useEwalletVerifyPin = (ewalletId: number): UseMutationResult<EwalletMoneyResult, unknown, string> =>
	useMutation({ mutationFn: (pin: string) => adminApi.verifyEwalletWithdrawPin(ewalletId, { pin }) })

export const useEwalletWithdraw = (ewalletId: number): UseMutationResult<EwalletMoneyResult, unknown, void> =>
	useMutation({ mutationFn: () => adminApi.withdrawEwallet(ewalletId) })

export const useEwalletResetPin = (ewalletId: number): UseMutationResult<AdminMessageResult, unknown, string> =>
	useMutation({ mutationFn: (pin: string) => adminApi.resetEwalletPin(ewalletId, { pin }) })

export const useRefreshEwallets = (): (() => Promise<void>) => {
	const queryClient = useQueryClient()
	return () => queryClient.invalidateQueries({ queryKey: ewalletKeys.all })
}
