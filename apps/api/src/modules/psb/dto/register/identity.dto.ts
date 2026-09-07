import { createZodDto } from "nestjs-zod"
import { z } from "zod"

export const DiseaseHistoryItemSchema = z.object({
	diseaseName: z.string().min(1),
	diseaseStatus: z.enum(["sembuh", "masa perawatan", "belum sembuh"]),
})

export const IdentitySchema = z.object({
	nik: z.string().optional(),
	nisn: z.string().optional(),
	kip: z.string().optional(),
	ksp: z.string().optional(),
	certificateNumber: z.string().optional(),
	weight: z.coerce.number().int().optional(),
	height: z.coerce.number().int().optional(),
	bloodType: z.enum(["a", "ab", "b", "o"]).optional(),
	visualCondition: z.enum(["normal", "abnormal"]).optional(),
	hearingCondition: z.enum(["normal", "abnormal"]).optional(),
	immunizationGiven: z.enum(["complete", "incomplete", "not_at_all"]).optional(),
	reading: z.enum(["jilid", "quran"]).optional(),
	jilidChapter: z.string().optional(),
	quranMemorizing: z.string().optional(),
	learningAchievement: z.string().optional(),
	gift: z.string().optional(),
	diseases: z.array(DiseaseHistoryItemSchema).optional(),
})

export class IdentityDto extends createZodDto(IdentitySchema) {}
