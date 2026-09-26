import { useMutation, useQuery, type UseMutationResult, type UseQueryResult } from "@tanstack/react-query"

import type { AdminLoginResponse } from "@roja/api-client"
import type { CreatePasswordCheck, CreatePasswordPayload } from "@roja/types"

import { adminApi } from "@/lib/api"

export const createPasswordKeys = {
	all: ["admin-create-password"] as const,
	check: (token: string, email: string) => [...createPasswordKeys.all, "check", token, email] as const,
}

export const useCreatePasswordCheck = (token: string, email: string): UseQueryResult<CreatePasswordCheck> =>
	useQuery({
		queryKey: createPasswordKeys.check(token, email),
		queryFn: () => adminApi.checkCreatePassword(token, email),
		enabled: token.length > 0 && email.length > 0,
		retry: false,
	})

export const useCreatePassword = (): UseMutationResult<AdminLoginResponse, Error, CreatePasswordPayload> =>
	useMutation({ mutationFn: (payload: CreatePasswordPayload) => adminApi.createPassword(payload) })
