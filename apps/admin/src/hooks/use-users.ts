import { useMutation, useQuery, useQueryClient, type UseMutationResult, type UseQueryResult } from "@tanstack/react-query"

import type { AdminMessageResult, AdminUserDetail, AdminUserPayload, AdminUserRow } from "@roja/types"

import { adminApi } from "@/lib/api"

// Legacy Pengelola pages (user.list / user.show / user.store / user.update / user.destroy)
export const userKeys = {
	all: ["admin-users"] as const,
	list: () => [...userKeys.all, "list"] as const,
	detail: (id: number) => [...userKeys.all, "detail", id] as const,
}

export const useUsers = (): UseQueryResult<AdminUserRow[]> =>
	useQuery({ queryKey: userKeys.list(), queryFn: () => adminApi.getUsers() })

export const useUser = (id: number): UseQueryResult<AdminUserDetail> =>
	useQuery({ queryKey: userKeys.detail(id), queryFn: () => adminApi.getUser(id), enabled: Number.isFinite(id) })

export const useCreateUser = (): UseMutationResult<AdminMessageResult, Error, AdminUserPayload> => {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: (payload: AdminUserPayload) => adminApi.createUser(payload),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: userKeys.list() }),
	})
}

export const useUpdateUser = (id: number): UseMutationResult<AdminMessageResult, Error, AdminUserPayload> => {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: (payload: AdminUserPayload) => adminApi.updateUser(id, payload),
		// Legacy reloads the edit page after saving, so the form shows what was stored
		onSuccess: () => queryClient.invalidateQueries({ queryKey: userKeys.all }),
	})
}

export const useDeleteUser = (): UseMutationResult<AdminMessageResult, Error, number> => {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: (id: number) => adminApi.deleteUser(id),
		// `InitDatatable.ajax.reload(cb, null)` — the table refreshes but stays on its page
		onSuccess: () => queryClient.invalidateQueries({ queryKey: userKeys.list() }),
	})
}
