import type { PrintData, PrintRow } from "./society-print-data"

// OWNER: AK-A. The blade helpers the print views call: `getInputStatus` / `getInputLabel`,
// `getGroupAllDisable`, `lineVisible`, `SettingFormService::printAlphabetIcon`, the `SocietyGetterTrait`
// accessors, `getProvinceName` / `getRegencyName` / `getDistrictName` and Blade's `{{ }}` escaping.

/** `config('app.name')` — `.env` sets `APP_NAME="ROJA"`. */
export const APP_NAME = "ROJA"

/** Blade `{{ }}`: `htmlspecialchars($value, ENT_QUOTES, 'UTF-8', true)`. */
export const esc = (value: unknown): string =>
	String(value ?? "")
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;")

export const inputStatus = (data: PrintData, id: number): boolean => data.settings.find((s) => s.id === id)?.status ?? false

/** `getInputLabel` — `custom_name ?? default`, "" when the row is missing. */
export const inputLabel = (data: PrintData, id: number): string => data.settings.find((s) => s.id === id)?.label ?? ""

/** `getGroupAllDisable($setting_forms, $group, $except)` */
export const groupAllDisabled = (data: PrintData, group: string, except: number[]): boolean =>
	!data.settings.some((s) => s.group === group && !except.includes(s.id) && s.status)

/** `lineVisible($setting_forms, $min, $max)` */
export const lineVisible = (data: PrintData, min: number, max: number): boolean =>
	data.settings.some((s) => s.id >= min && s.id <= max && s.status)

/**
 * `SettingFormService::printAlphabetIcon($setting_forms, $alumni)`: one letter per setting group, "" for a group
 * whose inputs are all hidden. Its first line overwrites the `$alumni` flag with `[]`, so the alumni print
 * starts at "A" too — which is why the alumni sheet shows "A" twice (Overview + Data Diri). Kept.
 */
export const printAlphabet = (data: PrintData): string[] => {
	const letters = ["A", "B", "C", "D", "E", "F", "G", "H"]
	const groups = Array.from(new Set(data.settings.map((s) => s.group)))
	return groups.map((group) =>
		groupAllDisabled(data, group, [12, 13, 15, 16, 17, 22, 29, 31, 34, 36, 51, 53, 61]) ? "" : (letters.shift() ?? ""),
	)
}

/** `$value ?? '-'` (only null falls back; "" prints as nothing). */
export const orDash = (value: string | null | undefined): string => (value === null || value === undefined ? "-" : value)

/** PHP `ucwords` */
export const ucwords = (value: string): string => value.replace(/(^|[ \t\r\n\f\v])(\S)/g, (_, space: string, char: string) => space + char.toUpperCase())

/** `$value ? ucwords($value) : '-'` */
export const ucwordsOrDash = (value: string | null | undefined): string => (value ? ucwords(value) : "-")

/** `$value ? strtoupper($value) : '-'` */
export const upperOrDash = (value: string | null | undefined): string => (value ? value.toUpperCase() : "-")

/**
 * `SocietyGetterTrait::getPhoneNumber` — `$phone == null` → '-', else `+62 <phone>`. PDO hands a bigint column
 * over as an int, and PHP's `0 == null` is true, so a stored 0 prints '-' too; a varchar "0" does not.
 */
export const phoneNumber = (value: string | null | undefined, bigint = true): string =>
	value === null || value === undefined || value === "" || (bigint && value === "0") ? "-" : `+62 ${value}`

/** `formatDate($date, 'd-m-Y') ?? '-'` for a `YYYY-MM-DD` text date. */
export const dayMonthYear = (value: string | null | undefined): string => {
	if (!value) return "-"
	const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value)
	return match ? `${match[3]}-${match[2]}-${match[1]}` : ""
}

const provinceName = (data: PrintData, id: string | null | undefined): string => {
	const name = id ? data.provinces.get(id) : undefined
	return name === undefined ? "" : `Provinsi ${name}`
}
const regencyName = (data: PrintData, id: string | null | undefined): string => (id ? (data.regencies.get(id) ?? "") : "")
const districtName = (data: PrintData, id: string | null | undefined): string => {
	const name = id ? data.districts.get(id) : undefined
	return name === undefined ? "" : `Kecamatan ${name}`
}

/** PHP truthiness of a stored id ("0" and "" are falsy). */
const truthy = (value: string | null | undefined): boolean => !!value && value !== "0"

/** `SettingSchool::getSchoolFullAddressAttribute` */
export const settingSchoolAddress = (data: PrintData, school: PrintRow): string =>
	`${school["full_address"] ?? ""}, ${districtName(data, school["district_id"])}, ${regencyName(data, school["regency_id"])}, ${provinceName(data, school["province_id"])}`

/** `SocietyGetterTrait::getSchoolFullAddressAttribute` */
export const schoolFullAddress = (data: PrintData): string => {
	const row = data.row
	if (!truthy(row["school_province_id"])) return "-"
	return `${row["school_address_detail"] ?? ""}, ${districtName(data, row["school_district_id"])}, ${regencyName(data, row["school_regency_id"])}, ${provinceName(data, row["school_province_id"])}, ${row["school_postal_code"] ?? ""}`
}

/**
 * `SocietyGetterTrait::getFullAddress($prefix)` — the prefixed form the print views call (family, guardian,
 * alumni). The RT/RW swap lives only in the un-prefixed form, which no print view uses.
 */
export const fullAddress = (data: PrintData, prefix: "family" | "guardian" | "alumni"): string => {
	const row = data.row
	const get = (suffix: string): string => row[`${prefix}_${suffix}`] ?? ""
	if (!truthy(row[`${prefix}_province_id`])) return "-"
	return `${get("street")}, ${get("rt")}, ${get("rw")}, ${get("sub_village")}, ${get("village")}, ${districtName(data, row[`${prefix}_district_id`])}, ${regencyName(data, row[`${prefix}_regency_id`])}, ${provinceName(data, row[`${prefix}_province_id`])}`
}

const pickLabel = (value: string | null | undefined, labels: Record<string, string>): string => (value ? (labels[value] ?? "") : "")

/** The `formated_*` accessors: an unknown or empty value gives "" (never null, so `?? '-'` never fires). */
export const FORMATTED = {
	liveWith: (v: string | null | undefined): string => pickLabel(v, { parent: "Orang Tua", guardian: "Wali" }),
	parentStatus: (v: string | null | undefined): string =>
		pickLabel(v, { "father&mother": "Ayah & Ibu", fatherless: "Yatim", motherless: "Piatu", orphan: "Yatim Piatu" }),
	// legacy maps step_child to "Anak Angkat" too
	childStatus: (v: string | null | undefined): string =>
		pickLabel(v, { biological_child: "Anak Kandung", step_child: "Anak Angkat", adopted_child: "Anak Angkat" }),
	visual: (v: string | null | undefined): string =>
		pickLabel(v, { normal: "Normal / Tidak Berkacamata", abnormal: "Tidak Normal / Berkacamata" }),
	hearing: (v: string | null | undefined): string => pickLabel(v, { normal: "Normal", abnormal: "Tidak Normal" }),
	immunization: (v: string | null | undefined): string =>
		pickLabel(v, { complete: "Lengkap", incomplete: "Tidak Lengkap", not_at_all: "Tidak Sama Sekali" }),
	/** `Alumni::getFormatedMarriageStatusAttribute` ("-" for anything else) */
	marriage: (v: string | null | undefined): string => (v === "married" ? "Menikah" : v === "single" ? "Belum Menikah" : "-"),
}

/** One `<tr>` of a print table; `value` is already HTML. */
export const tr = (label: string, value: string): string => `
                                    <tr>
                                        <td class="text-weight-600 text-default">${esc(label)}</td>
                                        <td class="text-default text-italic">${value}</td>
                                    </tr>`
