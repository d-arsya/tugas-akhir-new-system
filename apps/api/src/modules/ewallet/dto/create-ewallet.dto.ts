import { createZodDto } from "nestjs-zod"
import { z } from "zod"

export const CreateEwalletSchema = z
	.object({
		pin: z.string().min(4, "PIN minimal 4 digit").max(6, "PIN maksimal 6 digit"),
		pinConfirmation: z.string().min(4, "Konfirmasi PIN minimal 4 digit").max(6, "Konfirmasi PIN maksimal 6 digit"),
	})
	.refine((data) => data.pin === data.pinConfirmation, {
		message: "Konfirmasi PIN tidak cocok",
		path: ["pinConfirmation"],
	})

export class CreateEwalletDto extends createZodDto(CreateEwalletSchema) {}

export const SantriCreateEwalletSchema = CreateEwalletSchema
export class SantriCreateEwalletDto extends CreateEwalletDto {}
