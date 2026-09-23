import { createZodDto } from "nestjs-zod"
import { z } from "zod"

// Legacy `Auth\CreatePasswordController::rules()` + `validationErrorMessages()`, with the
// messages Laravel resolves from resources/lang/id/validation.php.

const blank = (input: unknown): boolean => input === undefined || input === null || input === ""

const token = z.string("Kolom token wajib untuk diisi.").min(1, "Kolom token wajib untuk diisi.")

const email = z.email({
	error: (issue) => (blank(issue.input) ? "Kolom email wajib untuk diisi." : "Email harus berupa alamat surel yang valid."),
})

const password = z.string("Kolom password wajib untuk diisi.").min(1, "Kolom password wajib untuk diisi.")

export const CreatePasswordCheckSchema = z.object({ token, email })
export class CreatePasswordCheckQueryDto extends createZodDto(CreatePasswordCheckSchema) {}

export const CreatePasswordSchema = z
	.object({
		token,
		email,
		// `bail|required|required_with:password_confirmation|confirmed|min:8`
		password,
		passwordConfirmation: z.string().optional(),
		// `sometimes|required`: only checked when the client sends the key at all
		weakPassword: z.boolean().nullable().optional(),
	})
	.superRefine((value, ctx) => {
		// `confirmed` is listed before `min`, and `bail` keeps one message per field
		if (value.password !== (value.passwordConfirmation ?? "")) {
			ctx.addIssue({ code: "custom", path: ["password"], message: "Konfirmasi password tidak cocok." })
		} else if (value.password.length < 8) {
			ctx.addIssue({ code: "custom", path: ["password"], message: "Password minimal berisi 8 karakter." })
		}

		if ("weakPassword" in value && value.weakPassword === null) {
			ctx.addIssue({
				code: "custom",
				path: ["weakPassword"],
				message: "Konfirmasi menggunakan password lemah wajib untuk diisi.",
			})
		}
	})
export class CreatePasswordDto extends createZodDto(CreatePasswordSchema) {}

export type CreatePasswordInput = z.infer<typeof CreatePasswordSchema>

// ─── Response (Swagger) ─────────────────────────────────────────

export const CreatePasswordCheckResponseSchema = z.object({
	email: z.string(),
	name: z.string().nullable(),
	role: z.string().nullable(),
})
export class CreatePasswordCheckResponseDto extends createZodDto(CreatePasswordCheckResponseSchema) {}
