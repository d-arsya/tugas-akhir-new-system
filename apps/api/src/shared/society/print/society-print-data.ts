import type { EntityManager } from "typeorm"

import type { SocietyDisease, SocietyKind } from "@roja/types"
import { SOCIETY_COLUMNS } from "@roja/utils/society-fields"

import { loadDiseaseHistories } from "../disease-history"

// OWNER: AK-A. Everything the three print blades read: the record (raw, so `?? '-'` can tell null from ""),
// `SettingForm::all()`, `SettingSchool::first()`, the location names behind `getProvinceName()` /
// `getRegencyName()` / `getDistrictName()`, and the disease histories.

export type PrintRow = Record<string, string | null>

export type PrintSetting = { id: number; group: string; status: boolean; label: string | null }

export type PrintData = {
	society: SocietyKind
	row: PrintRow
	settings: PrintSetting[]
	school: PrintRow | null
	provinces: Map<string, string>
	regencies: Map<string, string>
	districts: Map<string, string>
	diseases: SocietyDisease[]
}

const COLUMNS = SOCIETY_COLUMNS.map((column) => `t.${column}::text AS "${column}"`).join(", ")

const ALUMNI_EXTRA = [
	"alumni_talent",
	"advanced_study",
	"profession",
	"marriage_status",
	"alumni_phone",
	"alumni_email",
	"alumni_province_id",
	"alumni_regency_id",
	"alumni_district_id",
	"alumni_village",
	"alumni_sub_village",
	"alumni_rt",
	"alumni_rw",
	"alumni_street",
]
	.map((column) => `t.${column}::text AS "${column}"`)
	.join(", ")

const ROW_SQL: Record<SocietyKind, string> = {
	// `$registrant->academicYear->year`, `$registrant->level->name`, `registrant_id`, `email`
	registrant: `SELECT ${COLUMNS}, t.registrant_id, t.email, ay.year AS academic_year, lv.name AS level_name
		FROM tbr_registrants t
		LEFT JOIN tbr_academic_years ay ON ay.id = t.academic_year_id
		LEFT JOIN tbr_levels lv ON lv.id = t.level_id
		WHERE t.id = $1`,
	// `$student->student->nis / email / academicYear->year` (the account, not trashed), `level->name`, grade, major
	student: `SELECT ${COLUMNS}, s.nis AS student_nis, s.email AS student_email, ay.year AS academic_year,
			lv.name AS level_name, t.grade::text AS grade, t.major_name
		FROM tbr_student_grades t
		LEFT JOIN tbr_students s ON s.id = t.student_id AND s.deleted_at IS NULL
		LEFT JOIN tbr_academic_years ay ON ay.id = s.academic_year_id
		LEFT JOIN tbr_levels lv ON lv.id = t.level_id
		WHERE t.id = $1 AND t.deleted_at IS NULL`,
	// `formatDate($alumni->graduate_year, 'Y')` in the app timezone
	alumni: `SELECT ${COLUMNS}, ${ALUMNI_EXTRA}, to_char(t.graduate_year AT TIME ZONE 'Asia/Jakarta', 'YYYY') AS graduate_year
		FROM tbr_alumnis t
		WHERE t.id = $1`,
}

const SCHOOL_SQL = `SELECT name, phone::text AS phone, logo, favicon, full_address, province_id::text AS province_id,
		regency_id::text AS regency_id, district_id::text AS district_id
	FROM tbr_setting_schools ORDER BY id LIMIT 1`

const names = async (manager: EntityManager, table: string, ids: Array<string | null | undefined>): Promise<Map<string, string>> => {
	// Array.from, not a spread: the API bundle compiles some code in SWC loose mode, which breaks Set spreads
	const wanted = Array.from(new Set(ids.filter((id): id is string => typeof id === "string" && /^\d+$/.test(id))))
	if (wanted.length === 0) return new Map()
	const rows = (await manager.query(`SELECT id::text AS id, name FROM ${table} WHERE id = ANY($1::bigint[])`, [wanted])) as Array<{
		id: string
		name: string | null
	}>
	return new Map(rows.map((row) => [row.id, row.name ?? ""]))
}

/** Null when the record does not exist (a trashed grade row counts as missing). */
export const loadPrintData = async (manager: EntityManager, society: SocietyKind, id: number): Promise<PrintData | null> => {
	const rows = (await manager.query(ROW_SQL[society], [id])) as PrintRow[]
	const row = rows[0]
	if (!row) return null

	const settings = (
		(await manager.query(`SELECT id, "group", status, custom_name, "default" FROM tbr_setting_forms ORDER BY id`)) as Array<{
			id: string
			group: string | null
			status: boolean | null
			custom_name: string | null
			default: string | null
		}>
	).map((setting) => ({
		id: Number(setting.id),
		group: setting.group ?? "",
		status: setting.status === true,
		label: setting.custom_name ?? setting.default,
	}))
	const school = ((await manager.query(SCHOOL_SQL)) as PrintRow[])[0] ?? null

	const prefixes = ["school_", "family_", "guardian_", "alumni_"]
	const pick = (suffix: string): Array<string | null | undefined> => [
		...prefixes.map((prefix) => row[`${prefix}${suffix}`]),
		school?.[suffix],
	]

	return {
		society,
		row,
		settings,
		school,
		provinces: await names(manager, "tbr_provinces", pick("province_id")),
		regencies: await names(manager, "tbr_regencies", pick("regency_id")),
		districts: await names(manager, "tbr_districts", pick("district_id")),
		diseases: await loadDiseaseHistories(manager, society, id),
	}
}
