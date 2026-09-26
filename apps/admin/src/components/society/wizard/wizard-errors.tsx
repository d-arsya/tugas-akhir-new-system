import type { JSX } from "react"

import type { SocietyFieldErrors, SocietyStepKey } from "@roja/types"

type ApiErrorShape = { response?: { status?: number; data?: { errors?: unknown } } }

export const fieldErrorsOf = (error: unknown): SocietyFieldErrors | null => {
	const response = (error as ApiErrorShape)?.response
	const errors = response?.data?.errors
	if (response?.status !== 400 || typeof errors !== "object" || errors === null) return null
	const out: SocietyFieldErrors = {}
	for (const [key, value] of Object.entries(errors as Record<string, unknown>)) {
		const first = Array.isArray(value) ? value.find((entry) => typeof entry === "string") : value
		if (typeof first === "string") out[key] = first
	}
	return Object.keys(out).length > 0 ? out : null
}

export const WizardFieldError = ({ message }: { message: string | undefined }): JSX.Element | null =>
	message ? (
		<span role="alert" className="mt-[8px] block w-full text-[80%] leading-[18px] text-[var(--danger)]">
			{message}
		</span>
	) : null

const pending = new Map<string, SocietyFieldErrors>()

export const setPendingErrors = (society: string, step: SocietyStepKey, errors: SocietyFieldErrors): void => {
	pending.set(`${society}:${step}`, errors)
}

export const takePendingErrors = (society: string, step: SocietyStepKey): SocietyFieldErrors => {
	const key = `${society}:${step}`
	const errors = pending.get(key) ?? {}
	pending.delete(key)
	return errors
}
