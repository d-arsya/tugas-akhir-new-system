import { createZodDto } from "nestjs-zod"
import { z } from "zod"

export const GuardianSchema = z.object({
	guardianFullname: z.string().optional(),
	guardianReligion: z.enum(["islam", "kristen", "katolik", "hindu", "buddha", "konghucu"]).optional(),
	guardianNationality: z.string().optional(),
	guardianLastEducation: z.enum(["tidak sekolah", "sd", "smp", "sma", "diploma", "s1", "s2", "s3"]).optional(),
	guardianPhone: z.string().optional(),
	guardianWhatsapp: z.string().optional(),
	guardianJob: z.string().optional(),
	guardianProvinceId: z.coerce.number().int().optional(),
	guardianRegencyId: z.coerce.number().int().optional(),
	guardianDistrictId: z.coerce.number().int().optional(),
	guardianVillage: z.string().optional(),
	guardianSubVillage: z.string().optional(),
	guardianRt: z.string().optional(),
	guardianRw: z.string().optional(),
	guardianStreet: z.string().optional(),
})

export class GuardianDto extends createZodDto(GuardianSchema) {}
