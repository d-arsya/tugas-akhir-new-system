import { useMutation, useQuery, useQueryClient, type UseMutationResult, type UseQueryResult } from "@tanstack/react-query"

import type { AdminMessageResult, GradeDetail, GradePayload, GradeRow } from "@roja/types"

import { adminApi } from "@/lib/api"

export const gradeKeys = {
	all: ["admin-grades"] as const,
	list: () => [...gradeKeys.all, "list"] as const,
	detail: (id: number) => [...gradeKeys.all, "detail", id] as const,
}

export const useGrades = (): UseQueryResult<GradeRow[]> =>
	useQuery({ queryKey: gradeKeys.list(), queryFn: () => adminApi.getGradeRows() })

export const useGrade = (id: number | null): UseQueryResult<GradeDetail> =>
	useQuery({
		queryKey: gradeKeys.detail(id ?? 0),
		queryFn: () => adminApi.getGrade(Number(id)),
		enabled: id !== null,
		gcTime: 0,
		staleTime: 0,
	})

export const useCreateGrade = (): UseMutationResult<AdminMessageResult, Error, GradePayload> => {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: (payload: GradePayload) => adminApi.createGrade(payload),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: gradeKeys.list() }),
	})
}

export const useUpdateGrade = (): UseMutationResult<AdminMessageResult, Error, { id: number; payload: GradePayload }> => {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: ({ id, payload }: { id: number; payload: GradePayload }) => adminApi.updateGrade(id, payload),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: gradeKeys.all }),
	})
}

export const useDeleteGrade = (): UseMutationResult<AdminMessageResult, Error, number> => {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: (id: number) => adminApi.deleteGrade(id),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: gradeKeys.list() }),
	})
}
