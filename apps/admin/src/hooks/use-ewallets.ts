import { useMutation, useQuery, useQueryClient, type UseMutationResult, type UseQueryResult } from "@tanstack/react-query"

import type {
	AdminMessageResult,
	EwalletActiveFilter,
	EwalletBadge,
	EwalletDetail,
	EwalletListQuery,
	EwalletListRow,
	EwalletOwnerType,
	EwalletQrPrint,
	EwalletQrPrintAllRow,
	EwalletSettingDto,
	EwalletSettingPage,
	EwalletWalletTransactionRow,
	EwalletWidget,
	ServerTableResult,
} from "@roja/types"

import { legacyNotify } from "@/components/legacy/legacy-notify"
import { adminApi } from "@/lib/api"
import { legacyErrors } from "@/lib/legacy-errors"
import useServerTable, { type UseServerTableResult } from "@/hooks/use-server-table"
import { useLegacySubmit, type LegacySubmit } from "@/hooks/use-legacy-submit"

// Legacy `EwalletController` — Akun Dompet, detail, setting and the QR print pages. Owned by WS D-A.

/**
 * Every Dompet query hangs off `all`, so a money write (D-B) or a status change (D-C) refreshes
 * whatever is on screen with one `invalidateQueries({ queryKey: ewalletKeys.all })`.
 */
export const ewalletKeys = {
	all: ["admin-ewallet"] as const,
	list: () => [...ewalletKeys.all, "list"] as const,
	widget: (filters: EwalletFilters) => [...ewalletKeys.all, "widget", filters] as const,
	badge: () => [...ewalletKeys.all, "badge"] as const,
	detail: (ewalletId: number) => [...ewalletKeys.all, "detail", ewalletId] as const,
	transactions: (ewalletId: number) => [...ewalletKeys.all, "transactions", ewalletId] as const,
	setting: (ewalletId: number) => [...ewalletKeys.all, "setting", ewalletId] as const,
	qr: (ewalletId: number) => [...ewalletKeys.all, "qr", ewalletId] as const,
	qrAll: () => [...ewalletKeys.all, "qr-all"] as const,
}

/** The two dropdowns of `#content-filter`; `""` is the placeholder option ("Status E-Wallet" / "Pengguna"). */
export type EwalletFilters = { status: EwalletActiveFilter | ""; member: EwalletOwnerType | "" }

export const NO_EWALLET_FILTERS: EwalletFilters = { status: "", member: "" }

/** Drops the empty placeholders, as `$request->ewallet == 'active'` does for a blank value. */
const activeFilters = (filters: EwalletFilters): { status?: EwalletActiveFilter; member?: EwalletOwnerType } => ({
	...(filters.status ? { status: filters.status } : {}),
	...(filters.member ? { member: filters.member } : {}),
})

/** `ewallet-student-serverside.js` — true server-side paging; the two filters ride on every draw. */
export const useEwalletTable = (filters: EwalletFilters): UseServerTableResult<EwalletListRow> =>
	useServerTable<EwalletListRow, { status?: EwalletActiveFilter; member?: EwalletOwnerType }>({
		queryKey: ewalletKeys.list(),
		fetcher: (query: EwalletListQuery): Promise<ServerTableResult<EwalletListRow>> => adminApi.getEwalletRows(query),
		extra: activeFilters(filters),
		staleTime: 0,
	})

/** `ewallet-widget-ajax.js` — refetched whenever either dropdown changes. */
export const useEwalletWidget = (filters: EwalletFilters): UseQueryResult<EwalletWidget> =>
	useQuery({
		queryKey: ewalletKeys.widget(filters),
		queryFn: () => adminApi.getEwalletWidget(activeFilters(filters)),
		staleTime: 0,
	})

/** The sidebar's red badge (`ViewServiceProvider`: `EwalletTransaction::process()->count()`). */
export const useEwalletBadge = (enabled = true): UseQueryResult<EwalletBadge> =>
	useQuery({
		queryKey: ewalletKeys.badge(),
		queryFn: () => adminApi.getEwalletBadge(),
		enabled,
		// Legacy counted on every page render; the santri and merchant portals move it without this browser knowing
		staleTime: 0,
		refetchInterval: 60_000,
	})

/** `@detail` — the one place the recomputed balance is shown. */
export const useEwalletDetail = (ewalletId: number): UseQueryResult<EwalletDetail> =>
	useQuery({ queryKey: ewalletKeys.detail(ewalletId), queryFn: () => adminApi.getEwalletDetail(ewalletId), staleTime: 0 })

/** `@transactionList` — a client-side table in the port, as `DataTables::collection` was in legacy. */
export const useEwalletTransactions = (ewalletId: number): UseQueryResult<EwalletWalletTransactionRow[]> =>
	useQuery({
		queryKey: ewalletKeys.transactions(ewalletId),
		queryFn: () => adminApi.getEwalletTransactions(ewalletId),
		staleTime: 0,
	})

export const useEwalletSetting = (ewalletId: number): UseQueryResult<EwalletSettingPage> =>
	useQuery({ queryKey: ewalletKeys.setting(ewalletId), queryFn: () => adminApi.getEwalletSetting(ewalletId) })

/**
 * `setting.js` `submitAjax`: the notice, then `location.reload()` 1000 ms later — here a refetch of
 * everything the wallet shows.
 */
export const useUpdateEwalletSetting = (ewalletId: number): LegacySubmit<EwalletSettingDto, AdminMessageResult> => {
	const queryClient = useQueryClient()
	return useLegacySubmit<EwalletSettingDto, AdminMessageResult>({
		mutationFn: (data) => adminApi.updateEwalletSetting(ewalletId, data),
		onDone: () => void queryClient.invalidateQueries({ queryKey: ewalletKeys.all }),
	})
}

/**
 * `#tbr_email_form` → `submitAjax`: the notice, then a reload of the setting page 1000 ms later —
 * on failure too, because the controller answers every failure with `redirect` back to it (that is
 * how the throttle alert appears). D-B owns the endpoint; the page and its form are D-A's.
 */
export const useSendEwalletResetEmail = (ewalletId: number): UseMutationResult<AdminMessageResult, unknown, void> => {
	const queryClient = useQueryClient()
	const reload = (): void => {
		window.setTimeout(() => void queryClient.invalidateQueries({ queryKey: ewalletKeys.setting(ewalletId) }), 1000)
	}
	return useMutation({
		mutationFn: () => adminApi.sendEwalletResetPinEmail(ewalletId),
		onSuccess: (data) => {
			legacyNotify.success(data.message)
			reload()
		},
		onError: (error) => {
			legacyNotify.error(legacyErrors(error))
			reload()
		},
	})
}

export const useEwalletQrPrint = (ewalletId: number): UseQueryResult<EwalletQrPrint> =>
	useQuery({ queryKey: ewalletKeys.qr(ewalletId), queryFn: () => adminApi.getEwalletQrPrint(ewalletId) })

export const useEwalletQrPrintAll = (): UseQueryResult<EwalletQrPrintAllRow[]> =>
	useQuery({ queryKey: ewalletKeys.qrAll(), queryFn: () => adminApi.getEwalletQrPrintAll() })
