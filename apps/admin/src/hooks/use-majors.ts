import { useMutation, useQuery, useQueryClient, type UseMutationResult, type UseQueryResult } from "@tanstack/react-query"

import type { AdminMessageResult, MajorDetail, MajorPayload, MajorRow } from "@roja/types"

import { adminApi } from "@/lib/api"

export const majorKeys = {
	all: ["admin-majors"] as const,
	list: () => [...majorKeys.all, "list"] as const,
	detail: (id: number) => [...majorKeys.all, "detail", id] as const,
}

export const useMajors = (): UseQueryResult<MajorRow[]> =>
	useQuery({ queryKey: majorKeys.list(), queryFn: () => adminApi.getMajorRows() })

export const useMajor = (id: number | null): UseQueryResult<MajorDetail> =>
	useQuery({
		queryKey: majorKeys.detail(id ?? 0),
		queryFn: () => adminApi.getMajor(Number(id)),
		enabled: id !== null,
		gcTime: 0,
		staleTime: 0,
	})

export const useCreateMajor = (): UseMutationResult<AdminMessageResult, Error, MajorPayload> => {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: (payload: MajorPayload) => adminApi.createMajor(payload),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: majorKeys.list() }),
	})
}

export const useUpdateMajor = (): UseMutationResult<AdminMessageResult, Error, { id: number; payload: MajorPayload }> => {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: ({ id, payload }: { id: number; payload: MajorPayload }) => adminApi.updateMajor(id, payload),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: majorKeys.all }),
	})
}

export const useDeleteMajor = (): UseMutationResult<AdminMessageResult, Error, number> => {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: (id: number) => adminApi.deleteMajor(id),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: majorKeys.list() }),
	})
}
