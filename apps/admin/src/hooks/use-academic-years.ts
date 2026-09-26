import { useMutation, useQuery, useQueryClient, type UseMutationResult, type UseQueryResult } from "@tanstack/react-query"

import type {
	AcademicYearDetail,
	AcademicYearPayload,
	AcademicYearQuotaRow,
	AcademicYearRow,
	AdminMessageResult,
} from "@roja/types"

import { adminApi } from "@/lib/api"

export const academicYearKeys = {
	all: ["admin-academic-years"] as const,
	list: () => [...academicYearKeys.all, "list"] as const,
	detail: (id: number) => [...academicYearKeys.all, "detail", id] as const,
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
		onSuccess: () => queryClient.invalidateQueries({ queryKey: academicYearKeys.all }),
	})
}
