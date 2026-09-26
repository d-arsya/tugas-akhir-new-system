import { createZodDto } from "nestjs-zod"
import { z } from "zod"

export const CreateIpBanSchema = z.object({
	ipAddress: z.string().min(1, "Alamat IP wajib diisi"),
	reason: z.string().optional().nullable(),
})

export class CreateIpBanDto extends createZodDto(CreateIpBanSchema) {}

export const IpBanResponseSchema = z.object({
	id: z.number(),
	ipAddress: z.string(),
	reason: z.string().nullable().optional(),
	bannedBy: z.string().nullable().optional(),
	createdAt: z.string().optional(),
})


export class IpBanResponseDto extends createZodDto(IpBanResponseSchema) {}

