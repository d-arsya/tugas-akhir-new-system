import { BadRequestException } from "@nestjs/common"

export type FieldErrors = Record<string, string | string[]>

/**
 * Throws the same shape as a failed zod validation, so the client can show the message
 * under the field. Use it for checks zod cannot express (uploaded file size or type,
 * an expired token), keeping the legacy Laravel wording.
 */
export const throwFieldErrors = (errors: FieldErrors, message = "Validation failed"): never => {
	throw new BadRequestException({ message, errors })
}
