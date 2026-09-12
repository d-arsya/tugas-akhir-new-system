import { createZodDto } from "nestjs-zod"
import { z } from "zod"

export const ValidateCheckoutPinSchema = z.object({
	pin: z.string().length(6, "PIN harus 6 digit angka"),
})

export class ValidateCheckoutPinDto extends createZodDto(ValidateCheckoutPinSchema) {}
