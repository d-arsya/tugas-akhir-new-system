import type { EntityManager } from "typeorm"

import type { SocietyKind, SocietyRecord } from "@roja/types"
import { SOCIETY_COLUMNS, SOCIETY_FIELDS } from "@roja/utils/society-fields"

import { loadDiseaseHistories } from "./disease-history"
import { societyFileUrl } from "./files"

// OWNER: AK-A. The record behind the edit / detail pages (legacy `edit()` hands the model to the blade).

const TABLE: Record<SocietyKind, string> = {
	registrant: "tbr_registrants",
	student: "tbr_student_grades",
	alumni: "tbr_alumnis",
}

// Every column is read as text so the form gets what the blade printed: bigints without a JS number round
// trip, dates as `YYYY-MM-DD`, booleans as "true" / "false".
const SELECT_LIST = SOCIETY_COLUMNS.map((column) => `${column}::text AS "${column}"`).join(", ")

/**
 * Phone inputs are `type=number min=1` with a "62" prefix. 106 alumni and 1,154 santri class rows store
 * `school_phone = 0` (and some `guardian_phone = 0`) — "no number" after a legacy import — and a `0` in a
 * hidden tab made the browser refuse the whole form, in legacy as well. Shown empty instead (fixed at the
 * user's request, 2026-09-26), so a save writes NULL like any other empty optional phone.
 */
const PHONE_COLUMNS = new Set(SOCIETY_FIELDS.filter((field) => field.widget === "phone").flatMap((field) => field.columns))

/**
 * One society record for an edit / detail page: every `SOCIETY_COLUMNS` value of the row as a form
 * string, its disease histories and the attachment display URLs.
 *   registrant → `tbr_registrants.id`
 *   student    → `tbr_student_grades.id` (live row, `deleted_at IS NULL`)
 *   alumni     → `tbr_alumnis.id`
 * Returns null when the row does not exist. Account / widget fields are the caller's business.
 */
export const loadSocietyRecord = async (manager: EntityManager, society: SocietyKind, id: number): Promise<SocietyRecord | null> => {
	const live = society === "student" ? " AND deleted_at IS NULL" : ""
	const rows = (await manager.query(`SELECT ${SELECT_LIST} FROM ${TABLE[society]} WHERE id = $1${live}`, [id])) as Array<
		Record<string, string | null>
	>
	const row = rows[0]
	if (!row) return null

	const values: Record<string, string> = {}
	const attachmentUrls: Record<string, string | null> = {}
	for (const column of SOCIETY_COLUMNS) {
		const value = row[column] ?? null
		values[column] = value === null || (value === "0" && PHONE_COLUMNS.has(column)) ? "" : value
		if (column.startsWith("attach_")) attachmentUrls[column] = societyFileUrl(value)
	}

	return { values, diseases: await loadDiseaseHistories(manager, society, id), attachmentUrls }
}
