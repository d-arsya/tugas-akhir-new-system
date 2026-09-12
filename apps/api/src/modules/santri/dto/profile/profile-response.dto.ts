import { createZodDto } from "nestjs-zod"
import { z } from "zod"

export const SantriProfileResponseSchema = z.object({
	student: z.object({
		id: z.number(),
		nis: z.string().nullish(),
		email: z.string().nullish(),
		emailVerifiedAt: z.string().nullish(),
		enabled2fa: z.boolean(),
		studentStatus: z.string(),
		academicYearId: z.number().nullish(),
	}),
	activeGrade: z
		.object({
			id: z.number(),
			fullname: z.string(),
			shortname: z.string().nullish(),
			gender: z.string().nullish(),
			religion: z.string().nullish(),
			placeOfBirth: z.string().nullish(),
			dateOfBirth: z.string().nullish(),
			grade: z.string().nullish(),
			subGrade: z.string().nullish(),
			levelId: z.number().nullish(),
			majorName: z.string().nullish(),
			currentAcademicYear: z.string().nullish(),
			phone: z.string().nullish(),
			attachPhoto: z.string().nullish(),
		})
		.nullish(),
	school: z
		.object({
			name: z.string(),
			slogan: z.string().nullish(),
			logo: z.string().nullish(),
			favicon: z.string().nullish(),
			phone: z.string().nullish(),
			fullAddress: z.string().nullish(),
		})
		.nullish(),
})

export class SantriProfileResponseDto extends createZodDto(SantriProfileResponseSchema) {}
