import type { JSX } from "react"

import type { SocietyFieldErrors, SocietyStepKey } from "@roja/types"

// Field errors of the create wizard: legacy renders them under each input with Blade's `@error`
// (`<span class="invalid-feedback" role="alert">`), first message per field.

type ApiErrorShape = { response?: { status?: number; data?: { errors?: unknown } } }

/** The 400 body of `throwFieldErrors` / `validateSocietyInput` as `{ field: first message }`, or null. */
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

/**
 * `.invalid-feedback` (bootstrap 4 `font-size: 80%; width: 100%` under form.css 69-74:
 * `color: var(--danger); line-height: 18px; margin-top: 8px; display: block`).
 */
export const WizardFieldError = ({ message }: { message: string | undefined }): JSX.Element | null =>
	message ? (
		<span role="alert" className="mt-[8px] block w-full text-[80%] leading-[18px] text-[var(--danger)]">
			{message}
		</span>
	) : null

// Legacy `validatePreviousData()` throws a ValidationException with `redirectTo(<previous step>)`:
// Laravel flashes the errors and the previous step renders them. The port hands them over in memory.
const pending = new Map<string, SocietyFieldErrors>()

export const setPendingErrors = (society: string, step: SocietyStepKey, errors: SocietyFieldErrors): void => {
	pending.set(`${society}:${step}`, errors)
}

/** Read once, like a flashed session value. */
export const takePendingErrors = (society: string, step: SocietyStepKey): SocietyFieldErrors => {
	const key = `${society}:${step}`
	const errors = pending.get(key) ?? {}
	pending.delete(key)
	return errors
}
