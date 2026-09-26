import type { EntityManager } from "typeorm"

import type { SocietyDisease, SocietyKind } from "@roja/types"

// OWNER: AK-A. `tbr_disease_histories` is polymorphic on `society` ('registrant' | 'student' | 'alumni') +
// `society_id` (for 'student' the student_grade id). Zero foreign keys: callers delete rows themselves.

type Row = { disease_name: string | null; disease_status: string | null }

/** PHP `empty()` on a posted string: "", "0" and null are empty. */
const isEmpty = (value: string | null | undefined): boolean => value === null || value === undefined || value === "" || value === "0"

const insertRow = async (manager: EntityManager, society: SocietyKind, societyId: number, row: Row): Promise<void> => {
	await manager.query(
		`INSERT INTO tbr_disease_histories (society_id, society, disease_name, disease_status, created_at, updated_at)
		VALUES ($1, $2, $3, $4, now(), now())`,
		[societyId, society, row.disease_name, row.disease_status],
	)
}

/** `*->diseaseHistories()` in insertion order, as the edit repeater and the print page list them. */
export const loadDiseaseHistories = async (manager: EntityManager, society: SocietyKind, societyId: number): Promise<SocietyDisease[]> => {
	const rows = (await manager.query(
		`SELECT disease_name, disease_status FROM tbr_disease_histories WHERE society = $1 AND society_id = $2 ORDER BY id`,
		[society, societyId],
	)) as Row[]
	return rows.map((row) => ({ name: row.disease_name ?? "", status: row.disease_status ?? "" }))
}

/** `deleteDiseaseHistories()` alone — legacy `StudentGrade::delete` / registrant delete cascade. */
export const deleteDiseaseHistories = async (manager: EntityManager, society: SocietyKind, societyId: number): Promise<void> => {
	await manager.query(`DELETE FROM tbr_disease_histories WHERE society = $1 AND society_id = $2`, [society, societyId])
}

/**
 * Legacy `update*DiseaseHistory` / `createDiseaseHistory`: delete the record's rows, then insert one row per
 * posted index unless both name and status are empty (`empty($name) && empty($status[$key])`). An empty
 * value is stored as null (ConvertEmptyStringsToNull).
 */
export const replaceDiseaseHistories = async (
	manager: EntityManager,
	society: SocietyKind,
	societyId: number,
	diseases: SocietyDisease[],
): Promise<void> => {
	await deleteDiseaseHistories(manager, society, societyId)
	for (const disease of diseases) {
		if (isEmpty(disease.name) && isEmpty(disease.status)) continue
		await insertRow(manager, society, societyId, {
			disease_name: disease.name === "" ? null : disease.name,
			disease_status: disease.status === "" ? null : disease.status,
		})
	}
}

/**
 * Legacy copy on approve (registrant → student), Naik / Tinggal Kelas (student grade → new grade row) and
 * graduate (student → alumni): every source row, name and status as they are, fresh timestamps.
 */
export const copyDiseaseHistories = async (
	manager: EntityManager,
	from: { society: SocietyKind; id: number },
	to: { society: SocietyKind; id: number },
): Promise<void> => {
	const rows = (await manager.query(
		`SELECT disease_name, disease_status FROM tbr_disease_histories WHERE society = $1 AND society_id = $2 ORDER BY id`,
		[from.society, from.id],
	)) as Row[]
	for (const row of rows) await insertRow(manager, to.society, to.id, row)
}
