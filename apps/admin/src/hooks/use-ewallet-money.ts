import { useMutation, useQuery, useQueryClient, type UseMutationResult, type UseQueryResult } from "@tanstack/react-query"

import type { AdminMessageResult, EwalletAmountDto, EwalletMoneyResult, EwalletPendingWithdraw } from "@roja/types"

import { ewalletKeys } from "@/hooks/use-ewallets"
import { adminApi } from "@/lib/api"
import { unmaskRupiah } from "@/lib/legacy-currency"

// Cash top-up, the three-step withdraw and the PIN reset (legacy EwalletController@topUp,
// @validatePinConfirm, @validatePin, @withdraw, @resetPin).
export const ewalletMoneyKeys = {
	all: ["admin-ewallet-money"] as const,
	pending: (ewalletId: number) => [...ewalletMoneyKeys.all, "pending", ewalletId] as const,
}

/**
 * The masked field text → the request body. An empty field is sent without `amount`, so the server
 * answers "Kolom nominal wajib untuk diisi." exactly as legacy did for an empty input; anything else
 * is a real number.
 */
const amountBody = (masked: string): EwalletAmountDto => (masked === "" ? ({} as EwalletAmountDto) : { amount: unmaskRupiah(masked) })

export const useEwalletTopUp = (ewalletId: number): UseMutationResult<EwalletMoneyResult, unknown, string> =>
	useMutation({ mutationFn: (masked: string) => adminApi.topUpEwallet(ewalletId, amountBody(masked)) })

/** Legacy @validatePinConfirm: parks the amount, the answer's `redirect` is the PIN page. */
export const useEwalletParkWithdraw = (ewalletId: number): UseMutationResult<EwalletMoneyResult, unknown, string> =>
	useMutation({ mutationFn: (masked: string) => adminApi.parkEwalletWithdraw(ewalletId, amountBody(masked)) })

/** The PIN page bounces to the detail page when nothing is parked (`null`). */
export const useEwalletPendingWithdraw = (ewalletId: number): UseQueryResult<EwalletPendingWithdraw | null> =>
	useQuery({
		queryKey: ewalletMoneyKeys.pending(ewalletId),
		queryFn: () => adminApi.getEwalletPendingWithdraw(ewalletId),
		// A parked amount is server state that moves without the page: always ask again
		staleTime: 0,
		gcTime: 0,
		retry: false,
	})

export const useEwalletVerifyPin = (ewalletId: number): UseMutationResult<EwalletMoneyResult, unknown, string> =>
	useMutation({ mutationFn: (pin: string) => adminApi.verifyEwalletWithdrawPin(ewalletId, { pin }) })

/** Takes no body: it withdraws exactly the amount parked and PIN-verified on the server. */
export const useEwalletWithdraw = (ewalletId: number): UseMutationResult<EwalletMoneyResult, unknown, void> =>
	useMutation({ mutationFn: () => adminApi.withdrawEwallet(ewalletId) })

export const useEwalletResetPin = (ewalletId: number): UseMutationResult<AdminMessageResult, unknown, string> =>
	useMutation({ mutationFn: (pin: string) => adminApi.resetEwalletPin(ewalletId, { pin }) })

/** Legacy answers with `window.location = redirect` (a reload); here the cached wallet pages are refetched instead. */
export const useRefreshEwallets = (): (() => Promise<void>) => {
	const queryClient = useQueryClient()
	return () => queryClient.invalidateQueries({ queryKey: ewalletKeys.all })
}
