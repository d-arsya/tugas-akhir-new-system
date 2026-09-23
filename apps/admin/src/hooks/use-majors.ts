import { useMutation, useQuery, useQueryClient, type UseMutationResult, type UseQueryResult } from "@tanstack/react-query"

import type { AdminMessageResult, MajorDetail, MajorPayload, MajorRow } from "@roja/types"

import { adminApi } from "@/lib/api"

// Legacy Jurusan page (major.list / major.edit / major.store / major.update / major.destroy)
export const majorKeys = {
	all: ["admin-majors"] as const,
	list: () => [...majorKeys.all, "list"] as const,
	detail: (id: number) => [...majorKeys.all, "detail", id] as const,
}

export const useMajors = (): UseQueryResult<MajorRow[]> =>
	useQuery({ queryKey: majorKeys.list(), queryFn: () => adminApi.getMajorRows() })

/**
 * `editData()` fires a fresh GET every time the modal opens and shows its spinner while it
 * runs, so the detail is never served from cache: `gcTime: 0` drops it as soon as the modal
 * closes, which puts the next open back into the loading state.
 */
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
		// `default-ajax.js` reloads the whole page; the port just refetches the list
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
		// `InitDatatable.ajax.reload(cb, null)` — the table refreshes but stays on its page
		onSuccess: () => queryClient.invalidateQueries({ queryKey: majorKeys.list() }),
	})
}
