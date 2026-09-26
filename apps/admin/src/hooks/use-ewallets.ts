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
import { saveBlob } from "@/lib/download"
import { legacyErrors, SYSTEM_ERROR } from "@/lib/legacy-errors"
import useServerTable, { type UseServerTableResult } from "@/hooks/use-server-table"
import { useLegacySubmit, type LegacySubmit } from "@/hooks/use-legacy-submit"

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

export type EwalletFilters = { status: EwalletActiveFilter | ""; member: EwalletOwnerType | "" }

export const NO_EWALLET_FILTERS: EwalletFilters = { status: "", member: "" }

type ActiveEwalletFilters = { status?: EwalletActiveFilter; member?: EwalletOwnerType }

const activeFilters = (filters: EwalletFilters): ActiveEwalletFilters => ({
	...(filters.status ? { status: filters.status } : {}),
	...(filters.member ? { member: filters.member } : {}),
})

export const useEwalletTable = (filters: EwalletFilters): UseServerTableResult<EwalletListRow> =>
	useServerTable<EwalletListRow, ActiveEwalletFilters>({
		queryKey: ewalletKeys.list(),
		fetcher: (query: EwalletListQuery): Promise<ServerTableResult<EwalletListRow>> => adminApi.getEwalletRows(query),
		extra: activeFilters(filters),
		staleTime: 0,
	})

export const useEwalletWidget = (filters: EwalletFilters): UseQueryResult<EwalletWidget> =>
	useQuery({
		queryKey: ewalletKeys.widget(filters),
		queryFn: () => adminApi.getEwalletWidget(activeFilters(filters)),
		staleTime: 0,
	})

export const useEwalletBadge = (enabled = true): UseQueryResult<EwalletBadge> =>
	useQuery({
		queryKey: ewalletKeys.badge(),
		queryFn: () => adminApi.getEwalletBadge(),
		enabled,
		staleTime: 0,
		refetchInterval: 60_000,
	})

export const useEwalletDetail = (ewalletId: number): UseQueryResult<EwalletDetail> =>
	useQuery({ queryKey: ewalletKeys.detail(ewalletId), queryFn: () => adminApi.getEwalletDetail(ewalletId), staleTime: 0 })

export const useEwalletTransactions = (ewalletId: number): UseQueryResult<EwalletWalletTransactionRow[]> =>
	useQuery({
		queryKey: ewalletKeys.transactions(ewalletId),
		queryFn: () => adminApi.getEwalletTransactions(ewalletId),
		staleTime: 0,
	})

export const useEwalletSetting = (ewalletId: number): UseQueryResult<EwalletSettingPage> =>
	useQuery({ queryKey: ewalletKeys.setting(ewalletId), queryFn: () => adminApi.getEwalletSetting(ewalletId) })

export const useUpdateEwalletSetting = (ewalletId: number): LegacySubmit<EwalletSettingDto, AdminMessageResult> => {
	const queryClient = useQueryClient()
	return useLegacySubmit<EwalletSettingDto, AdminMessageResult>({
		mutationFn: (data) => adminApi.updateEwalletSetting(ewalletId, data),
		onDone: () => void queryClient.invalidateQueries({ queryKey: ewalletKeys.all }),
	})
}

export const useDownloadEwalletBalanceReport = (): UseMutationResult<void, unknown, EwalletFilters> =>
	useMutation<void, unknown, EwalletFilters>({
		mutationFn: async (filters) => {
			const { blob, fileName } = await adminApi.downloadEwalletBalanceReport(activeFilters(filters))
			saveBlob(blob, fileName ?? "Laporan Saldo Akhir.xlsx")
		},
		onError: () => legacyNotify.error(SYSTEM_ERROR),
	})

export const useSendEwalletResetEmail = (ewalletId: number): UseMutationResult<AdminMessageResult, unknown, void> => {
	const queryClient = useQueryClient()
	// Reloads after a failure too: the reloaded page is what shows the throttle alert
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
