import { createZodDto } from "nestjs-zod"
import { z } from "zod"

// WS-B: zod schemas + createZodDto classes — legacy MyProfile request rules
// (`App\Http\Requests\MyProfile`: rules(), attributes(), messages()).

const NAME_REQUIRED = "Kolom nama lengkap wajib untuk diisi."
const GENDER_REQUIRED = "Kolom jenis kelamin wajib dipilih."
const PASSWORD_REQUIRED_WITH = "Kata sandi wajib diisi bila terdapat tulis ulang kata sandi."
const PASSWORD_CONFIRMED = "Konfirmasi password tidak cocok."
const PASSWORD_MIN = "Password minimal berisi 8 karakter."
const WEAK_PASSWORD_REQUIRED = "Konfirmasi menggunakan password lemah wajib untuk diisi."

/** Laravel's `required`: null, missing and whitespace-only all count as empty. */
export const isFilled = (value: string | null | undefined): boolean => (value ?? "").trim() !== ""

// Laravel keeps validating the other fields after one fails, so every field falls back to an
// empty string instead of failing, and the rules run in `rules()` order in one check.
export const MyProfileUpdateSchema = z
	.object({
		// `TrimStrings` trims every field except the two password ones
		name: z.string().trim().catch(""),
		gender: z.union([z.literal("male"), z.literal("female"), z.literal("")]).catch(""),
		password: z.string().catch(""),
		passwordConfirmation: z.string().catch(""),
		// `sometimes|required`: absent skips the rule, present-but-empty fails it
		weakPassword: z.union([z.literal(true), z.literal(false), z.null()]).optional().catch(null),
	})
	.superRefine((body, ctx) => {
		// name: required|string
		if (!isFilled(body.name)) {
			ctx.addIssue({ code: "custom", path: ["name"], message: NAME_REQUIRED })
		}

		// gender: bail|required (the port also pins it to the two values the column holds)
		if (!isFilled(body.gender)) {
			ctx.addIssue({ code: "custom", path: ["gender"], message: GENDER_REQUIRED })
		}

		// password: bail|nullable|required_with:password_confirmation|confirmed|min:8
		if (!isFilled(body.password)) {
			if (isFilled(body.passwordConfirmation)) {
				ctx.addIssue({ code: "custom", path: ["password"], message: PASSWORD_REQUIRED_WITH })
			}
		} else if (body.password !== body.passwordConfirmation) {
			ctx.addIssue({ code: "custom", path: ["password"], message: PASSWORD_CONFIRMED })
		} else if (body.password.length < 8) {
			ctx.addIssue({ code: "custom", path: ["password"], message: PASSWORD_MIN })
		}

		// weak_password: sometimes|required
		if (body.weakPassword === null) {
			ctx.addIssue({ code: "custom", path: ["weakPassword"], message: WEAK_PASSWORD_REQUIRED })
		}
	})

export class MyProfileUpdateDto extends createZodDto(MyProfileUpdateSchema) {}

export const MyProfileSchema = z.object({
	id: z.number(),
	name: z.string().nullable(),
	email: z.string().nullable(),
	role: z.string().nullable(),
	gender: z.enum(["male", "female"]).nullable(),
	weakPassword: z.boolean(),
})

export class MyProfileDto extends createZodDto(MyProfileSchema) {}
