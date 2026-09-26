import { createZodDto } from "nestjs-zod"
import { z } from "zod"

export const DashboardStatsFilterSchema = z.object({
	// Omitted = all academic years (legacy "Semua Tahun Ajaran")
	academicYearId: z.coerce.number().int().positive().optional(),
})

export class DashboardStatsFilterDto extends createZodDto(DashboardStatsFilterSchema) {}

export const DashboardChartFilterSchema = z.object({
	// Grade label (legacy `/dashboard/chart/{grade?}` defaults to 1)
	grade: z.coerce.number().int().positive().default(1),
})

export class DashboardChartFilterDto extends createZodDto(DashboardChartFilterSchema) {}

export const DashboardStatsResponseSchema = z.object({
	total: z.number(),
	approve: z.number(),
	reject: z.number(),
})

export class DashboardStatsResponseDto extends createZodDto(DashboardStatsResponseSchema) {}

export const DashboardOptionsResponseSchema = z.object({
	academicYears: z.array(z.object({ id: z.number(), year: z.string() })),
	grades: z.array(z.object({ label: z.number() })),
})

export class DashboardOptionsResponseDto extends createZodDto(DashboardOptionsResponseSchema) {}

export const DashboardChartItemSchema = z.object({
	category: z.string(),
	value: z.number(),
})

export class DashboardChartItemDto extends createZodDto(DashboardChartItemSchema) {}

export const DashboardPieItemSchema = z.object({
	grade: z.string(),
	value: z.number(),
})

export class DashboardPieItemDto extends createZodDto(DashboardPieItemSchema) {}
