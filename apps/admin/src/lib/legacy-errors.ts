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
		if (lines.length > 0) return lines
	}

	if (typeof body?.message === "string" && body.message !== "Validation failed") return [body.message]

	return [fallback]
}
