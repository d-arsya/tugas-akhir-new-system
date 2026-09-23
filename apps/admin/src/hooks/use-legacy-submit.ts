import { useEffect, useRef, useState } from "react"
import { useMutation, type UseMutationResult } from "@tanstack/react-query"

import { legacyNotify } from "@/components/legacy/legacy-notify"
import { legacyErrors } from "@/lib/legacy-errors"

// `default-ajax.js`: PNotify first, then `window.location = data-redirect` / `location.reload()` 1000 ms later
const AFTER_MS = 1000

type LegacySubmitOptions<TVariables, TData> = {
	mutationFn: (variables: TVariables) => Promise<TData>
	// Legacy shows `res.message`; pass a string to override it for endpoints that answer without one
	successMessage?: string | ((data: TData) => string)
	// The file-upload variant of the script titles the failure notice "<strong>Gagal!</strong>"
	errorTitle?: string
	// The legacy redirect / `location.reload()` / DataTables reload, 1000 ms after the notice
	onDone?: (data: TData) => void
}

export type LegacySubmit<TVariables, TData> = {
	submit: (variables: TVariables) => void
	// Stays true through the 1000 ms wait, so the button keeps spinning until the page moves — like legacy
	submitting: boolean
	mutation: UseMutationResult<TData, unknown, TVariables>
}

const messageOf = (data: unknown): string =>
	typeof (data as { message?: unknown })?.message === "string" ? ((data as { message: string }).message) : "Data berhasil diupdate."

export const useLegacySubmit = <TVariables, TData>({
	mutationFn,
	successMessage,
	errorTitle,
	onDone,
}: LegacySubmitOptions<TVariables, TData>): LegacySubmit<TVariables, TData> => {
	const timer = useRef<number | undefined>(undefined)
	const [waiting, setWaiting] = useState(false)

	useEffect(() => () => window.clearTimeout(timer.current), [])

	const mutation = useMutation<TData, unknown, TVariables>({
		mutationFn,
		onSuccess: (data) => {
			const text = typeof successMessage === "function" ? successMessage(data) : (successMessage ?? messageOf(data))
			legacyNotify.success(text)
			setWaiting(true)
			timer.current = window.setTimeout(() => {
				setWaiting(false)
				onDone?.(data)
			}, AFTER_MS)
		},
		// The legacy handler restores the button and leaves the form untouched on failure
		onError: (error) => legacyNotify.error(legacyErrors(error), errorTitle),
	})

	return {
		submit: (variables: TVariables) => mutation.mutate(variables),
		submitting: mutation.isPending || waiting,
		mutation,
	}
}
