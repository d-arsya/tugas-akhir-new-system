import { createZodDto } from "nestjs-zod"
import { z } from "zod"
import { RegistrantSchema, DiseaseHistorySchema } from "@psb/dto/common/entity-schemas.dto"

export const InvalidFormDataResponseSchema = z.object({
	registrant: RegistrantSchema.optional().nullable(),
	diseases: z.array(DiseaseHistorySchema).optional(),
})
export class InvalidFormDataResponseDto extends createZodDto(InvalidFormDataResponseSchema) {}
