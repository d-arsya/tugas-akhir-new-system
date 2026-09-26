type ApiErrorBody = {
	message?: unknown
	errors?: unknown
}

type ApiError = {
	response?: { data?: ApiErrorBody }
	message?: unknown
}

export const SYSTEM_ERROR = "Terjadi kesalahan pada sistem. Silakan reload ulang halaman ini."

export const legacyErrors = (error: unknown, fallback = SYSTEM_ERROR): string[] => {
	const body = (error as ApiError)?.response?.data

	if (body?.errors && typeof body.errors === "object") {
		const lines = Object.values(body.errors as Record<string, unknown>).flatMap((value) =>
			(Array.isArray(value) ? value : [value]).filter((entry): entry is string => typeof entry === "string"),
		)
		const deduped = lines.filter((line, index) => line !== lines[index - 1])
		if (deduped.length > 0) return deduped
	}

	if (typeof body?.message === "string" && body.message !== "Validation failed") return [body.message]

	return [fallback]
}
