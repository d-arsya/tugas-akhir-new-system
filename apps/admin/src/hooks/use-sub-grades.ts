import { useMutation, useQuery, useQueryClient, type UseMutationResult, type UseQueryResult } from "@tanstack/react-query"

import type { AdminMessageResult, SubGradeDetail, SubGradePayload, SubGradeRow } from "@roja/types"

import { adminApi } from "@/lib/api"

export const subGradeKeys = {
	all: ["admin-sub-grades"] as const,
	list: () => [...subGradeKeys.all, "list"] as const,
	detail: (id: number) => [...subGradeKeys.all, "detail", id] as const,
}

export const useSubGrades = (): UseQueryResult<SubGradeRow[]> =>
	useQuery({ queryKey: subGradeKeys.list(), queryFn: () => adminApi.getSubGradeRows() })

export const useSubGrade = (id: number | null): UseQueryResult<SubGradeDetail> =>
	useQuery({
		queryKey: subGradeKeys.detail(id ?? 0),
		queryFn: () => adminApi.getSubGrade(Number(id)),
		enabled: id !== null,
		gcTime: 0,
		staleTime: 0,
	})

export const useCreateSubGrade = (): UseMutationResult<AdminMessageResult, Error, SubGradePayload> => {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: (payload: SubGradePayload) => adminApi.createSubGrade(payload),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: subGradeKeys.list() }),
	})
}

export const useUpdateSubGrade = (): UseMutationResult<
	AdminMessageResult,
	Error,
	{ id: number; payload: SubGradePayload }
> => {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: ({ id, payload }: { id: number; payload: SubGradePayload }) => adminApi.updateSubGrade(id, payload),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: subGradeKeys.all }),
	})
}

export const useDeleteSubGrade = (): UseMutationResult<AdminMessageResult, Error, number> => {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: (id: number) => adminApi.deleteSubGrade(id),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: subGradeKeys.list() }),
	})
}
