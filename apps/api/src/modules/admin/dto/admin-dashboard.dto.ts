import { createZodDto } from "nestjs-zod"
import { z } from "zod"

export const DashboardStatsFilterSchema = z.object({
	academicYearId: z.coerce.number().optional(),
})

export class DashboardStatsFilterDto extends createZodDto(DashboardStatsFilterSchema) {}

export const DashboardChartFilterSchema = z.object({
	gradeId: z.coerce.number().optional(),
})

export class DashboardChartFilterDto extends createZodDto(DashboardChartFilterSchema) {}

export const DashboardStatsResponseSchema = z.object({
	psb: z.object({
		total: z.number(),
		approve: z.number(),
		reject: z.number(),
		wait: z.number(),
	}),
	students: z.object({
		totalActive: z.number(),
		totalMale: z.number(),
		totalFemale: z.number(),
	}),
	academicYear: z.string().nullable().optional(),
})

export class DashboardStatsResponseDto extends createZodDto(DashboardStatsResponseSchema) {}

export const DashboardChartItemSchema = z.object({
	category: z.string(),
	value: z.number(),
})

export const DashboardChartResponseSchema = z.object({
	data: z.array(DashboardChartItemSchema),
})

export class DashboardChartResponseDto extends createZodDto(DashboardChartResponseSchema) {}

export const DashboardPieItemSchema = z.object({
	grade: z.string(),
	value: z.number(),
})

export const DashboardPieResponseSchema = z.object({
	data: z.array(DashboardPieItemSchema),
})

export class DashboardPieResponseDto extends createZodDto(DashboardPieResponseSchema) {}
