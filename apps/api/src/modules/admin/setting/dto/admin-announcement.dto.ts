import { createZodDto } from "nestjs-zod"
import { z } from "zod"

// WS-B: zod schemas + createZodDto classes — legacy Setting\Announcement request rules
// (`App\Http\Requests\Setting\Announcement`: rules() + attributes()).

const SUCCESS_DESC_REQUIRED = "Kolom teks diterima wajib untuk diisi."
const FAILED_DESC_REQUIRED = "Kolom teks tidak diterima wajib untuk diisi."
const FAILED_INDENT_TEST_DESC_REQUIRED = "Kolom tes indent tidak diterima wajib untuk diisi."
const DATE_REQUIRED = "Kolom tanggal daftar ulang wajib untuk diisi."
const DATE_FORMAT = "Format tanggal harus dd/mm/yyyy"
const INFORMATION_REQUIRED = "Kolom berkas untuk daftar ulang wajib untuk diisi."

const DMY = /^(\d{2})\/(\d{2})\/(\d{4})$/

/**
 * Summernote's `isEmpty`, which `setting/annc-ajax.js` runs in the browser before submitting:
 * markup with no text and no embedded block (`<p></p>`, `<p><br></p>`) counts as empty.
 */
export const isEmptyRichText = (value: string): boolean => {
	if (/<(img|table|iframe|hr)\b/i.test(value)) return false
	return value.replace(/<[^>]*>/g, "").replace(/&nbsp;/gi, " ").trim() === ""
}

// Every field falls back to an empty string rather than failing, so all rules run in `rules()`
// order in one check, like Laravel validating each field independently.
const richText = z.string().trim().catch("")

export const SettingAnnouncementUpdateSchema = z
	.object({
		successDesc: richText,
		failedDesc: richText,
		failedIndentTestDesc: richText,
		dateStart: z.string().trim().catch(""),
		dateEnd: z.string().trim().catch(""),
		information: richText,
		additionalInformation: richText,
	})
	.superRefine((body, ctx) => {
		const required = (field: keyof typeof body, message: string): void => {
			if (isEmptyRichText(body[field])) {
				ctx.addIssue({ code: "custom", path: [field], message })
			}
		}

		// `required|string` in rules() order; both dates share the "tanggal daftar ulang" attribute
		required("successDesc", SUCCESS_DESC_REQUIRED)
		required("failedDesc", FAILED_DESC_REQUIRED)
		required("failedIndentTestDesc", FAILED_INDENT_TEST_DESC_REQUIRED)

		for (const field of ["dateStart", "dateEnd"] as const) {
			if (body[field] === "") {
				ctx.addIssue({ code: "custom", path: [field], message: DATE_REQUIRED })
			} else if (!DMY.test(body[field])) {
				// Legacy let Carbon::parse throw here and returned the raw exception in a 500
				ctx.addIssue({ code: "custom", path: [field], message: DATE_FORMAT })
			}
		}

		required("information", INFORMATION_REQUIRED)
	})

export class SettingAnnouncementUpdateDto extends createZodDto(SettingAnnouncementUpdateSchema) {}

export const SettingAnnouncementSchema = z.object({
	id: z.number(),
	successDesc: z.string().nullable(),
	failedDesc: z.string().nullable(),
	failedIndentTestDesc: z.string().nullable(),
	/** dd/mm/yyyy, like the legacy `getDateStartAttribute` accessor. */
	dateStart: z.string().nullable(),
	dateEnd: z.string().nullable(),
	information: z.string().nullable(),
	additionalInformation: z.string().nullable(),
})

export class SettingAnnouncementDto extends createZodDto(SettingAnnouncementSchema) {}
