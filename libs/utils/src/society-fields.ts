/**
 * Legacy society form field registry — which columns each `tbr_setting_forms` row writes and
 * which option values it offers. Transcribed from the legacy edit/create blades and the
 * Register form requests (admin.pondokroja.com). Shared by the admin form, the server rules,
 * the print page and the exports.
 *
 * Sources (admin.pondokroja.com):
 * - resources/views/{registrant,student,alumni}/partials/edit/data/{personal,identity,family,guardian,attachment}.blade.php
 * - resources/views/{registrant,student}/create/data/*.blade.php (wizard)
 * - app/Http/Requests/Register/{Personal,Identity,Family,Guardian,Attachment,Update}Request.php
 *   (Student/* extend these; Alumni\AlumniRequest extends Student\UpdateRequest — same rules everywhere)
 * - app/Http/Traits/Requests/{IsRequired,PersonalRequest}.php, app/Traits/Imports/ReusableColumnData.php,
 *   app/Helpers/Helper.php (getInputStatus / getInputLabel / formInfoText / get*Name code maps)
 *
 * Structural rules the setting row does not spell out:
 * - Visibility: a field renders only when `status` is true (`getInputStatus`). When hidden the server
 *   rule for every column of the field is `prohibited` (IsRequired::isRequired).
 * - Required (admin form): `admin_required` ? `required` : `nullable`. The help text next to the label is
 *   "required" / "optional" from the same flag (`formInfoText`). Label = `custom_name ?? default`.
 *   Rich-text fields (ids 30, 33, 35) use RequiredSummernote: empty or "<p><br></p>" counts as empty.
 * - The same registry applies to registrant (tbr_registrants), student (tbr_student_grades) and alumni
 *   (tbr_alumnis): every input name and every option value is identical across the three edit partials.
 *   Only the registrant edit disables the inputs when `registered_by_admin` is false; in that case
 *   Register\UpdateRequest validates only `is_blocked` and the disease history is not rewritten.
 * - Accordion labels (22, 29, 31, 34, 36, 51, 53, 61) are not rendered as headings in the edit/create
 *   blades; 29, 34, 51, 61 only lend their label to 30, 35, 52, 62 (see `labelId`).
 * - Dates: datepicker text input shown/posted as d-m-Y, stored as Y-m-d (`date` column).
 * - Phones (widget "phone"): a static "62" prefix is shown before a type=number input; the stored value
 *   has no prefix (bigint). Rule: numeric, min:1, digits_between:7,14. Print renders "+62 <number>".
 * - Address groups: province -> regency -> district are cascading selects over tbr_provinces /
 *   tbr_regencies / tbr_districts (bigint ids posted as strings, rule numeric|min:1); the rest are free
 *   text (rule string). See SOCIETY_ADDRESS_GROUPS.
 * - Disease history (id 28) is a repeater stored in tbr_disease_histories, not on the society row.
 *   See SOCIETY_DISEASE_HISTORY.
 * - Attachments (63–69): see SOCIETY_ATTACHMENT_RULES.
 * - The print page does NOT use the blade labels below for every value: it uses
 *   app/Traits/Models/SocietyGetterTrait.php (e.g. step_child prints "Anak Angkat", normal vision prints
 *   "Normal / Tidak Berkacamata") or ucwords/strtoupper of the raw value.
 */
export type SocietyStep = "personal" | "identity" | "family" | "guardian" | "attachment"

/** Legacy `tbr_setting_forms.group` for each step. */
export const SOCIETY_STEP_GROUPS: Readonly<Record<SocietyStep, string>> = {
	personal: "personal data",
	identity: "identity data",
	family: "family data",
	guardian: "guardian data",
	attachment: "attachment data",
}

export type SocietyFieldOption = {
	value: string
	label: string
	/** Numeric code used by the legacy Excel import template for this value (Helper.php get*Name). */
	code?: string
}

/**
 * The control the legacy edit blade actually renders. The setting `type` is not always accurate
 * (e.g. id 52 is "basic input" but renders an address group, ids 14–18 are "input number" but render
 * type=text, id 28 is "basic input" but renders the disease repeater).
 */
export type SocietyFieldWidget =
	| "label"
	| "text"
	| "textarea"
	| "richtext"
	| "number"
	| "number-pair"
	| "phone"
	| "select"
	| "radio"
	| "date"
	| "address"
	| "school-address"
	| "disease-repeater"
	| "image"

export type SocietyField = {
	/** `tbr_setting_forms.id` */
	id: number
	step: SocietyStep
	/** Legacy `tbr_setting_forms.type` (paragraph, basic input, input number, radio button, checkbox, datepicker, combo box, address group, location group, upload, texteditor, accordion label). */
	type: string
	/** Form input names / DB columns this field writes, in legacy DOM order. Empty for accordion labels. */
	columns: readonly string[]
	/** Radio / select / checkbox values exactly as the blade posts them, with the label the blade shows. */
	options?: readonly SocietyFieldOption[]
	/** Where a society deviates (e.g. alumni uses a different column name), keyed by society. */
	columnsBySociety?: Partial<Record<"registrant" | "student" | "alumni", readonly string[]>>
	/** One line on anything a UI or validator must know that the setting row does not say
	 *  (e.g. "phone input shows a 62 prefix", "jilid_chapter required_if reading=jilid",
	 *  "disease repeater: disease_name[] + disease_status[], max 20 rows"). */
	note?: string
	/** Added: the control the legacy edit blade renders (always set in SOCIETY_FIELDS). */
	widget?: SocietyFieldWidget
	/** Added: setting id whose label (custom_name ?? default) the blade shows, when not the field's own id. */
	labelId?: number
	/** Added: input placeholders exactly as in the blade, keyed by column. */
	placeholders?: Readonly<Record<string, string>>
	/** Added: static text shown before the input (the "62" phone prefix). Not part of the stored value. */
	prefix?: string
	/** Added: set when `columns` live in another table than the society row (only id 28). */
	table?: "tbr_disease_histories"
}

export const SOCIETY_RELIGION_OPTIONS: readonly SocietyFieldOption[] = [
	{ value: "islam", label: "Islam", code: "1" },
	{ value: "kristen", label: "Kristen", code: "2" },
	{ value: "katolik", label: "Katolik", code: "3" },
	{ value: "hindu", label: "Hindu", code: "4" },
	{ value: "buddha", label: "Buddha", code: "5" },
	{ value: "konghucu", label: "Konghucu", code: "6" },
]

export const SOCIETY_EDUCATION_OPTIONS: readonly SocietyFieldOption[] = [
	{ value: "tidak sekolah", label: "Tidak Sekolah", code: "1" },
	{ value: "sd", label: "SD", code: "2" },
	{ value: "smp", label: "SMP", code: "3" },
	{ value: "sma", label: "SMA", code: "4" },
	{ value: "diploma", label: "Diploma", code: "5" },
	{ value: "s1", label: "S1", code: "6" },
	{ value: "s2", label: "S2", code: "7" },
	{ value: "s3", label: "S3", code: "8" },
]

export const SOCIETY_DISEASE_STATUS_OPTIONS: readonly SocietyFieldOption[] = [
	{ value: "sembuh", label: "Sembuh", code: "1" },
	{ value: "masa perawatan", label: "Masa Perawatan", code: "2" },
	{ value: "belum sembuh", label: "Belum Sembuh", code: "3" },
]

const ADDRESS_PLACEHOLDERS = (prefix: string): Readonly<Record<string, string>> => ({
	[`${prefix}province_id`]: "Provinsi",
	[`${prefix}regency_id`]: "Kabupaten",
	[`${prefix}district_id`]: "Kecamatan",
	[`${prefix}village`]: "Kelurahan",
	[`${prefix}street`]: "Jalan",
	[`${prefix}rt`]: "RT",
	[`${prefix}rw`]: "RW",
	[`${prefix}sub_village`]: "Dusun",
})

const ADDRESS_NOTE =
	"Province/regency/district cascading selects (numeric|min:1), then village, [street, RT, RW] on one row, then sub_village (string); all share this setting's required flag"

const PHONE_NOTE = "type=number, 62 prefix shown, stored without prefix; rule numeric|min:1|digits_between:7,14"

const WHATSAPP_NOTE = `${PHONE_NOTE}; column is bigint in tbr_registrants but varchar in tbr_student_grades/tbr_alumnis`

const UPLOAD_NOTE = "image upload, accept image/jpeg, image/png, max 2 MB (rule image|max:2048); see SOCIETY_ATTACHMENT_RULES"

export const SOCIETY_FIELDS: readonly SocietyField[] = [
	// ── personal data ────────────────────────────────────────────────────────────
	{ id: 1, step: "personal", type: "basic input", columns: ["fullname"], widget: "text" },
	{ id: 2, step: "personal", type: "basic input", columns: ["shortname"], widget: "text" },
	{
		id: 3,
		step: "personal",
		type: "combo box",
		columns: ["religion"],
		options: SOCIETY_RELIGION_OPTIONS,
		widget: "select",
		note: "select2 with an empty \"Select\" option",
	},
	{
		id: 4,
		step: "personal",
		type: "radio button",
		columns: ["gender"],
		options: [
			{ value: "male", label: "Laki - Laki", code: "1" },
			{ value: "female", label: "Perempuan", code: "2" },
		],
		widget: "radio",
		note: "male is pre-checked unless the stored value is female",
	},
	{ id: 5, step: "personal", type: "basic input", columns: ["place_of_birth"], widget: "text" },
	{
		id: 6,
		step: "personal",
		type: "datepicker",
		columns: ["date_of_birth"],
		widget: "date",
		note: "text input with datepicker, shown/posted as d-m-Y, stored Y-m-d; rule only string",
	},
	{
		id: 7,
		step: "personal",
		type: "radio button",
		columns: ["nationality"],
		options: [
			{ value: "wni", label: "WNI", code: "1" },
			{ value: "wna", label: "WNA", code: "2" },
		],
		widget: "radio",
		note: "wni is pre-checked unless the stored value is wna; rule only string (no in:)",
	},
	{
		id: 8,
		step: "personal",
		type: "radio button",
		columns: ["live_with"],
		options: [
			{ value: "parent", label: "Orang Tua", code: "1" },
			{ value: "guardian", label: "Wali", code: "2" },
		],
		widget: "radio",
		note: "parent is pre-checked unless the stored value is guardian",
	},
	{
		id: 9,
		step: "personal",
		type: "input number",
		columns: ["sibling_order", "number_of_sibling"],
		widget: "number-pair",
		placeholders: { sibling_order: "Ke", number_of_sibling: "Dari" },
		note: "two type=number min=1 inputs side by side; both use this setting's required flag, rule string; required message \"Kolom anak ke dan dari wajib untuk diisi.\"",
	},
	{
		id: 10,
		step: "personal",
		type: "combo box",
		columns: ["parent_status"],
		options: [
			{ value: "father&mother", label: "Ayah & Ibu", code: "1" },
			{ value: "fatherless", label: "Yatim", code: "2" },
			{ value: "motherless", label: "Piatu", code: "3" },
			{ value: "orphan", label: "Yatim Piatu", code: "4" },
		],
		widget: "select",
		note: "blade offers 4 options although the setting helper lists only 3",
	},
	{
		id: 11,
		step: "personal",
		type: "combo box",
		columns: ["child_status"],
		options: [
			{ value: "biological_child", label: "Anak Kandung", code: "1" },
			{ value: "step_child", label: "Anak Tiri", code: "2" },
			{ value: "adopted_child", label: "Anak Angkat", code: "3" },
		],
		widget: "select",
	},
	{
		id: 12,
		step: "personal",
		type: "input number",
		columns: ["phone"],
		widget: "phone",
		prefix: "62",
		note: PHONE_NOTE,
	},
	{
		id: 13,
		step: "personal",
		type: "address group",
		columns: [
			"province_id",
			"regency_id",
			"district_id",
			"village",
			"street",
			"rt",
			"rw",
			"sub_village",
		],
		widget: "address",
		placeholders: ADDRESS_PLACEHOLDERS(""),
		note: ADDRESS_NOTE,
	},
	{
		id: 14,
		step: "personal",
		type: "input number",
		columns: ["nisn"],
		widget: "text",
		note: "rendered type=text, rule string, varchar column",
	},
	{
		id: 15,
		step: "personal",
		type: "input number",
		columns: ["nik"],
		widget: "text",
		note: "rendered type=text, rule string, varchar column",
	},
	{
		id: 16,
		step: "personal",
		type: "input number",
		columns: ["ksp"],
		widget: "text",
		note: "rendered type=text, rule string; custom_name repurposed (\"Dapat informasi Pondok Roja dari mana?\") but still writes ksp",
	},
	{
		id: 17,
		step: "personal",
		type: "input number",
		columns: ["kip"],
		widget: "text",
		note: "rendered type=text, rule string; custom_name repurposed (\"Alasan mendaftar di Pondok Roja?\") but still writes kip",
	},
	{
		id: 18,
		step: "personal",
		type: "input number",
		columns: ["certificate_number"],
		widget: "text",
		note: "rendered type=text, rule string; custom_name repurposed (\"Kelas saat mendaftar di Pondok Roja\") but still writes certificate_number",
	},
	{
		id: 19,
		step: "personal",
		type: "basic input",
		columns: ["school_name"],
		widget: "text",
		note: "blade has type=\"school_name\" (invalid, browser falls back to text)",
	},
	{
		id: 20,
		step: "personal",
		type: "input number",
		columns: ["school_phone"],
		widget: "phone",
		prefix: "62",
		note: PHONE_NOTE,
	},
	{
		id: 21,
		step: "personal",
		type: "location group",
		columns: [
			"school_province_id",
			"school_regency_id",
			"school_district_id",
			"school_address_detail",
			"school_postal_code",
		],
		widget: "school-address",
		placeholders: {
			school_province_id: "Provinsi",
			school_regency_id: "Kabupaten",
			school_district_id: "Kecamatan",
			school_address_detail: "Detail Alamat",
			school_postal_code: "Kode POS",
		},
		note: "only these 5 inputs although the helper also lists Kelurahan/Jalan/Dusun; ids numeric|min:1, detail string, postal code type=number min=1 numeric|min:1 (bigint)",
	},

	// ── identity data ────────────────────────────────────────────────────────────
	{
		id: 22,
		step: "identity",
		type: "accordion label",
		columns: [],
		widget: "label",
		note: "heads 23–28; not rendered in the edit/create blades",
	},
	{
		id: 23,
		step: "identity",
		type: "basic input",
		columns: ["weight", "height"],
		widget: "number-pair",
		placeholders: { weight: "Kg", height: "Cm" },
		note: "two type=number min=1 inputs (weight first); rule numeric|min:1 (bigint); legacy error attribute for height wrongly uses label 24",
	},
	{
		id: 24,
		step: "identity",
		type: "combo box",
		columns: ["blood_type"],
		options: [
			{ value: "a", label: "A", code: "1" },
			{ value: "ab", label: "AB", code: "2" },
			{ value: "b", label: "B", code: "3" },
			{ value: "o", label: "O", code: "4" },
		],
		widget: "select",
		note: "half-width select2 (col-md-6)",
	},
	{
		id: 25,
		step: "identity",
		type: "radio button",
		columns: ["visual_condition"],
		options: [
			{ value: "normal", label: "Normal", code: "1" },
			{ value: "abnormal", label: "Tidak Normal / Berkacamata", code: "2" },
		],
		widget: "radio",
		note: "normal is pre-checked unless the stored value is abnormal",
	},
	{
		id: 26,
		step: "identity",
		type: "radio button",
		columns: ["hearing_condition"],
		options: [
			{ value: "normal", label: "Normal", code: "1" },
			{ value: "abnormal", label: "Kurang Peka Suara", code: "2" },
		],
		widget: "radio",
		note: "normal is pre-checked unless the stored value is abnormal",
	},
	{
		id: 27,
		step: "identity",
		type: "combo box",
		columns: ["immunization_given"],
		options: [
			{ value: "complete", label: "Lengkap", code: "1" },
			{ value: "incomplete", label: "Tidak Lengkap", code: "2" },
			{ value: "not_at_all", label: "Tidak Imunisasi", code: "3" },
		],
		widget: "select",
	},
	{
		id: 28,
		step: "identity",
		type: "basic input",
		columns: ["disease_name", "disease_status"],
		options: SOCIETY_DISEASE_STATUS_OPTIONS,
		widget: "disease-repeater",
		table: "tbr_disease_histories",
		placeholders: { disease_name: "Nama Penyakit" },
		note: "disease repeater: disease_name[] + disease_status[] (options = status select), max 20 rows, first row not removable, label without required/optional text; writes tbr_disease_histories (see SOCIETY_DISEASE_HISTORY)",
	},
	{
		id: 29,
		step: "identity",
		type: "accordion label",
		columns: [],
		widget: "label",
		note: "its label is shown above id 30 (learning_achievment)",
	},
	{
		id: 30,
		step: "identity",
		type: "basic input",
		columns: ["learning_achievment"],
		widget: "richtext",
		labelId: 29,
		note: "summernote textarea (column name misspelt in legacy); required via RequiredSummernote; no required/optional help text",
	},
	{
		id: 31,
		step: "identity",
		type: "accordion label",
		columns: [],
		widget: "label",
		note: "heads 32–33; not rendered in the edit/create blades",
	},
	{
		id: 32,
		step: "identity",
		type: "radio button",
		columns: ["reading", "jilid_chapter"],
		options: [
			{ value: "jilid", label: "Jilid", code: "1" },
			{ value: "quran", label: "Baca Al-Qur'an", code: "2" },
		],
		widget: "radio",
		placeholders: { jilid_chapter: "Sudah jilid berapa?" },
		note: "jilid pre-checked unless quran; jilid_chapter text input shown only when reading=jilid, rule required_if:reading,jilid regardless of setting",
	},
	{
		id: 33,
		step: "identity",
		type: "basic input",
		columns: ["quran_memorizing"],
		widget: "textarea",
		placeholders: { quran_memorizing: "Contoh : Juz 29, 30, Surat Al Waqi’ah s.d. An-Naas" },
		note: "plain textarea rows=3, not resizable; required check still uses RequiredSummernote",
	},
	{
		id: 34,
		step: "identity",
		type: "accordion label",
		columns: [],
		widget: "label",
		note: "its label is shown above id 35 (gift)",
	},
	{
		id: 35,
		step: "identity",
		type: "basic input",
		columns: ["gift"],
		widget: "richtext",
		labelId: 34,
		note: "summernote textarea; required via RequiredSummernote; no required/optional help text",
	},

	// ── family data ──────────────────────────────────────────────────────────────
	{
		id: 36,
		step: "family",
		type: "accordion label",
		columns: [],
		widget: "label",
		note: "heads 37–50; not rendered in the edit/create blades",
	},
	{ id: 37, step: "family", type: "basic input", columns: ["father_fullname"], widget: "text" },
	{
		id: 38,
		step: "family",
		type: "combo box",
		columns: ["father_religion"],
		options: SOCIETY_RELIGION_OPTIONS,
		widget: "select",
		note: "the create wizard labels katolik as \"Khatolik\"",
	},
	{
		id: 39,
		step: "family",
		type: "basic input",
		columns: ["father_nationality"],
		widget: "text",
		note: "free text (not the WNI/WNA radio of id 7)",
	},
	{
		id: 40,
		step: "family",
		type: "combo box",
		columns: ["father_last_education"],
		options: SOCIETY_EDUCATION_OPTIONS,
		widget: "select",
	},
	{
		id: 41,
		step: "family",
		type: "input number",
		columns: ["father_phone"],
		widget: "phone",
		prefix: "62",
		note: PHONE_NOTE,
	},
	{
		id: 42,
		step: "family",
		type: "input number",
		columns: ["father_whatsapp"],
		widget: "phone",
		prefix: "62",
		note: WHATSAPP_NOTE,
	},
	{ id: 43, step: "family", type: "basic input", columns: ["father_job"], widget: "text" },
	{ id: 44, step: "family", type: "basic input", columns: ["mother_fullname"], widget: "text" },
	{
		id: 45,
		step: "family",
		type: "combo box",
		columns: ["mother_religion"],
		options: SOCIETY_RELIGION_OPTIONS,
		widget: "select",
		note: "the create wizard labels katolik as \"Khatolik\"",
	},
	{
		id: 46,
		step: "family",
		type: "basic input",
		columns: ["mother_nationality"],
		widget: "text",
		note: "free text",
	},
	{
		id: 47,
		step: "family",
		type: "combo box",
		columns: ["mother_last_education"],
		options: SOCIETY_EDUCATION_OPTIONS,
		widget: "select",
	},
	{
		id: 48,
		step: "family",
		type: "input number",
		columns: ["mother_phone"],
		widget: "phone",
		prefix: "62",
		note: PHONE_NOTE,
	},
	{
		id: 49,
		step: "family",
		type: "input number",
		columns: ["mother_whatsapp"],
		widget: "phone",
		prefix: "62",
		note: WHATSAPP_NOTE,
	},
	{ id: 50, step: "family", type: "basic input", columns: ["mother_job"], widget: "text" },
	{
		id: 51,
		step: "family",
		type: "accordion label",
		columns: [],
		widget: "label",
		note: "its label is shown above id 52 (parents' address)",
	},
	{
		id: 52,
		step: "family",
		type: "basic input",
		columns: [
			"family_province_id",
			"family_regency_id",
			"family_district_id",
			"family_village",
			"family_street",
			"family_rt",
			"family_rw",
			"family_sub_village",
		],
		widget: "address",
		labelId: 51,
		placeholders: ADDRESS_PLACEHOLDERS("family_"),
		note: `setting type says basic input but the blade renders an address group. ${ADDRESS_NOTE}`,
	},

	// ── guardian data ────────────────────────────────────────────────────────────
	{
		id: 53,
		step: "guardian",
		type: "accordion label",
		columns: [],
		widget: "label",
		note: "heads 54–60; not rendered in the edit/create blades",
	},
	{ id: 54, step: "guardian", type: "basic input", columns: ["guardian_fullname"], widget: "text" },
	{
		id: 55,
		step: "guardian",
		type: "combo box",
		columns: ["guardian_religion"],
		options: SOCIETY_RELIGION_OPTIONS,
		widget: "select",
	},
	{
		id: 56,
		step: "guardian",
		type: "basic input",
		columns: ["guardian_nationality"],
		widget: "text",
		note: "free text",
	},
	{
		id: 57,
		step: "guardian",
		type: "combo box",
		columns: ["guardian_last_education"],
		options: SOCIETY_EDUCATION_OPTIONS,
		widget: "select",
	},
	{
		id: 58,
		step: "guardian",
		type: "input number",
		columns: ["guardian_phone"],
		widget: "phone",
		prefix: "62",
		note: PHONE_NOTE,
	},
	{
		id: 59,
		step: "guardian",
		type: "input number",
		columns: ["guardian_whatsapp"],
		widget: "phone",
		prefix: "62",
		note: WHATSAPP_NOTE,
	},
	{ id: 60, step: "guardian", type: "basic input", columns: ["guardian_job"], widget: "text" },
	{
		id: 61,
		step: "guardian",
		type: "accordion label",
		columns: [],
		widget: "label",
		note: "its label is shown above id 62 (guardian address)",
	},
	{
		id: 62,
		step: "guardian",
		type: "address group",
		columns: [
			"guardian_province_id",
			"guardian_regency_id",
			"guardian_district_id",
			"guardian_village",
			"guardian_street",
			"guardian_rt",
			"guardian_rw",
			"guardian_sub_village",
		],
		widget: "address",
		labelId: 61,
		placeholders: ADDRESS_PLACEHOLDERS("guardian_"),
		note: ADDRESS_NOTE,
	},

	// ── attachment data ──────────────────────────────────────────────────────────
	{
		id: 63,
		step: "attachment",
		type: "upload",
		columns: ["attach_certificate"],
		widget: "image",
		note: UPLOAD_NOTE,
	},
	{
		id: 64,
		step: "attachment",
		type: "upload",
		columns: ["attach_photo"],
		widget: "image",
		note: `${UPLOAD_NOTE}; extra hint line "Foto yang diupload harus dengan ukuran 3 x 4 cm"`,
	},
	{
		id: 65,
		step: "attachment",
		type: "upload",
		columns: ["attach_family_card"],
		widget: "image",
		note: UPLOAD_NOTE,
	},
	{
		id: 66,
		step: "attachment",
		type: "upload",
		columns: ["attach_ksp"],
		widget: "image",
		note: `${UPLOAD_NOTE}; custom_name repurposed (payment proof "Bukti pembayaran Pendaftaran ...") but still writes attach_ksp`,
	},
	{
		id: 67,
		step: "attachment",
		type: "upload",
		columns: ["attach_kip"],
		widget: "image",
		note: UPLOAD_NOTE,
	},
	{
		id: 68,
		step: "attachment",
		type: "upload",
		columns: ["attach_report_card"],
		widget: "image",
		note: UPLOAD_NOTE,
	},
	{
		id: 69,
		step: "attachment",
		type: "upload",
		columns: ["attach_birth_certificate"],
		widget: "image",
		note: UPLOAD_NOTE,
	},
]

export const getSocietyField = (id: number): SocietyField | undefined =>
	SOCIETY_FIELDS.find((field) => field.id === id)

const collectSocietyColumns = (fields: readonly SocietyField[]): string[] => {
	const seen = new Set<string>()
	for (const field of fields) {
		if (field.table) continue
		for (const column of field.columns) seen.add(column)
		for (const columns of Object.values(field.columnsBySociety ?? {})) {
			for (const column of columns ?? []) seen.add(column)
		}
	}
	// Not `[...seen]`: the API bundle compiles libs in SWC loose mode, which turns a Set spread
	// into `[].concat(seen)` — a one-element array holding the Set.
	return Array.from(seen)
}

/** Every column the society form can write (union over all fields), for SELECT lists. */
export const SOCIETY_COLUMNS: readonly string[] = collectSocietyColumns(SOCIETY_FIELDS)

/** Sub-columns of the four address-like groups, keyed by role. */
export type SocietyAddressGroup = {
	/** Setting id that controls visibility / required for every sub-column. */
	settingId: number
	/** Setting id whose label is shown above the group. */
	labelId: number
	province: string
	regency: string
	district: string
	village?: string
	street?: string
	rt?: string
	rw?: string
	subVillage?: string
	/** School address only: free-text "Detail Alamat". */
	detail?: string
	/** School address only: type=number "Kode POS" (bigint). */
	postalCode?: string
}

export const SOCIETY_ADDRESS_GROUPS: readonly SocietyAddressGroup[] = [
	{
		settingId: 13,
		labelId: 13,
		province: "province_id",
		regency: "regency_id",
		district: "district_id",
		village: "village",
		street: "street",
		rt: "rt",
		rw: "rw",
		subVillage: "sub_village",
	},
	{
		settingId: 21,
		labelId: 21,
		province: "school_province_id",
		regency: "school_regency_id",
		district: "school_district_id",
		detail: "school_address_detail",
		postalCode: "school_postal_code",
	},
	{
		settingId: 52,
		labelId: 51,
		province: "family_province_id",
		regency: "family_regency_id",
		district: "family_district_id",
		village: "family_village",
		street: "family_street",
		rt: "family_rt",
		rw: "family_rw",
		subVillage: "family_sub_village",
	},
	{
		settingId: 62,
		labelId: 61,
		province: "guardian_province_id",
		regency: "guardian_regency_id",
		district: "guardian_district_id",
		village: "guardian_village",
		street: "guardian_street",
		rt: "guardian_rt",
		rw: "guardian_rw",
		subVillage: "guardian_sub_village",
	},
]

export type SocietyDiseaseHistory = {
	settingId: number
	table: "tbr_disease_histories"
	/** Posted array input names, one entry per repeater row (same index = same row). */
	nameInput: string
	statusInput: string
	nameColumn: string
	statusColumn: string
	/** `tbr_disease_histories.society` value and the table whose `id` goes into `society_id`. */
	society: Readonly<Record<"registrant" | "student" | "alumni", { value: string; idFrom: string }>>
	maxRows: number
	namePlaceholder: string
	addButtonLabel: string
	statusOptions: readonly SocietyFieldOption[]
	/** Server rules per row; `<required>` is the IsRequired result for setting 28. */
	rules: Readonly<Record<string, string>>
}

/**
 * Disease history repeater (setting 28). Legacy save = delete every row for (society, society_id), then
 * insert one row per posted index unless both name and status are empty. Registrant: only when
 * registered_by_admin. Student rows hang off tbr_student_grades.id (copied when a grade is duplicated).
 * Legacy quirk: the alumni page's "Tambah Penyakit" button is dead (alumni/edit-disease-history.js binds
 * .tbr_add_location_service); student/registrant pages add rows up to maxRows.
 */
export const SOCIETY_DISEASE_HISTORY: SocietyDiseaseHistory = {
	settingId: 28,
	table: "tbr_disease_histories",
	nameInput: "disease_name[]",
	statusInput: "disease_status[]",
	nameColumn: "disease_name",
	statusColumn: "disease_status",
	society: {
		registrant: { value: "registrant", idFrom: "tbr_registrants.id" },
		student: { value: "student", idFrom: "tbr_student_grades.id" },
		alumni: { value: "alumni", idFrom: "tbr_alumnis.id" },
	},
	maxRows: 20,
	namePlaceholder: "Nama Penyakit",
	addButtonLabel: "Tambah Penyakit",
	statusOptions: SOCIETY_DISEASE_STATUS_OPTIONS,
	rules: {
		"disease_name.*": "bail|<required>|string",
		"disease_status.*": "bail|<required>|string|in:sembuh,masa perawatan,belum sembuh",
	},
}

/**
 * Attachment inputs (settings 63–69). Legacy client check (public/assets/js/max-file-size.js): a file
 * over 2 MB is cleared and "Foto maksimal berukuran 2 MB." is shown under the input. Server rule:
 * bail|<required>|image|max:2048. Stored on the public disk as "Y/m/d/<md5(name+rand5)>.<ext>"; an empty
 * input keeps the existing path (array_filter). Each input has download + open-in-new-tab preview links.
 * Legacy quirk: the student edit blade's size-error span for attach_photo has data-name="attach_certificate".
 */
export const SOCIETY_ATTACHMENT_RULES = {
	accept: "image/jpeg, image/png",
	maxBytes: 2 * 1024 * 1024,
	maxKilobytes: 2048,
	tooLargeMessage: "Foto maksimal berukuran 2 MB.",
	hint: "Foto yang diupload harus berextensi .jpg, jpeg, dan .png.",
	requiredMessage: "Kolom :attribute wajib untuk upload file.",
	emptyLabel: "Choose file",
} as const
