import {
	ArgumentsHost,
	Catch,
	ExceptionFilter,
	HttpException,
	HttpStatus,
	Logger,
} from "@nestjs/common"
import type { Response } from "express"

type ErrorResponse = {
	success: false
	message: string
	errors?: Record<string, string[]>
}

type ZodIssueLike = { path?: unknown; message?: unknown }

const issueField = (path: unknown): string => {
	if (!Array.isArray(path) || path.length === 0) return "unknown"
	return path.map((part) => String(part)).join(".")
}

// Accepts raw zod issues (nestjs-zod `ZodValidationException`) or an already-keyed map
// (`throwFieldErrors`), and returns the { field: [message] } shape clients render per field.
const normalizeFieldErrors = (raw: unknown): Record<string, string[]> | undefined => {
	if (Array.isArray(raw)) {
		const mapped = raw.reduce<Record<string, string[]>>((acc, item) => {
			const issue = item as ZodIssueLike
			if (typeof issue?.message !== "string") return acc
			const key = issueField(issue.path)
			acc[key] = [...(acc[key] ?? []), issue.message]
			return acc
		}, {})
		return Object.keys(mapped).length > 0 ? mapped : undefined
	}

	if (typeof raw === "object" && raw !== null) {
		const mapped = Object.entries(raw as Record<string, unknown>).reduce<Record<string, string[]>>(
			(acc, [key, value]) => {
				const messages = (Array.isArray(value) ? value : [value]).filter(
					(entry): entry is string => typeof entry === "string",
				)
				if (messages.length > 0) acc[key] = messages
				return acc
			},
			{},
		)
		return Object.keys(mapped).length > 0 ? mapped : undefined
	}

	return undefined
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
	private readonly logger = new Logger(HttpExceptionFilter.name)

	catch(exception: unknown, host: ArgumentsHost): void {
		const ctx = host.switchToHttp()
		const response = ctx.getResponse<Response>()

		const status =
			exception instanceof HttpException
				? exception.getStatus()
				: HttpStatus.INTERNAL_SERVER_ERROR

		let message = "Internal server error"
		let errors: Record<string, string[]> | undefined

		if (exception instanceof HttpException) {
			const exceptionResponse = exception.getResponse()
			if (typeof exceptionResponse === "string") {
				message = exceptionResponse
			} else if (typeof exceptionResponse === "object" && exceptionResponse !== null) {
				const resp = exceptionResponse as Record<string, unknown>
				message = typeof resp["message"] === "string" ? resp["message"] : message

				// nestjs-zod validation errors come as array
				if (Array.isArray(resp["message"])) {
					message = "Validation failed"
					// Flatten zod errors to Record<field, string[]>
					errors = (resp["message"] as string[]).reduce<Record<string, string[]>>(
						(acc, msg) => {
							const [field, ...rest] = msg.split(": ")
							const key = field ?? "unknown"
							acc[key] = [...(acc[key] ?? []), rest.join(": ") || msg]
							return acc
						},
						{},
					)
				}

				// `ZodValidationException` carries the raw zod issues, and `throwFieldErrors` an
				// already-keyed map. Both surface as { field: [message] } so clients can show them per field.
				if (resp["errors"] !== undefined) {
					errors = normalizeFieldErrors(resp["errors"]) ?? errors
				}
			}
		} else if (exception instanceof Error) {
			this.logger.error(exception.message, exception.stack)
		}

		const errorResponse: ErrorResponse = {
			success: false,
			message,
			...(errors !== undefined && { errors }),
		}

		response.status(status).json(errorResponse)
	}
}
