import { useNavigate } from "@tanstack/react-router"
import { useMutation, type UseMutationResult } from "@tanstack/react-query"

import type { AdminRedirectResult } from "@roja/types"

import { legacyNotify } from "@/components/legacy/legacy-notify"
import { legacyErrors } from "@/lib/legacy-errors"

type LegacyDeletePageOptions<TPayload> = {
	mutationFn: (payload: TPayload) => Promise<AdminRedirectResult>
}

export type LegacyDeletePageSubmit<TPayload> = {
	submit: (payload: TPayload) => void
	submitting: boolean
	mutation: UseMutationResult<AdminRedirectResult, unknown, TPayload>
}

export const useLegacyDeletePage = <TPayload = void,>({
	mutationFn,
}: LegacyDeletePageOptions<TPayload>): LegacyDeletePageSubmit<TPayload> => {
	const navigate = useNavigate()

	const mutation = useMutation<AdminRedirectResult, unknown, TPayload>({
		mutationFn,
		onSuccess: (data) => {
			legacyNotify.success(data.message)
			void navigate({ to: data.redirect })
		},
		onError: (error) => legacyNotify.error(legacyErrors(error)),
	})

	return {
		submit: (payload: TPayload) => mutation.mutate(payload),
		submitting: mutation.isPending,
		mutation,
	}
}
