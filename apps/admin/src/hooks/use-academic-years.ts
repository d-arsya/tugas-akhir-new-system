import { useMutation, useQuery, useQueryClient, type UseMutationResult, type UseQueryResult } from "@tanstack/react-query"

import type {
	AcademicYearDetail,
	AcademicYearPayload,
	AcademicYearQuotaRow,
	AcademicYearRow,
	AdminMessageResult,
} from "@roja/types"

import { adminApi } from "@/lib/api"

// Legacy Tahun Ajaran pages (academic-year.list / levelList / editLevelList / edit / store / update)
export const academicYearKeys = {
	all: ["admin-academic-years"] as const,
	list: () => [...academicYearKeys.all, "list"] as const,
	detail: (id: number) => [...academicYearKeys.all, "detail", id] as const,
	/** `academic-year.levelList` — the create page's quota table, which has no year context */
	quotaRows: () => [...academicYearKeys.all, "quota"] as const,
	quotaRowsFor: (id: number) => [...academicYearKeys.all, "quota", id] as const,
}

export const useAcademicYears = (): UseQueryResult<AcademicYearRow[]> =>
	useQuery({ queryKey: academicYearKeys.list(), queryFn: () => adminApi.getAcademicYearRows() })

export const useAcademicYear = (id: number): UseQueryResult<AcademicYearDetail> =>
	useQuery({
		queryKey: academicYearKeys.detail(id),
		queryFn: () => adminApi.getAcademicYear(id),
		enabled: Number.isFinite(id),
	})

export const useAcademicYearQuotaRows = (): UseQueryResult<AcademicYearQuotaRow[]> =>
	useQuery({ queryKey: academicYearKeys.quotaRows(), queryFn: () => adminApi.getAcademicYearQuotaRows() })

export const useAcademicYearQuotaRowsFor = (id: number): UseQueryResult<AcademicYearQuotaRow[]> =>
	useQuery({
		queryKey: academicYearKeys.quotaRowsFor(id),
		queryFn: () => adminApi.getAcademicYearQuotaRowsFor(id),
		enabled: Number.isFinite(id),
	})

export const useCreateAcademicYear = (): UseMutationResult<AdminMessageResult, Error, AcademicYearPayload> => {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: (payload: AcademicYearPayload) => adminApi.createAcademicYear(payload),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: academicYearKeys.list() }),
	})
}

export const useUpdateAcademicYear = (
	id: number,
): UseMutationResult<AdminMessageResult, Error, AcademicYearPayload> => {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: (payload: AcademicYearPayload) => adminApi.updateAcademicYear(id, payload),
		// The edit form has no `data-redirect`, so `default-ajax.js` reloads the page: refetch everything
		onSuccess: () => queryClient.invalidateQueries({ queryKey: academicYearKeys.all }),
	})
}
