import { useNavigate } from "@tanstack/react-router"
import { useMutation, type UseMutationResult } from "@tanstack/react-query"

import type { AdminRedirectResult } from "@roja/types"

import { legacyNotify } from "@/components/legacy/legacy-notify"
import { legacyErrors } from "@/lib/legacy-errors"

/**
 * The rhythm of `assets/js/academic-year/delegate-ajax.js`, which drives **every** delete and
 * delegate page in Data Master.
 *
 * It differs from `useLegacySubmit` in exactly one way that matters: on success it navigates
 * to `res.redirect` **immediately**, with no 1000 ms wait and no `data-redirect` fallback.
 * That is what makes the chain feel continuous when a delete walks the user through several
 * consecutive steps (registrants → santri → alumni → the list).
 *
 * The success notice stays on screen across the navigation because `legacyNotify` renders
 * outside the route tree — same as PNotify surviving a legacy full-page load.
 */
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
