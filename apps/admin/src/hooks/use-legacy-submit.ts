import { useEffect, useRef, useState } from "react"
import { useMutation, type UseMutationResult } from "@tanstack/react-query"

import { legacyNotify } from "@/components/legacy/legacy-notify"
import { legacyErrors } from "@/lib/legacy-errors"

const AFTER_MS = 1000

type LegacySubmitOptions<TVariables, TData> = {
	mutationFn: (variables: TVariables) => Promise<TData>
	successMessage?: string | ((data: TData) => string)
	errorTitle?: string
	onDone?: (data: TData) => void
	afterMs?: number
}

export type LegacySubmit<TVariables, TData> = {
	submit: (variables: TVariables) => void
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
	afterMs = AFTER_MS,
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
			}, afterMs)
		},
		onError: (error) => legacyNotify.error(legacyErrors(error), errorTitle),
	})

	return {
		submit: (variables: TVariables) => mutation.mutate(variables),
		submitting: mutation.isPending || waiting,
		mutation,
	}
}
