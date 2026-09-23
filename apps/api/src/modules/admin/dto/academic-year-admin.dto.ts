import { createZodDto } from "nestjs-zod"
import { z } from "zod"

// Legacy `AcademicYearRequest` (app/Http/Requests/AcademicYearRequest.php) — same field
// order, and the messages the legacy validator resolves from resources/lang/id/validation.php
// with the request's `attributes()` substitutions:
//   start_year -> "tahun ajaran"      active_kbm      -> "tanggal mulai aktif KBM"
//   note       -> "catatan"           serial_number   -> "nomor urut"
//   status     -> "status PSB"        is_current      -> "status Akademik"
//   cost_date_start -> "tanggal mulai" cost_date_end  -> "tanggal selesai"

// Laravel counts a missing key, null and "" as "not filled"
const blank = (input: unknown): boolean => input === undefined || input === null || input === ""

/** `sometimes|required|string|min:1|max:4` — create only; the edit form disables both year inputs. */
const startYear = z
	.string({
		error: (issue) =>
			blank(issue.input) ? "Kolom tahun ajaran wajib untuk diisi." : "Tahun ajaran harus berupa string.",
	})
	.min(1, "Kolom tahun ajaran harus terdiri minimal 1 angka.")
	.max(4, "Kolom tahun ajaran harus terdiri maksimal 4 angka.")

/** `required|date` — the datepicker posts dd-mm-yyyy, which PHP's `date` rule accepts. */
const activeKbm = z
	.string({
		error: (issue) =>
			blank(issue.input)
				? "Kolom tanggal mulai aktif KBM wajib untuk diisi."
				: "Tanggal mulai aktif KBM harus berupa string.",
	})
	.regex(/^\d{2}-\d{2}-\d{4}$/, "Tanggal mulai aktif KBM bukan tanggal yang valid.")

const note = z.string("Catatan harus berupa string.").nullish()

const serialNumber = z
	.string({
		error: (issue) =>
			blank(issue.input) ? "Kolom nomor urut wajib untuk diisi." : "Nomor urut harus berupa string.",
	})
	.min(1, "Kolom nomor urut wajib untuk diisi.")

const type = z
	.enum(["reguler", "indent"], { error: () => "Type yang dipilih tidak valid." })
	.optional()

// Legacy posts "1"/"0" from a hidden input plus an ios7 switch
const legacyBoolean = (requiredMessage: string, invalidMessage: string) =>
	z.preprocess(
		(input) => {
			if (input === "1" || input === 1) return true
			if (input === "0" || input === 0) return false
			return input
		},
		z.boolean({ error: (issue) => (blank(issue.input) ? requiredMessage : invalidMessage) }),
	)

const dmySlash = (requiredMessage: string, formatMessage: string) =>
	z
		.string({ error: (issue) => (blank(issue.input) ? requiredMessage : formatMessage) })
		.regex(/^\d{2}\/\d{2}\/\d{4}$/, formatMessage)

/**
 * Legacy posts index-paired `level_id[]` and `quota[]` arrays; the port sends objects so the
 * pairing cannot slip. `quota` stays a raw string so an empty box fails exactly like legacy.
 */
const quotas = z.array(
	z.object({
		levelId: z.number({ error: () => "Kolom jenjang wajib dipilih." }).int(),
		quota: z
			.string({ error: () => "Kuota jenjang yang tersedia wajib untuk diisi." })
			.min(1, "Kuota jenjang yang tersedia wajib untuk diisi."),
	}),
	// Without this a missing `quotas` key answers zod's English default on an otherwise
	// all-Indonesian form; legacy's nearest equivalent is `quota.*.required`
	{ error: () => "Kuota jenjang yang tersedia wajib untuk diisi." },
)

const academicYearShape = {
	activeKbm,
	note,
	serialNumber,
	type,
	status: legacyBoolean("Kolom status PSB wajib untuk diisi.", "Status PSB yang dipilih tidak valid."),
	isCurrent: legacyBoolean(
		"Kolom status Akademik wajib untuk diisi.",
		"Status Akademik yang dipilih tidak valid.",
	),
	costDateStart: dmySlash(
		"Kolom tanggal mulai wajib untuk diisi.",
		"Tanggal mulai tidak cocok dengan format d/m/Y.",
	),
	costDateEnd: dmySlash(
		"Kolom tanggal selesai wajib untuk diisi.",
		"Tanggal selesai tidak cocok dengan format d/m/Y.",
	),
	quotas,
}

export const AcademicYearCreateSchema = z.object({ startYear, ...academicYearShape })
export class AcademicYearCreateDto extends createZodDto(AcademicYearCreateSchema) {}

/** Legacy's edit form disables both year inputs, so `year` is immutable through this route. */
export const AcademicYearUpdateSchema = z.object(academicYearShape)
export class AcademicYearUpdateDto extends createZodDto(AcademicYearUpdateSchema) {}

export type AcademicYearCreateInput = z.infer<typeof AcademicYearCreateSchema>
export type AcademicYearUpdateInput = z.infer<typeof AcademicYearUpdateSchema>

// ─── Responses (Swagger) ─────────────────────────────────────────

export const AcademicYearRowSchema = z.object({
	id: z.number(),
	year: z.string().nullable(),
	period: z.string(),
	statusPsb: z.enum(["open", "closed", "none"]),
	statusAkademik: z.enum(["berjalan", "berakhir", "empty", "none"]),
	deleteTarget: z.enum(["delete", "delegate-registrant", "delegate-student", "delegate-alumni"]),
	actionable: z.boolean(),
	isArchive: z.boolean(),
})
export class AcademicYearRowDto extends createZodDto(AcademicYearRowSchema) {}

export const AcademicYearQuotaRowSchema = z.object({
	levelId: z.number(),
	levelName: z.string().nullable(),
	quota: z.number().nullable(),
	psb: z.number(),
	tmq: z.number(),
})
export class AcademicYearQuotaRowDto extends createZodDto(AcademicYearQuotaRowSchema) {}

export const AcademicYearDetailSchema = z.object({
	id: z.number(),
	year: z.string().nullable(),
	startYear: z.number().nullable(),
	endYear: z.number().nullable(),
	activeKbm: z.string().nullable(),
	note: z.string().nullable(),
	serialNumber: z.string().nullable(),
	type: z.enum(["reguler", "indent"]).nullable(),
	status: z.boolean(),
	isCurrent: z.boolean(),
	costDateStart: z.string().nullable(),
	costDateEnd: z.string().nullable(),
})
export class AcademicYearDetailDto extends createZodDto(AcademicYearDetailSchema) {}

export const AcademicYearDeleteStepSchema = z.object({
	id: z.number(),
	year: z.string().nullable(),
	step: z.enum(["delete", "delegate-registrant", "delegate-student", "delegate-alumni"]),
	locked: z.boolean(),
	redirect: z.string().nullable(),
})
export class AcademicYearDeleteStepDto extends createZodDto(AcademicYearDeleteStepSchema) {}

export const AdminRedirectResultSchema = z.object({ message: z.string(), redirect: z.string() })
export class AdminRedirectResultDto extends createZodDto(AdminRedirectResultSchema) {}
