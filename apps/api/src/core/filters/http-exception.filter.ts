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
