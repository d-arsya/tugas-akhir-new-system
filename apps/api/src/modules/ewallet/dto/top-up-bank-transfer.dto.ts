import { createZodDto } from "nestjs-zod"
import { z } from "zod"

export const TopUpBankTransferSchema = z.object({
	amount: z.coerce.number().min(1000, "Nominal top-up minimal Rp 1.000"),
})

export class TopUpBankTransferDto extends createZodDto(TopUpBankTransferSchema) {}
