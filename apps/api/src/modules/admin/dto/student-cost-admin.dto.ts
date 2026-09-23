import { createZodDto } from "nestjs-zod"
import { z } from "zod"

// Legacy `StudentCostTermRequest` (app/Http/Requests/StudentCostTermRequest.php).
// Its `messages()` are hand-written and — unlike every other request in this menu — carry
// **no trailing full stop**. Kept verbatim, because they are user-visible.
//
// The `yearly` branch is dropped: its blades are never included and the enum value is
// unreachable from the UI.

const blank = (input: unknown): boolean => input === undefined || input === null || input === ""

const required = (message: string) =>
	z.string({ error: () => message }).min(1, message)

const requiredInt = (message: string) =>
	z.number({ error: (issue) => (blank(issue.input) ? message : message) }).int(message)

/**
 * `amount` is validated `max:12` on the **string**, i.e. 12 characters including autoNumeric's
 * thousands dots — so "1.000.000.000" (13 chars) is rejected while 1000000000 is accepted.
 * Reproduced exactly, character count and all.
 *
 * Requiredness is **not** declared here. Legacy's rule is `required_if:type,maximum`, so the
 * conditional check lives in the `superRefine` below; adding a `.min(1)` here as well made a
 * blank amount report `Kolom biaya wajib diisi` twice in the errors payload.
 */
const maskedAmount = z
	.string({ error: () => "Kolom biaya wajib diisi" })
	.max(12, "Biaya maksimal berisi 12 karakter.")

export const StudentCostTermWriteSchema = z
	.object({
		type: z.enum(["maximum", "option"], { error: () => "Tipe biaya yang dipilih tidak valid." }),
		period: z.enum(["once", "monthly"], { error: () => "Periode yang dipilih tidak valid." }),
		amount: maskedAmount.optional(),
		/** Legacy's repeater caps the list at 20 rows. */
		amounts: z.array(z.string()).max(20).optional(),
		onceBill: z
			.string()
			.regex(/^\d{2}\/\d{2}\/\d{4}$/, "Tanggal jatuh tempo tidak cocok dengan format d/m/Y.")
			.optional(),
		reminderOnce: z.number().int().optional(),
		monthBill: z.number().int().optional(),
		monthOfMonth: z.number().int().optional(),
		dayOfMonth: z.number().int().optional(),
		reminderMonthly: z.number().int().optional(),
	})
	.superRefine((value, ctx) => {
		const miss = (path: string, message: string): void => {
			ctx.addIssue({ code: "custom", path: [path], message })
		}

		// `required_if:type,maximum` / `required_if:type,option`
		if (value.type === "maximum" && blank(value.amount)) miss("amount", "Kolom biaya wajib diisi")
		if (value.type === "option") {
			const amounts = value.amounts ?? []
			if (amounts.length === 0) miss("amounts", "Kolom biaya ke 1 harus diisi")
			amounts.forEach((entry, index) => {
				if (blank(entry)) miss(`amounts.${index}`, `Kolom biaya ke ${index + 1} harus diisi`)
			})
		}

		// `required_if:period,once` / `required_if:period,monthly`
		if (value.period === "once") {
			if (blank(value.onceBill)) miss("onceBill", "Kolom tanggal jatuh tempo wajib diisi")
			if (value.reminderOnce === undefined) miss("reminderOnce", "Kolom pengingat wajib diisi")
		}
		if (value.period === "monthly") {
			if (value.monthBill === undefined) miss("monthBill", "Kolom ditagihkan wajib diisi")
			if (value.monthOfMonth === undefined) miss("monthOfMonth", "Kolom bulan ke wajib diisi")
			if (value.dayOfMonth === undefined) miss("dayOfMonth", "Kolom tanggal wajib diisi")
			if (value.reminderMonthly === undefined) miss("reminderMonthly", "Kolom pengingat wajib diisi")
		}
	})

export class StudentCostTermWriteDto extends createZodDto(StudentCostTermWriteSchema) {}
export type StudentCostTermWriteInput = z.infer<typeof StudentCostTermWriteSchema>

/**
 * Legacy's `applied()` wraps `$request->validate()` **inside** its try, so an empty selection
 * surfaced as a 500 with an Indonesian message and un-checking everything was impossible from
 * the UI. The port answers a proper validation error (plan decision).
 */
export const StudentCostAppliedSchema = z.object({
	ids: z
		.array(requiredInt("Kolom item biaya wajib dipilih."), { error: () => "Kolom item biaya wajib dipilih." })
		.min(1, "Kolom item biaya wajib dipilih."),
})
export class StudentCostAppliedDto extends createZodDto(StudentCostAppliedSchema) {}
export type StudentCostAppliedInput = z.infer<typeof StudentCostAppliedSchema>

// ─── Responses (Swagger) ─────────────────────────────────────────

export const StudentCostYearRowSchema = z.object({
	id: z.number(),
	year: z.string().nullable(),
	period: z.string(),
	statusAkademik: z.enum(["berjalan", "berakhir", "empty", "none"]),
})
export class StudentCostYearRowDto extends createZodDto(StudentCostYearRowSchema) {}

export const StudentCostGradeRowSchema = z.object({
	gradeId: z.number(),
	label: z.number().nullable(),
	name: z.string(),
	appliedCount: z.number(),
	totalItems: z.number(),
	appliedText: z.string(),
})
export class StudentCostGradeRowDto extends createZodDto(StudentCostGradeRowSchema) {}

export const StudentCostAccountRowSchema = z.object({
	accountancyId: z.number(),
	name: z.string().nullable(),
	note: z.string(),
	termId: z.number().nullable(),
	applied: z.boolean(),
	type: z.enum(["maximum", "option"]).nullable(),
	maximumCost: z.string().nullable(),
	maximumSort: z.number().nullable(),
	optionCosts: z.array(z.string()),
	optionSort: z.number().nullable(),
	periodLabel: z.string(),
	periodSort: z.number().nullable(),
	reminderLabel: z.string(),
	reminderSort: z.number().nullable(),
	dueDate: z.string(),
})
export class StudentCostAccountRowDto extends createZodDto(StudentCostAccountRowSchema) {}

export const StudentCostAccountPageSchema = z.object({
	academicYear: z.object({
		id: z.number(),
		year: z.string().nullable(),
		costPeriod: z.string(),
		costDateStart: z.string().nullable(),
	}),
	grade: z.object({ id: z.number(), label: z.number().nullable() }),
	allApplied: z.boolean(),
	rows: z.array(StudentCostAccountRowSchema),
})
export class StudentCostAccountPageDto extends createZodDto(StudentCostAccountPageSchema) {}

export const StudentCostTermDetailSchema = z.object({
	accountancy: z.object({ id: z.number(), name: z.string().nullable() }),
	academicYear: z.object({
		id: z.number(),
		year: z.string().nullable(),
		costDateStart: z.string().nullable(),
	}),
	grade: z.object({ id: z.number(), label: z.number().nullable() }),
	term: z
		.object({
			id: z.number(),
			type: z.enum(["maximum", "option"]),
			period: z.enum(["once", "monthly"]),
			onceBill: z.string().nullable(),
			reminder: z.number().nullable(),
			monthBill: z.number().nullable(),
			monthOf: z.number().nullable(),
			dayOf: z.number().nullable(),
			amounts: z.array(z.string()),
		})
		.nullable(),
	periodLocked: z.boolean(),
})
export class StudentCostTermDetailDto extends createZodDto(StudentCostTermDetailSchema) {}
