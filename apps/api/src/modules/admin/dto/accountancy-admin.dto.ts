import { createZodDto } from "nestjs-zod"
import { z } from "zod"

// Legacy `AccountancyRequest` (app/Http/Requests/AccountancyRequest.php).
// `attributes()`: name => "nama", is_parent => "terapkan sebagai", parent_id => "pilih induk akun",
// group => "pengelompokan", is_student_cost => "Tetapkan sebagai biaya santri", note => "catatan".

const blank = (input: unknown): boolean => input === undefined || input === null || input === ""

const name = z
	.string({
		error: (issue) => (blank(issue.input) ? "Kolom nama wajib untuk diisi." : "Nama harus berupa string."),
	})
	.min(1, "Kolom nama wajib untuk diisi.")
	.max(255, "Nama maksimal berisi 255 karakter.")

/**
 * Legacy validates `note` at `max:500` against a **varchar(191)** column, so anything between
 * 192 and 500 characters was accepted by the validator and then threw a DB error the user saw
 * as a 500. Validated at the real column width instead (plan decision).
 */
const note = z.string("Catatan harus berupa string.").max(191, "Catatan maksimal berisi 191 karakter.").nullish()

const group = z
	.enum(["income", "expense"], { error: () => "Pengelompokan yang dipilih tidak valid." })
	.nullable()

const bool = (requiredMessage: string, invalidMessage: string) =>
	z.preprocess(
		(input) => {
			if (input === "1" || input === 1) return true
			if (input === "0" || input === 0) return false
			return input
		},
		z.boolean({ error: (issue) => (blank(issue.input) ? requiredMessage : invalidMessage) }),
	)

/**
 * `parent_id` is `required_if:is_parent,0`.
 *
 * Legacy's `#childData` block uses the HTML `hidden` attribute, which does **not** exclude its
 * inputs from `$(form).serialize()`, so creating a root account posted `parent_id=""`. That
 * empty string persisted, and `list()` filters `WHERE parent_id IS NULL` — the account was
 * created successfully and then invisible forever. The port forces null for a root (plan decision).
 */
export const AccountancyWriteSchema = z
	.object({
		name,
		isParent: bool("Kolom terapkan sebagai wajib dipilih.", "Terapkan sebagai yang dipilih tidak valid."),
		parentId: z.number({ error: () => "Kolom pilih induk akun wajib dipilih." }).int().nullable(),
		group,
		isStudentCost: bool(
			"Kolom Tetapkan sebagai biaya santri wajib dipilih.",
			"Tetapkan sebagai biaya santri harus bernilai true atau false",
		),
		note,
	})
	.superRefine((value, ctx) => {
		if (!value.isParent && value.parentId === null) {
			ctx.addIssue({ code: "custom", path: ["parentId"], message: "Kolom pilih induk akun wajib dipilih." })
		}
	})
	.transform((value) => (value.isParent ? { ...value, parentId: null, group: null } : value))

export class AccountancyWriteDto extends createZodDto(AccountancyWriteSchema) {}
export type AccountancyWriteInput = z.infer<typeof AccountancyWriteSchema>

/** `delegateChild` validates `['parent_id' => 'required']` with its own, differently worded message. */
export const AccountancyDelegateSchema = z.object({
	parentId: z.number({ error: () => "Kolom pilih induk wajib untuk dipilih." }).int(),
})
export class AccountancyDelegateDto extends createZodDto(AccountancyDelegateSchema) {}
export type AccountancyDelegateInput = z.infer<typeof AccountancyDelegateSchema>

// ─── Responses (Swagger) ─────────────────────────────────────────

export const AccountancyRowSchema = z.object({
	id: z.number(),
	name: z.string().nullable(),
	level: z.number(),
	group: z.enum(["income", "expense"]).nullable(),
	groupLabel: z.string(),
	deleteTarget: z.enum(["delete", "delegate-child"]),
	hasChildren: z.boolean(),
})
export class AccountancyRowDto extends createZodDto(AccountancyRowSchema) {}

export const AccountancyDetailSchema = z.object({
	id: z.number(),
	name: z.string().nullable(),
	isParent: z.boolean(),
	parentId: z.number().nullable(),
	group: z.enum(["income", "expense"]).nullable(),
	isStudentCost: z.boolean(),
	note: z.string().nullable(),
})
export class AccountancyDetailDto extends createZodDto(AccountancyDetailSchema) {}

export const AccountancyOptionSchema = z.object({ id: z.number(), name: z.string().nullable() })
export class AccountancyOptionDto extends createZodDto(AccountancyOptionSchema) {}

export const AccountancyDeleteStepSchema = z.object({
	id: z.number(),
	name: z.string().nullable(),
	step: z.enum(["delete", "delegate-child"]),
	parents: z.array(AccountancyOptionSchema),
	redirect: z.string().nullable(),
})
export class AccountancyDeleteStepDto extends createZodDto(AccountancyDeleteStepSchema) {}
