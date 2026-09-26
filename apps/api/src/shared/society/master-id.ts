import { UnprocessableEntityException } from "@nestjs/common"
import type { EntityManager } from "typeorm"

/** Postgres advisory-lock key for the NIS sequence; arbitrary but stable. */
const MASTER_ID_LOCK_KEY = 5_201_026

const PAD_LENGTH = 5

/**
 * Legacy `UUIDTraits::generateMasterId` (`app/Http/Traits/UUIDTraits.php:18-34`) — the santri
 * number (NIS / NISP) given by the Santri wizard and by PSB approval.
 *
 * Format: the last two digits of the academic year's first year (`2026/2027` → `26`), then a
 * 5-digit sequence: one more than the highest live `tbr_students.nis` starting with those two
 * digits. Kept exactly:
 *   * `nis` is a **varchar**, so "highest" is the text order (`ORDER BY nis DESC`), like legacy;
 *   * soft-deleted santri are ignored (the `Student` model uses `SoftDeletes`), so a number held
 *     by a trashed row can be handed out again, as in legacy;
 *   * the sequence is `substr(nis, 3)` with leading zeros stripped, `+ 1`, padded to 5.
 *
 * Not kept: two concurrent requests read the same maximum in legacy. This takes a
 * transaction-scoped advisory lock first, so it must run inside the caller's transaction and
 * the lock holds until the new `tbr_students` row is inserted.
 */
export const generateMasterId = async (manager: EntityManager, academicYearId: number): Promise<string> => {
	await manager.query("SELECT pg_advisory_xact_lock($1)", [MASTER_ID_LOCK_KEY])

	const years = (await manager.query("SELECT year FROM tbr_academic_years WHERE id = $1", [academicYearId])) as Array<{
		year: string | null
	}>
	const year = years[0]?.year
	// Legacy `->first()->year` on a missing row throws, which every caller's catch turns into its
	// own failure message; the caller decides the wording.
	if (!year) throw new UnprocessableEntityException("Tahun ajaran tidak ditemukan.")

	const twoDigitYear = (year.split("/")[0] ?? "").slice(-2)

	const rows = (await manager.query(
		`SELECT nis FROM tbr_students WHERE deleted_at IS NULL AND nis LIKE $1 ORDER BY nis DESC LIMIT 1`,
		[`${twoDigitYear}%`],
	)) as Array<{ nis: string | null }>
	const last = rows[0]?.nis ?? null

	// `ltrim(substr($nis, 2), '0') ?: '0'`, then PHP's numeric `+ 1`
	const tail = last ? last.slice(2).replace(/^0+/, "") : ""
	const increment = Number(tail === "" ? "0" : tail) + 1

	return `${twoDigitYear}${String(increment).padStart(PAD_LENGTH, "0")}`
}
