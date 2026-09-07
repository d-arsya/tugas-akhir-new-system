import { createZodDto } from "nestjs-zod"
import { z } from "zod"

export const LoginPinSchema = z.object({
	pin: z.string().min(4, "PIN minimal 4 digit").max(6, "PIN maksimal 6 digit"),
})

export class LoginPinDto extends createZodDto(LoginPinSchema) {}

export const SantriLoginPinSchema = LoginPinSchema
export class SantriLoginPinDto extends LoginPinDto {}
