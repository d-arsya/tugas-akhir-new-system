import { createZodDto } from "nestjs-zod"
import { z } from "zod"

export const FamilySchema = z.object({
	fatherFullname: z.string().optional(),
	fatherReligion: z.enum(["islam", "kristen", "katolik", "hindu", "buddha", "konghucu"]).optional(),
	fatherNationality: z.string().optional(),
	fatherLastEducation: z.enum(["tidak sekolah", "sd", "smp", "sma", "diploma", "s1", "s2", "s3"]).optional(),
	fatherPhone: z.string().optional(),
	fatherWhatsapp: z.string().optional(),
	fatherJob: z.string().optional(),

	motherFullname: z.string().optional(),
	motherReligion: z.enum(["islam", "kristen", "katolik", "hindu", "buddha", "konghucu"]).optional(),
	motherNationality: z.string().optional(),
	motherLastEducation: z.enum(["tidak sekolah", "sd", "smp", "sma", "diploma", "s1", "s2", "s3"]).optional(),
	motherPhone: z.string().optional(),
	motherWhatsapp: z.string().optional(),
	motherJob: z.string().optional(),

	familyProvinceId: z.coerce.number().int().optional(),
	familyRegencyId: z.coerce.number().int().optional(),
	familyDistrictId: z.coerce.number().int().optional(),
	familyVillage: z.string().optional(),
	familySubVillage: z.string().optional(),
	familyRt: z.string().optional(),
	familyRw: z.string().optional(),
	familyStreet: z.string().optional(),
})

export class FamilyDto extends createZodDto(FamilySchema) {}
