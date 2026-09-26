import type { SocietyRuleVariant } from "../society-rules"

// OWNER: AK-A. Turns the validated form strings into SQL-ready values (Eloquent would have let the
// database cast them). `bigint` columns become numbers when they hold an integer; anything else is left as
// the string legacy would have sent, so a value Postgres rejects still fails the save as it did in legacy.

/** `bigint` columns shared by tbr_registrants, tbr_student_grades and tbr_alumnis (+ the step-1 ids). */
const BIGINT = new Set([
	"academic_year_id",
	"level_id",
	"grade",
	"sibling_order",
	"number_of_sibling",
	"phone",
	"province_id",
	"regency_id",
	"district_id",
	"school_phone",
	"school_province_id",
	"school_regency_id",
	"school_district_id",
	"school_postal_code",
	"weight",
	"height",
	"father_phone",
	"mother_phone",
	"family_province_id",
	"family_regency_id",
	"family_district_id",
	"guardian_phone",
	"guardian_province_id",
	"guardian_regency_id",
	"guardian_district_id",
	"alumni_phone",
	"alumni_province_id",
	"alumni_regency_id",
	"alumni_district_id",
])

/** `*_whatsapp` is bigint in tbr_registrants only (varchar in tbr_student_grades / tbr_alumnis). */
const REGISTRANT_BIGINT = new Set(["father_whatsapp", "mother_whatsapp", "guardian_whatsapp"])

/** Inputs that never become a column of their own. */
export const isNotAColumn = (field: string): boolean =>
	field === "password_confirmation" || field.includes(".") || field.startsWith("attach_")

/**
 * `formatDate($date, 'Y-m-d')` (Carbon::parse) for the two shapes the forms post: `Y-m-d` (new admin) and
 * `d-m-Y` (legacy datepicker). Anything else is passed through for the database to judge.
 */
const toIsoDate = (value: string): string => {
	if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value
	const dmy = /^(\d{1,2})-(\d{1,2})-(\d{4})$/.exec(value)
	if (dmy) return `${dmy[3]}-${(dmy[2] ?? "").padStart(2, "0")}-${(dmy[1] ?? "").padStart(2, "0")}`
	return value
}

export const columnValue = (
	variant: SocietyRuleVariant,
	field: string,
	value: string | null,
): string | number | boolean | null => {
	if (value === null) return null
	if (field === "is_blocked") return value === "1" || value === "true"
	if (field === "date_of_birth") return toIsoDate(value)
	const bigint = BIGINT.has(field) || (variant.startsWith("registrant") && REGISTRANT_BIGINT.has(field))
	if (bigint && /^-?\d+$/.test(value) && Number.isSafeInteger(Number(value))) return Number(value)
	return value
}
