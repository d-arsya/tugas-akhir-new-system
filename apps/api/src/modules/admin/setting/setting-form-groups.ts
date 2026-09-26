import type { SettingForm } from "@shared/school/entities/setting-form.entity"

// Port of `SettingFormController@index` (the grouping) and `SettingFormService::alpabhetIcon`
// + `getSubGroupAllInvisible` (app/Helpers/Helper.php 176-197).

export type SettingFormType =
	| "paragraph"
	| "basic input"
	| "input number"
	| "radio button"
	| "checkbox"
	| "datepicker"
	| "combo box"
	| "address group"
	| "location group"
	| "upload"
	| "texteditor"
	| "accordion label"

export type SettingFormItem = {
	id: number
	type: SettingFormType
	helper: string | null
	group: string | null
	subGroup: string | null
	/** Legacy `custom_name ?? default` — the label shown across the apps. */
	label: string
	defaultLabel: string | null
	customName: string | null
	status: boolean
	visibility: boolean
	registrantRequired: boolean
	adminRequired: boolean
}

export type SettingFormAlphabet = {
	identity: string[]
	family: string[]
	guardian: string[]
}

export type SettingFormGroups = {
	personalDatas: SettingFormItem[]
	previousSchools: SettingFormItem[]
	identityNumbers: SettingFormItem[]
	healthDatas: SettingFormItem[]
	achievments: SettingFormItem[]
	religiousAchievments: SettingFormItem[]
	gifts: SettingFormItem[]
	familyDatas: SettingFormItem[]
	familyAddress: SettingFormItem[]
	guardianDatas: SettingFormItem[]
	guardianAddress: SettingFormItem[]
	attachments: SettingFormItem[]
	alphabet: SettingFormAlphabet
}

/** The accordion-label rows `alpabhetIcon` skips when it decides whether a section is hidden. */
export const ACCORDION_ROW_IDS = [22, 29, 31, 34, 36, 51, 53, 61] as const

const ALPHABET = ["A", "B", "C", "D", "E"] as const

const SUB_GROUP_HEALTH = "data kesehatan kamu"
const SUB_GROUP_ACHIEVMENTS = "prestasi belajar yang pernah kamu raih"
const SUB_GROUP_RELIGIOUS = "prestasi dinniyah"
const SUB_GROUP_GIFTS = "bakat menonjol lain beserta prestasi"
const SUB_GROUP_FAMILY = "ayah kandung & ibu kandung"
const SUB_GROUP_FAMILY_ADDRESS = "alamat orang tua"
const SUB_GROUP_GUARDIAN = "identitas wali"
const SUB_GROUP_GUARDIAN_ADDRESS = "alamat wali"

const GROUP_IDENTITY = "identity data"
const GROUP_FAMILY = "family data"
const GROUP_GUARDIAN = "guardian data"
const GROUP_ATTACHMENT = "attachment data"

/** The legacy ENUM; anything unexpected falls back to the neutral "basic input" tile. */
const FORM_TYPES: readonly SettingFormType[] = [
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
]

const toType = (value: string | null): SettingFormType => {
	const match = FORM_TYPES.find((type) => type === value)
	return match ?? "basic input"
}

export const toSettingFormItem = (row: SettingForm): SettingFormItem => ({
	id: Number(row.id),
	type: toType(row.type),
	helper: row.helper,
	group: row.group,
	subGroup: row.subGroup,
	label: row.customName ?? row.default ?? "",
	defaultLabel: row.default,
	customName: row.customName,
	status: row.status === true,
	visibility: row.visibility === true,
	registrantRequired: row.registrantRequired === true,
	adminRequired: row.adminRequired === true,
})

const inIdRange = (items: SettingFormItem[], from: number, to: number): SettingFormItem[] =>
	items.filter((item) => item.id >= from && item.id <= to)

const bySubGroup = (items: SettingFormItem[], subGroup: string): SettingFormItem[] =>
	items.filter((item) => item.subGroup === subGroup)

/**
 * Legacy `getSubGroupAllInvisible`: true while no row of the sub-group (ignoring the
 * accordion label itself) has both `status` and `visibility`.
 */
const isSubGroupAllInvisible = (items: SettingFormItem[], subGroup: string): boolean =>
	!items.some(
		(item) =>
			item.subGroup === subGroup &&
			!ACCORDION_ROW_IDS.includes(item.id as (typeof ACCORDION_ROW_IDS)[number]) &&
			item.status &&
			item.visibility,
	)

/**
 * Legacy `SettingFormService::alpabhetIcon`: walks the sub-groups of a group in `id` order
 * (`groupBy` keeps first-seen order) and hands out A, B, C… — a fully hidden section gets ""
 * and does not consume a letter.
 */
export const alphabetIcon = (items: SettingFormItem[], group: string): string[] => {
	const subGroups: string[] = []
	for (const item of items) {
		if (item.group !== group) continue
		const key = item.subGroup ?? ""
		if (!subGroups.includes(key)) subGroups.push(key)
	}

	let taken = 0
	return subGroups.map((subGroup) => {
		if (isSubGroupAllInvisible(items, subGroup)) return ""
		const letter = ALPHABET[taken] ?? ""
		taken += 1
		return letter
	})
}

export const buildAlphabet = (items: SettingFormItem[]): SettingFormAlphabet => ({
	identity: alphabetIcon(items, GROUP_IDENTITY),
	family: alphabetIcon(items, GROUP_FAMILY),
	guardian: alphabetIcon(items, GROUP_GUARDIAN),
})

/** `items` must already be sorted by id, like legacy `SettingForm::orderBy('id')->get()`. */
export const buildSettingFormGroups = (items: SettingFormItem[]): SettingFormGroups => ({
	personalDatas: inIdRange(items, 1, 13),
	previousSchools: inIdRange(items, 19, 21),
	identityNumbers: inIdRange(items, 14, 18),
	healthDatas: bySubGroup(items, SUB_GROUP_HEALTH),
	achievments: bySubGroup(items, SUB_GROUP_ACHIEVMENTS),
	religiousAchievments: bySubGroup(items, SUB_GROUP_RELIGIOUS),
	gifts: bySubGroup(items, SUB_GROUP_GIFTS),
	familyDatas: bySubGroup(items, SUB_GROUP_FAMILY),
	familyAddress: bySubGroup(items, SUB_GROUP_FAMILY_ADDRESS),
	guardianDatas: bySubGroup(items, SUB_GROUP_GUARDIAN),
	guardianAddress: bySubGroup(items, SUB_GROUP_GUARDIAN_ADDRESS),
	attachments: items.filter((item) => item.group === GROUP_ATTACHMENT),
	alphabet: buildAlphabet(items),
})
