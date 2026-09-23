type ApiErrorBody = {
	message?: unknown
	errors?: unknown
}

type ApiError = {
	response?: { data?: ApiErrorBody }
	message?: unknown
}

const GENERIC = "Terjadi kesalahan pada sistem. Silakan reload ulang halaman ini."

/**
 * Port of the legacy `default-ajax.js` error handler: every validation message of every field,
 * in field order, each on its own line; otherwise the API message, else the generic text.
 */
export const legacyErrors = (error: unknown, fallback = GENERIC): string[] => {
	const body = (error as ApiError)?.response?.data

	if (body?.errors && typeof body.errors === "object") {
		const lines = Object.values(body.errors as Record<string, unknown>).flatMap((value) =>
			(Array.isArray(value) ? value : [value]).filter((entry): entry is string => typeof entry === "string"),
		)
		// Legacy's `failedValidation` keeps a field only when its first message differs from the
		// previously kept one, so three empty `quota[]` boxes produce a single line, not three.
		// Collapsing consecutive duplicates reproduces that without the field-order bookkeeping.
		const deduped = lines.filter((line, index) => line !== lines[index - 1])
		if (deduped.length > 0) return deduped
	}

	if (typeof body?.message === "string" && body.message !== "Validation failed") return [body.message]

	return [fallback]
}
