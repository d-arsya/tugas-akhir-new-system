import { createZodDto } from "nestjs-zod"
import { z } from "zod"

export const ProvinceResponseSchema = z.object({
	id: z.number(),
	name: z.string().optional(),
})
export class ProvinceResponseDto extends createZodDto(ProvinceResponseSchema) {}

export const RegencyResponseSchema = z.object({
	id: z.number(),
	provinceId: z.number().nullable().optional(),
	name: z.string().optional(),
})
export class RegencyResponseDto extends createZodDto(RegencyResponseSchema) {}

export const DistrictResponseSchema = z.object({
	id: z.number(),
	regencyId: z.number().nullable().optional(),
	name: z.string().optional(),
})
export class DistrictResponseDto extends createZodDto(DistrictResponseSchema) {}

export const VillageResponseSchema = z.object({
  id: z.number(),
  districtId: z.number().nullable().optional(),
  code: z.string().optional(),
  name: z.string().optional(),
})
export class VillageResponseDto extends createZodDto(VillageResponseSchema) {}
