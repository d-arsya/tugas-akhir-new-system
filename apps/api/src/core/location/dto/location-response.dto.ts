import { createZodDto } from "nestjs-zod"
import { z } from "zod"

export const ProvinceResponseSchema = z.object({
	id: z.number(),
	name: z.string().optional(),
})
export class ProvinceResponseDto extends createZodDto(ProvinceResponseSchema) {}

export const RegencyResponseSchema = z.object({
	id: z.number(),
	provinceId: z.number(),
	name: z.string().optional(),
})
export class RegencyResponseDto extends createZodDto(RegencyResponseSchema) {}

export const DistrictResponseSchema = z.object({
	id: z.number(),
	regencyId: z.number(),
	name: z.string().optional(),
})
export class DistrictResponseDto extends createZodDto(DistrictResponseSchema) {}
