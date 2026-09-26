import { createZodDto } from "nestjs-zod"
import { z } from "zod"
import { blank } from "@admin/common/dto-fields"

// Legacy `Setting\Form` (app/Http/Requests/Setting/Form.php): every rule is `sometimes|required`,
// so a key that is absent is left alone and a key that is present may not be blank. The field
// order below is the legacy `rules()` order.

/** Legacy `in:0,1` on a checkbox/switch value; the port also accepts real JSON booleans. */
const flag = (attribute: string, label: string) =>
	z.preprocess(
		(input) => {
			if (input === "1" || input === 1) return true
			if (input === "0" || input === 0) return false
			return input
		},
		z.boolean({
			error: (issue) =>
				blank(issue.input) ? `Kolom ${attribute} wajib untuk diisi.` : `${label} yang dipilih tidak valid.`,
		}),
	)

const status = flag("status", "Status")
const visibility = flag("visibility", "Visibility")

// `custom_name` => 'sometimes|required|string'; global TrimStrings + ConvertEmptyStringsToNull
// turn a whitespace-only textarea into null, which fails `required`
const customName = z
	.string({
		error: (issue) =>
			blank(issue.input) ? "Kolom custom name wajib untuk diisi." : "Custom name harus berupa string.",
	})
	.trim()
	.min(1, "Kolom custom name wajib untuk diisi.")

const adminRequired = flag("admin required", "Admin required")
const registrantRequired = flag("registrant required", "Registrant required")

export const SettingFormPatchSchema = z.object({
	status: status.optional(),
	visibility: visibility.optional(),
	customName: customName.optional(),
	adminRequired: adminRequired.optional(),
	registrantRequired: registrantRequired.optional(),
})

export class SettingFormPatchDto extends createZodDto(SettingFormPatchSchema) {}

export type SettingFormPatchInput = z.infer<typeof SettingFormPatchSchema>

// ─── Responses (Swagger) ─────────────────────────────────────────

const SettingFormTypeSchema = z.enum([
	"paragraph",
	"basic input",
	"input number",
	"radio button",
	"checkbox",
	"datepicker",
	"combo box",
	"address group",
	"location group",
	"upload",
	"texteditor",
	"accordion label",
])

export const SettingFormItemSchema = z.object({
	id: z.number(),
	type: SettingFormTypeSchema,
	helper: z.string().nullable(),
	group: z.string().nullable(),
	subGroup: z.string().nullable(),
	label: z.string(),
	defaultLabel: z.string().nullable(),
	customName: z.string().nullable(),
	status: z.boolean(),
	visibility: z.boolean(),
	registrantRequired: z.boolean(),
	adminRequired: z.boolean(),
})

export const SettingFormAlphabetSchema = z.object({
	identity: z.array(z.string()),
	family: z.array(z.string()),
	guardian: z.array(z.string()),
})

export const SettingFormGroupsSchema = z.object({
	personalDatas: z.array(SettingFormItemSchema),
	previousSchools: z.array(SettingFormItemSchema),
	identityNumbers: z.array(SettingFormItemSchema),
	healthDatas: z.array(SettingFormItemSchema),
	achievments: z.array(SettingFormItemSchema),
	religiousAchievments: z.array(SettingFormItemSchema),
	gifts: z.array(SettingFormItemSchema),
	familyDatas: z.array(SettingFormItemSchema),
	familyAddress: z.array(SettingFormItemSchema),
	guardianDatas: z.array(SettingFormItemSchema),
	guardianAddress: z.array(SettingFormItemSchema),
	attachments: z.array(SettingFormItemSchema),
	alphabet: SettingFormAlphabetSchema,
})

export class SettingFormGroupsResponseDto extends createZodDto(SettingFormGroupsSchema) {}

export const SettingFormPatchResultSchema = z.object({
	id: z.number(),
	message: z.string(),
	item: SettingFormItemSchema,
	alphabet: SettingFormAlphabetSchema,
})

export class SettingFormPatchResultDto extends createZodDto(SettingFormPatchResultSchema) {}
