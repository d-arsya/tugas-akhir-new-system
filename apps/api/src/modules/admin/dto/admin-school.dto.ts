import { createZodDto } from "nestjs-zod"
import { z } from "zod"

import type { FieldErrors } from "@core/errors/field-errors"

// WS-B: zod schemas + createZodDto classes — legacy Setting\School request rules
// (`App\Http\Requests\Setting\School`: rules(), attributes(), messages()).

const NAME_REQUIRED = "Kolom nama pondok wajib untuk diisi."
const PHONE_NUMERIC = "Telepon pondok harus berupa angka."
const PHONE_MIN = "Telepon pondok minimal bernilai 1."
const PHONE_DIGITS_BETWEEN = "Telepon pondok harus terdiri dari 7 sampai 14 digit."
const FULL_ADDRESS_REQUIRED = "Kolom alamat pondok wajib untuk diisi."
const PROVINCE_REQUIRED = "Kolom provinsi wajib untuk dipilih."
const REGENCY_REQUIRED = "Kolom kabupaten wajib untuk dipilih."
const DISTRICT_REQUIRED = "Kolom kecamatan wajib untuk dipilih."

// PHP `is_numeric`
const NUMERIC = /^[+-]?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?$/

/** A multipart upload, narrowed to what the legacy `file|max|mimes` rules look at. */
export type UploadedImage = {
	originalname: string
	mimetype: string
	size: number
}

type ImageRule = {
	/** Laravel `max:` — kilobytes. */
	maxKb: number
	/** Laravel `mimes:` — the extension list, printed as-is in the message. */
	extensions: string[]
	mimeTypes: string[]
	/** `:Attribute` after Laravel capitalises the attribute name. */
	label: string
}

const IMAGE_RULES: Record<"logo" | "favicon", ImageRule> = {
	logo: {
		maxKb: 500,
		extensions: ["jpeg", "jpg", "png", "gif", "svg"],
		mimeTypes: ["image/jpeg", "image/pjpeg", "image/png", "image/gif", "image/svg+xml"],
		label: "Logo",
	},
	favicon: {
		maxKb: 250,
		extensions: ["jpeg", "jpg", "png", "gif", "svg", "ico"],
		mimeTypes: [
			"image/jpeg",
			"image/pjpeg",
			"image/png",
			"image/gif",
			"image/svg+xml",
			"image/x-icon",
			"image/vnd.microsoft.icon",
		],
		label: "Favicon",
	},
}

const extensionOf = (name: string): string => name.slice(name.lastIndexOf(".") + 1).toLowerCase()

/**
 * The `file|max|mimes` rules, which zod cannot see: multer keeps the upload out of the body.
 * Rules run in `rules()` order (logo, then favicon) so the messages line up with legacy.
 * Note: the size is checked here and not through multer `limits`, which answers with an
 * English 413 that names no field.
 */
export const schoolFileErrors = (files: {
	logo?: UploadedImage | undefined
	favicon?: UploadedImage | undefined
}): FieldErrors => {
	const errors: FieldErrors = {}

	for (const field of ["logo", "favicon"] as const) {
		const file = files[field]
		if (!file) continue

		const rule = IMAGE_RULES[field]
		const messages: string[] = []

		// Laravel compares kilobytes, so exactly `maxKb` still passes
		if (file.size / 1024 > rule.maxKb) {
			messages.push(`${rule.label} maksimal berukuran ${rule.maxKb} kilobita.`)
		}

		const mime = file.mimetype.split(";")[0]?.trim().toLowerCase() ?? ""
		const matchesMime = rule.mimeTypes.includes(mime)
		const matchesExtension = rule.extensions.includes(extensionOf(file.originalname))
		if (!matchesMime && !matchesExtension) {
			messages.push(`${rule.label} harus berupa berkas berjenis: ${rule.extensions.join(", ")}.`)
		}

		if (messages.length > 0) errors[field] = messages
	}

	return errors
}

/** Zod issues in schema order → the `{ field: [pesan] }` shape `throwFieldErrors` produces. */
export const fieldErrorsFromZod = (error: z.ZodError): FieldErrors =>
	error.issues.reduce<Record<string, string[]>>((acc, issue) => {
		const key = issue.path.map((part) => String(part)).join(".") || "unknown"
		acc[key] = [...(acc[key] ?? []), issue.message]
		return acc
	}, {})

/** PHP truthiness of the legacy `empty_logo` / `empty_favicon` hidden inputs ("0" is falsy). */
export const isTruthyFlag = (value: string): boolean =>
	value !== "" && value !== "0" && value !== "false"

// Every field falls back to an empty string rather than failing, so all rules run in `rules()`
// order in one check, like Laravel validating each field independently.
const text = z.string().trim().catch("")

export const AdminSchoolUpdateSchema = z
	.object({
		name: text,
		slogan: text,
		phone: text,
		fullAddress: text,
		provinceId: text,
		regencyId: text,
		districtId: text,
		emptyLogo: text,
		emptyFavicon: text,
	})
	.superRefine((body, ctx) => {
		const required = (field: "name" | "fullAddress" | "provinceId" | "regencyId" | "districtId", message: string): void => {
			if (body[field] === "") ctx.addIssue({ code: "custom", path: [field], message })
		}

		// name: required|string — slogan is `nullable`, so it has no rule of its own
		required("name", NAME_REQUIRED)

		// phone: bail|nullable|numeric|min:1|digits_between:7,14
		if (body.phone !== "") {
			if (!NUMERIC.test(body.phone)) {
				ctx.addIssue({ code: "custom", path: ["phone"], message: PHONE_NUMERIC })
			} else if (Number(body.phone) < 1) {
				ctx.addIssue({ code: "custom", path: ["phone"], message: PHONE_MIN })
			} else if (/[^0-9]/.test(body.phone) || body.phone.length < 7 || body.phone.length > 14) {
				ctx.addIssue({ code: "custom", path: ["phone"], message: PHONE_DIGITS_BETWEEN })
			}
		}

		required("fullAddress", FULL_ADDRESS_REQUIRED)
		required("provinceId", PROVINCE_REQUIRED)
		required("regencyId", REGENCY_REQUIRED)
		required("districtId", DISTRICT_REQUIRED)
	})

export class AdminSchoolUpdateDto extends createZodDto(AdminSchoolUpdateSchema) {}

export const AdminSchoolSettingSchema = z.object({
	id: z.number(),
	name: z.string().nullable(),
	slogan: z.string().nullable(),
	/** Stored without the 62 prefix, which the form shows as a static addon. */
	phone: z.string().nullable(),
	provinceId: z.number().nullable(),
	regencyId: z.number().nullable(),
	districtId: z.number().nullable(),
	fullAddress: z.string().nullable(),
	/** The stored key — psb and santri read this column raw, so it is never a URL. */
	logo: z.string().nullable(),
	favicon: z.string().nullable(),
	logoUrl: z.string().nullable(),
	faviconUrl: z.string().nullable(),
})

export class AdminSchoolSettingDto extends createZodDto(AdminSchoolSettingSchema) {}
