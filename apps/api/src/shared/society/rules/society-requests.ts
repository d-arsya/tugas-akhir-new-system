import type { SocietyStepKey } from "@roja/types"
import { SOCIETY_DISEASE_STATUS_OPTIONS, getSocietyField } from "@roja/utils/society-fields"

import type { FieldSpec, Rule, RuleSet } from "./rule-types"

// OWNER: AK-A. The legacy step requests, transcribed rule by rule (order = legacy `rules()` order):
//   L/app/Http/Requests/Register/{Personal,Identity,Family,Guardian,Attachment}Request.php
//   L/app/Http/Traits/Requests/IsRequired.php (status off → prohibited; admin_required → required : nullable)
//   L/app/Http/Traits/Requests/GroupPassValidation.php (`getFormLabel` = Str::lower(custom_name ?? default))

/** One `tbr_setting_forms` row as the rules read it. */
export type SettingForm = { id: number; status: boolean; adminRequired: boolean; label: string | null }
export type SettingForms = ReadonlyMap<number, SettingForm>

const CHOOSE = "Kolom :attribute wajib untuk dipilih."

export const R = {
	required: { name: "required" },
	nullable: { name: "nullable" },
	string: { name: "string" },
	numeric: { name: "numeric" },
	email: { name: "email" },
	boolean: { name: "boolean" },
	confirmed: { name: "confirmed" },
	image: { name: "image" },
	min1: { name: "min", value: 1 },
	phoneDigits: { name: "digits_between", min: 7, max: 14 },
	in: (values: readonly string[]): Rule => ({ name: "in", values }),
} as const satisfies Record<string, Rule | ((values: readonly string[]) => Rule)>

/** `IsRequired::isRequired($setting_forms, $id, $isSummernote)` */
export const isRequired = (settings: SettingForms, id: number, summernote = false): Rule => {
	const setting = settings.get(id)
	if (!setting?.status) return { name: "prohibited" }
	if (!setting.adminRequired) return R.nullable
	return summernote ? { name: "required_summernote" } : R.required
}

/** `GroupPassValidation::getFormLabel` — lower-cased `custom_name ?? default` ("" when both are empty). */
export const formLabel = (settings: SettingForms, id: number): string => (settings.get(id)?.label ?? "").toLowerCase()

/** The option values a field posts, from the registry (identical to the legacy `in:` lists). */
const optionValues = (id: number): string[] => (getSocietyField(id)?.options ?? []).map((option) => option.value)

export const field = (name: string, step: SocietyStepKey | null, rules: Rule[], bail = false): FieldSpec =>
	bail ? { field: name, step, rules, bail } : { field: name, step, rules }

const chooseMessages = (fields: string[]): Record<string, string> =>
	Object.fromEntries(fields.map((name) => [`${name}.required`, CHOOSE]))

/** `Register\PersonalRequest` */
export const personalRequest = (s: SettingForms): RuleSet => {
	const P = "personal" as const
	const req = (id: number): Rule => isRequired(s, id)
	const L = (id: number): string => formLabel(s, id)
	const phone = (name: string, id: number): FieldSpec => field(name, P, [req(id), R.numeric, R.min1, R.phoneDigits], true)
	const text = (name: string, id: number): FieldSpec => field(name, P, [req(id), R.string])
	const location = (name: string, id: number): FieldSpec => field(name, P, [req(id), R.numeric, R.min1])

	return {
		fields: [
			field("academic_year_id", P, [R.required, R.numeric]),
			field("level_id", P, [R.required, R.numeric]),
			field("registration_path", P, [R.required, R.in(["indent", "reguler"])]),
			text("fullname", 1),
			text("shortname", 2),
			field("religion", P, [req(3), R.in(optionValues(3))]),
			field("gender", P, [req(4), R.in(optionValues(4))]),
			text("place_of_birth", 5),
			text("date_of_birth", 6),
			text("nationality", 7),
			field("live_with", P, [req(8), R.in(optionValues(8))]),
			text("sibling_order", 9),
			text("number_of_sibling", 9),
			field("parent_status", P, [req(10), R.in(optionValues(10))]),
			field("child_status", P, [req(11), R.in(optionValues(11))]),
			phone("phone", 12),
			location("province_id", 13),
			location("regency_id", 13),
			location("district_id", 13),
			text("village", 13),
			text("sub_village", 13),
			text("rt", 13),
			text("rw", 13),
			text("street", 13),
			text("nisn", 14),
			text("nik", 15),
			text("ksp", 16),
			text("kip", 17),
			text("certificate_number", 18),
			text("school_name", 19),
			phone("school_phone", 20),
			location("school_province_id", 21),
			location("school_regency_id", 21),
			location("school_district_id", 21),
			text("school_address_detail", 21),
			location("school_postal_code", 21),
		],
		attributes: {
			academic_year_id: "tahun akademik",
			level_id: "jenjang",
			registration_path: "jalur pendaftaran",
			fullname: L(1),
			shortname: L(2),
			religion: L(3),
			gender: L(4),
			place_of_birth: L(5),
			date_of_birth: L(6),
			nationality: L(7),
			live_with: L(8),
			sibling_order: L(9),
			number_of_sibling: L(9),
			parent_status: L(10),
			child_status: L(11),
			phone: L(12),
			province_id: "provinsi",
			regency_id: "kabupaten",
			district_id: "kecamatan",
			village: "kelurahan",
			sub_village: "dusun",
			street: "jalan",
			nisn: L(14),
			nik: L(15),
			ksp: L(16),
			kip: L(17),
			certificate_number: L(18),
			school_name: L(19),
			school_phone: L(20),
			school_province_id: "provinsi",
			school_regency_id: "kabupaten",
			school_district_id: "kecamatan",
			school_address_detail: "detail alamat",
			school_postal_code: "kode pos",
		},
		messages: {
			// `level.required` is keyed wrongly in legacy, so `level_id` keeps the default "wajib untuk diisi"
			...chooseMessages([
				"academic_year_id",
				"level",
				"registration_path",
				"religion",
				"province_id",
				"regency_id",
				"district_id",
				"school_province_id",
				"school_regency_id",
				"school_district_id",
				"parent_status",
			]),
			"sibling_order.required": "Kolom anak ke dan dari wajib untuk diisi.",
			"number_of_sibling.required": "Kolom anak ke dan dari wajib untuk diisi.",
		},
	}
}

/** `Register\IdentityRequest` (every rule but `jilid_chapter` has `bail`) */
export const identityRequest = (s: SettingForms): RuleSet => {
	const I = "identity" as const
	const req = (id: number): Rule => isRequired(s, id)
	const L = (id: number): string => formLabel(s, id)
	const choice = (name: string, id: number): FieldSpec => field(name, I, [req(id), R.string, R.in(optionValues(id))], true)
	const richText = (name: string, id: number): FieldSpec => field(name, I, [isRequired(s, id, true), R.string], true)

	return {
		fields: [
			field("weight", I, [req(23), R.numeric, R.min1], true),
			field("height", I, [req(23), R.numeric, R.min1], true),
			choice("blood_type", 24),
			choice("visual_condition", 25),
			choice("hearing_condition", 26),
			choice("immunization_given", 27),
			field("disease_name.*", I, [req(28), R.string], true),
			field("disease_status.*", I, [req(28), R.string, R.in(SOCIETY_DISEASE_STATUS_OPTIONS.map((o) => o.value))], true),
			richText("learning_achievment", 30),
			choice("reading", 32),
			field("jilid_chapter", I, [{ name: "required_if", other: "reading", values: ["jilid"] }]),
			richText("quran_memorizing", 33),
			richText("gift", 35),
		],
		attributes: {
			weight: L(23),
			// legacy labels height with setting 24 (the blood type label)
			height: L(24),
			blood_type: L(24),
			visual_condition: L(25),
			hearing_condition: L(26),
			immunization_given: L(27),
			"disease_name.*": "nama penyakit",
			"disease_status.*": "status penyakit",
			learning_achievment: L(29),
			reading: L(32),
			jilid_chapter: "sudah jilid ke berapa?",
			quran_memorizing: L(33),
			gift: L(34),
		},
		messages: chooseMessages(["immunization_given", "blood_type", "disease_name.*", "disease_status.*"]),
	}
}

/** The family and guardian requests share one shape: people, then one address group. */
const peopleRequest = (
	s: SettingForms,
	step: "family" | "guardian",
	people: Array<{ prefix: string; firstId: number }>,
	address: { prefix: string; id: number },
	choose: string[],
): RuleSet => {
	const req = (id: number): Rule => isRequired(s, id)
	const L = (id: number): string => formLabel(s, id)
	const fields: FieldSpec[] = []
	const attributes: Record<string, string> = {}

	for (const { prefix, firstId: id } of people) {
		const columns: Array<[string, number, Rule[]]> = [
			[`${prefix}_fullname`, id, [R.string]],
			[`${prefix}_religion`, id + 1, [R.in(optionValues(id + 1))]],
			[`${prefix}_nationality`, id + 2, [R.string]],
			[`${prefix}_last_education`, id + 3, [R.in(optionValues(id + 3))]],
			[`${prefix}_phone`, id + 4, [R.numeric, R.min1, R.phoneDigits]],
			[`${prefix}_whatsapp`, id + 5, [R.numeric, R.min1, R.phoneDigits]],
			[`${prefix}_job`, id + 6, [R.string]],
		]
		for (const [name, settingId, rules] of columns) {
			fields.push(field(name, step, [req(settingId), ...rules], true))
			attributes[name] = L(settingId)
		}
	}

	const a = address.prefix
	const addressColumns: Array<[string, Rule[], string]> = [
		[`${a}_province_id`, [R.numeric, R.min1], "provinsi"],
		[`${a}_regency_id`, [R.numeric, R.min1], "kabupaten"],
		[`${a}_district_id`, [R.numeric, R.min1], "kecamatan"],
		[`${a}_village`, [R.string], "kelurahan"],
		[`${a}_sub_village`, [R.string], "dusun"],
		[`${a}_rt`, [R.string], "rt"],
		[`${a}_rw`, [R.string], "rw"],
		[`${a}_street`, [R.string], "jalan"],
	]
	for (const [name, rules, label] of addressColumns) {
		fields.push(field(name, step, [req(address.id), ...rules], true))
		attributes[name] = label
	}

	return { fields, attributes, messages: chooseMessages(choose) }
}

/** `Register\FamilyRequest` */
export const familyRequest = (s: SettingForms): RuleSet =>
	peopleRequest(
		s,
		"family",
		[
			{ prefix: "father", firstId: 37 },
			{ prefix: "mother", firstId: 44 },
		],
		{ prefix: "family", id: 52 },
		[
			"father_religion",
			"father_last_education",
			"mother_religion",
			"mother_last_education",
			"family_province_id",
			"family_regency_id",
			"family_district_id",
		],
	)

/** `Register\GuardianRequest` */
export const guardianRequest = (s: SettingForms): RuleSet =>
	peopleRequest(s, "guardian", [{ prefix: "guardian", firstId: 54 }], { prefix: "guardian", id: 62 }, [
		"guardian_religion",
		"guardian_last_education",
		"guardian_province_id",
		"guardian_regency_id",
		"guardian_district_id",
	])

/** Attachment columns with their setting id (63–69), in legacy order. */
export const ATTACHMENT_COLUMNS: ReadonlyArray<readonly [string, number]> = [
	["attach_certificate", 63],
	["attach_photo", 64],
	["attach_family_card", 65],
	["attach_ksp", 66],
	["attach_kip", 67],
	["attach_report_card", 68],
	["attach_birth_certificate", 69],
]

/** `Register\AttachmentRequest` — `bail|<required>|image|max:2048` */
export const attachmentRequest = (s: SettingForms): RuleSet => ({
	fields: ATTACHMENT_COLUMNS.map(([name, id]) =>
		field(name, "attachment", [isRequired(s, id), R.image, { name: "max", value: 2048 }], true),
	),
	attributes: Object.fromEntries(ATTACHMENT_COLUMNS.map(([name, id]) => [name, formLabel(s, id)])),
	messages: Object.fromEntries(
		ATTACHMENT_COLUMNS.map(([name]) => [`${name}.required`, "Kolom :attribute wajib untuk upload file."]),
	),
})
