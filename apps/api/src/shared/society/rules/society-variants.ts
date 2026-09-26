import type { EntityManager } from "typeorm"

import type { SocietyStepKey } from "@roja/types"

import type { FieldSpec, Rule, RuleSet } from "./rule-types"
import {
	ATTACHMENT_COLUMNS,
	R,
	attachmentRequest,
	familyRequest,
	field,
	formLabel,
	guardianRequest,
	identityRequest,
	personalRequest,
	type SettingForms,
} from "./society-requests"

// OWNER: AK-A. The five variants, each composed the way the legacy request classes extend each other:
//   Student\PersonalRequest            L/app/Http/Requests/Student/PersonalRequest.php
//   Register\UpdateRequest             L/app/Http/Requests/Register/UpdateRequest.php
//   Student\UpdateRequest              L/app/Http/Requests/Student/UpdateRequest.php
//   Alumni\AlumniRequest               L/app/Http/Requests/Alumni/AlumniRequest.php

export type VariantContext = {
	manager: EntityManager
	settings: SettingForms
	ignoreId: number | null
}

const without = (set: RuleSet, names: string[]): RuleSet => ({
	...set,
	fields: set.fields.filter((spec) => !names.includes(spec.field)),
})

const merge = (sets: RuleSet[], extra: Partial<RuleSet> & { fields?: FieldSpec[] } = {}): RuleSet => ({
	fields: [...sets.flatMap((set) => set.fields), ...(extra.fields ?? [])],
	attributes: Object.assign({}, ...sets.map((set) => set.attributes), extra.attributes ?? {}) as Record<string, string>,
	messages: Object.assign({}, ...sets.map((set) => set.messages), extra.messages ?? {}) as Record<string, string>,
})

/** `unique:<table>,<column>[,<ignore id>]`; `live` = `Rule::unique(...)->withoutTrashed()`. */
const unique = (
	manager: EntityManager,
	table: "tbr_registrants" | "tbr_students" | "tbr_alumnis",
	column: string,
	options: { ignoreId?: number | null; live?: boolean } = {},
): Rule => ({
	name: "unique",
	taken: async (value: string): Promise<boolean> => {
		const params: unknown[] = [value]
		let sql = `SELECT 1 FROM ${table} WHERE ${column} = $1`
		if (options.live) sql += " AND deleted_at IS NULL"
		if (options.ignoreId !== undefined && options.ignoreId !== null) {
			params.push(options.ignoreId)
			sql += ` AND id <> $${params.length}`
		}
		const rows = (await manager.query(`${sql} LIMIT 1`, params)) as unknown[]
		return rows.length > 0
	},
})

/** The `school_* / family_* / guardian_*` attribute overrides every UpdateRequest adds. */
const updateAttributes = (s: SettingForms): Record<string, string> => {
	const school = formLabel(s, 21)
	const out: Record<string, string> = {
		school_province_id: `provinsi dari ${school}`,
		school_regency_id: `kabupaten dari ${school}`,
		school_district_id: `kecamatan dari ${school}`,
		school_address_detail: `detail alamat dari ${school}`,
		school_postal_code: `kode pos dari ${school}`,
	}
	for (const [prefix, id] of [
		["family", 51],
		["guardian", 61],
	] as const) {
		const label = formLabel(s, id)
		Object.assign(out, {
			[`${prefix}_province_id`]: `provinsi dari ${label}`,
			[`${prefix}_regency_id`]: `kabupaten dari ${label}`,
			[`${prefix}_district_id`]: `kecamatan dari ${label}`,
			[`${prefix}_village`]: `kelurahan dari ${label}`,
			[`${prefix}_sub_village`]: `dusun ${label}`,
			[`${prefix}_rt`]: `rt ${label}`,
			[`${prefix}_rw`]: `rw ${label}`,
			[`${prefix}_street`]: `jalan ${label}`,
		})
	}
	return out
}

const ACCOUNT_ATTRIBUTES = { email: "email", password: "password", password_confirmation: "konfirmasi password" }

const passwordFields = (): FieldSpec[] => [
	field("password", null, [R.nullable, { name: "min", value: 8 }, R.confirmed, { name: "required_with", others: ["password_confirmation"] }], true),
	field("password_confirmation", null, [R.nullable], true),
]

/** `Student\PersonalRequest`: the register rules minus `registration_path`, plus nis / source / grade / sub_grade. */
const studentPersonalRequest = (ctx: VariantContext): RuleSet => {
	const parent = without(personalRequest(ctx.settings), ["registration_path"])
	return merge([parent], {
		fields: [
			field("nis", "personal", [R.nullable, R.numeric, { name: "digits", value: 7 }, unique(ctx.manager, "tbr_students", "nis")], true),
			field("source", "personal", [R.required, R.string]),
			field("grade", "personal", [R.required, R.string]),
			field("sub_grade", "personal", [R.nullable, R.string]),
		],
		attributes: { nis: "NISP", source: "sumber", grade: "kelas", sub_grade: "subkelas" },
		messages: {
			"nis.unique": "NISP sudah ada dalam basis data. Mohon gunakan yang lain.",
			"source.required": "Kolom :attribute wajib untuk dipilih.",
			"grade.required": "Kolom :attribute wajib untuk dipilih.",
		},
	})
}

/** The wizard step requests of a create variant, in step order. */
export const createStepSets = (
	variant: "registrant-create" | "student-create",
	ctx: VariantContext,
): Record<SocietyStepKey, RuleSet> => ({
	personal: variant === "student-create" ? studentPersonalRequest(ctx) : personalRequest(ctx.settings),
	identity: identityRequest(ctx.settings),
	family: familyRequest(ctx.settings),
	guardian: guardianRequest(ctx.settings),
	attachment: attachmentRequest(ctx.settings),
})

/** `Register\UpdateRequest`; a portal-registered row (`registered_by_admin = 0`) validates `is_blocked` only. */
export const registrantUpdateSet = (ctx: VariantContext, portalRow: boolean): RuleSet => {
	const s = ctx.settings
	const steps = [personalRequest(s), identityRequest(s), familyRequest(s), guardianRequest(s)]
	const isBlocked = field("is_blocked", null, [R.required, R.boolean])
	// `defaultRules()`; `is_blocked` has no custom attribute, so it reads "is blocked" either way
	if (portalRow) return { fields: [isBlocked], attributes: {}, messages: {} }

	return merge(steps, {
		fields: [
			field(
				"email",
				null,
				[
					R.nullable,
					R.email,
					{ name: "required_with", others: ["password"] },
					unique(ctx.manager, "tbr_registrants", "email", { ignoreId: ctx.ignoreId }),
					unique(ctx.manager, "tbr_students", "email"),
				],
				true,
			),
			...passwordFields(),
			isBlocked,
		],
		attributes: { ...updateAttributes(s), ...ACCOUNT_ATTRIBUTES },
	})
}

/** `Student\UpdateRequest`: register personal minus registration_path / academic_year_id, + the account fields. */
export const studentUpdateSet = (ctx: VariantContext): RuleSet => {
	const s = ctx.settings
	const personal = without(personalRequest(s), ["registration_path", "academic_year_id"])
	const live = { ignoreId: ctx.ignoreId, live: true }
	return merge([personal, identityRequest(s), familyRequest(s), guardianRequest(s)], {
		fields: [
			field("nis", null, [R.nullable, R.numeric, { name: "digits", value: 7 }, unique(ctx.manager, "tbr_students", "nis", live)], true),
			field("email", null, [R.nullable, R.email, { name: "required_with", others: ["password"] }, unique(ctx.manager, "tbr_students", "email", live)], true),
			...passwordFields(),
			field("is_blocked", null, [R.required, R.boolean]),
			field("dropout_note", null, [R.nullable, R.string]),
			field("sub_grade", null, [R.nullable, R.string]),
			field("major_name", null, [R.nullable, R.string]),
		],
		attributes: {
			...updateAttributes(s),
			nis: "NISP",
			...ACCOUNT_ATTRIBUTES,
			dropout_note: "catatan keluar",
			sub_grade: "subkelas",
			major_name: "jurusan",
		},
		messages: { "nis.unique": "NISP sudah ada dalam basis data. <br> Mohon gunakan yang lain." },
	})
}

/**
 * `Alumni\AlumniRequest`: Student\UpdateRequest minus academic_year_id / level_id / email / is_blocked, plus the
 * alumni fields. Not ported: the inherited nis / password / dropout_note / sub_grade / major_name rules — the
 * alumni page never posts those inputs (and `tbr_alumnis` has no password / dropout_note / sub_grade column).
 */
export const alumniUpdateSet = (ctx: VariantContext): RuleSet => {
	const s = ctx.settings
	const personal = without(personalRequest(s), ["registration_path", "academic_year_id", "level_id"])
	const nullable = (name: string): FieldSpec => field(name, null, [R.nullable])
	return merge([personal, identityRequest(s), familyRequest(s), guardianRequest(s)], {
		fields: [
			nullable("alumni_talent"),
			nullable("advanced_study"),
			nullable("profession"),
			field("marriage_status", null, [R.required, R.in(["married", "single"])]),
			field("alumni_phone", null, [R.required, R.numeric, R.min1, R.phoneDigits], true),
			field("alumni_email", null, [R.nullable, R.email, unique(ctx.manager, "tbr_alumnis", "alumni_email", { ignoreId: ctx.ignoreId })], true),
			...[
				"alumni_province_id",
				"alumni_regency_id",
				"alumni_district_id",
				"alumni_village",
				"alumni_sub_village",
				"alumni_rt",
				"alumni_rw",
				"alumni_street",
			].map(nullable),
		],
		attributes: {
			...updateAttributes(s),
			...ACCOUNT_ATTRIBUTES,
			nis: "NISP",
			dropout_note: "catatan keluar",
			sub_grade: "subkelas",
			major_name: "jurusan",
			alumni_talent: "minat bakat yang dimiliki",
			advanced_study: "studi lanjutan atau jurusan",
			profession: "profesi atau aktivitas kegiatan",
			marriage_status: "status menikah",
			alumni_phone: "nomor telepon",
			alumni_email: "email",
			alumni_province_id: "provinsi",
			alumni_regency_id: "kabupaten",
			alumni_district_id: "kecamatan",
			alumni_village: "kelurahan",
			alumni_sub_village: "dusun",
			alumni_rt: "rt",
			alumni_rw: "rw",
			alumni_street: "jalan",
		},
		messages: {
			"nis.unique": "NISP sudah ada dalam basis data. <br> Mohon gunakan yang lain.",
			"alumni_province_id.required": "Kolom :attribute wajib untuk dipilih.",
			"alumni_regency_id.required": "Kolom :attribute wajib untuk dipilih.",
			"alumni_district_id.required": "Kolom :attribute wajib untuk dipilih.",
		},
	})
}

/**
 * Edit saves have no attachment rules in legacy (the UpdateRequests never list `attach_*`; the page's
 * `max-file-size.js` and `accept` do the checking). Kept as a server-side net: an uploaded file must still
 * pass `image|max:2048`, under the setting label. Required / prohibited are not applied, as in legacy.
 */
export const updateUploadSet = (s: SettingForms, present: string[]): RuleSet => ({
	fields: ATTACHMENT_COLUMNS.filter(([name]) => present.includes(name)).map(([name]) =>
		field(name, "attachment", [R.image, { name: "max", value: 2048 }], true),
	),
	attributes: Object.fromEntries(ATTACHMENT_COLUMNS.map(([name, id]) => [name, formLabel(s, id)])),
	messages: {},
})
