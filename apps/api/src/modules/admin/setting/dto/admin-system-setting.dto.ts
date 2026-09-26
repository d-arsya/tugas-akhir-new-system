import { createZodDto } from "nestjs-zod"
import { z } from "zod"

// WS-D: zod schemas + createZodDto classes — legacy SettingRequest + backup frequency + 2FA rules.
// Wording comes from `resources/lang/id/validation.php`; the attribute name is the snake_case
// column with the underscores replaced by spaces ("backup frequency"), `Str::ucfirst` everywhere
// except the `required` rule ("Smtp host", not "SMTP host").
const requiredMessage = (attribute: string): string => `Kolom ${attribute} wajib untuk diisi.`
const stringMessage = (attribute: string): string => `${attribute} harus berupa string.`
const numericMessage = (attribute: string): string => `${attribute} harus berupa angka.`
const booleanMessage = (attribute: string): string => `${attribute} harus bernilai true atau false`
const inMessage = (attribute: string): string => `${attribute} yang dipilih tidak valid.`

// Laravel `required|string`. The global `ConvertEmptyStringsToNull` turns "" into null,
// so an empty field fails `required` rather than `string`.
const legacyString = (lower: string, upper: string): z.ZodString =>
	z
		.string({
			error: (issue) =>
				issue.input === undefined || issue.input === null ? requiredMessage(lower) : stringMessage(upper),
		})
		.min(1, requiredMessage(lower))

// Laravel `required|numeric` — numeric strings pass the rule too
const legacyNumeric = (lower: string, upper: string) =>
	z
		.unknown()
		.superRefine((value, ctx) => {
			if (value === undefined || value === null || value === "") {
				ctx.addIssue({ code: "custom", message: requiredMessage(lower) })
				return
			}
			const numeric = typeof value === "number" || typeof value === "string" ? Number(value) : Number.NaN
			if (!Number.isFinite(numeric)) {
				ctx.addIssue({ code: "custom", message: numericMessage(upper) })
			}
		})
		.transform((value) => Number(value))

// Laravel's `boolean` rule accepts exactly these six inputs
const BOOLEAN_INPUTS = new Map<unknown, boolean>([
	[true, true],
	[false, false],
	[1, true],
	[0, false],
	["1", true],
	["0", false],
])

const legacyBoolean = (lower: string, upper: string) =>
	z
		.unknown()
		.superRefine((value, ctx) => {
			// `false` and `0` pass Laravel's `required`, only null/undefined fail it
			if (value === undefined || value === null) {
				ctx.addIssue({ code: "custom", message: requiredMessage(lower) })
				return
			}
			if (!BOOLEAN_INPUTS.has(value)) {
				ctx.addIssue({ code: "custom", message: booleanMessage(upper) })
			}
		})
		.transform((value) => BOOLEAN_INPUTS.get(value) === true)

export const SMTP_ENCRYPTIONS = ["ssl", "tls"] as const

// `backup_frequency => 'required|numeric'` (SettingController::updateBackupFrequency)
export const BackupFrequencySchema = z.object({
	backupFrequency: legacyNumeric("backup frequency", "Backup frequency"),
})

export class BackupFrequencyDto extends createZodDto(BackupFrequencySchema) {}

// Field order follows `SettingRequest::rules()`
export const SmtpConfigSchema = z.object({
	fromName: legacyString("from name", "From name"),
	smtpHost: legacyString("smtp host", "Smtp host"),
	typeOfEncryption: legacyString("type of encryption", "Type of encryption").pipe(
		z.enum(SMTP_ENCRYPTIONS, { error: () => inMessage("Type of encryption") }),
	),
	smtpUsername: legacyString("smtp username", "Smtp username"),
	smtpPassword: legacyString("smtp password", "Smtp password"),
})

export class SmtpConfigDto extends createZodDto(SmtpConfigSchema) {}

// `enabled_2fa => 'required|boolean'` (SettingController::update2faStatus)
export const TwoFactorSchema = z.object({
	enabled2fa: legacyBoolean("enabled 2fa", "Enabled 2fa"),
})

export class TwoFactorDto extends createZodDto(TwoFactorSchema) {}

export const SystemSettingResponseSchema = z.object({
	id: z.number(),
	backupFrequency: z.number(),
	fromName: z.string().nullable(),
	smtpHost: z.string().nullable(),
	smtpPort: z.string().nullable(),
	typeOfEncryption: z.enum(SMTP_ENCRYPTIONS).nullable(),
	smtpUsername: z.string().nullable(),
	// Legacy renders the password in clear in the SMTP form, so it is sent back as stored
	smtpPassword: z.string().nullable(),
	enabled2fa: z.boolean(),
})

export class SystemSettingResponseDto extends createZodDto(SystemSettingResponseSchema) {}
