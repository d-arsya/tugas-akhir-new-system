import type { EntityManager } from "typeorm"

import type { EwalletTransactionKind } from "@roja/types"

/**
 * `EwalletService::generateTransactionCode` (`app/Http/Services/EwalletService.php:11`).
 *
 * Format: `{prefix}{Ymd}{4-digit sequence}` — `01` income, `02` expense, `03` purchase, `00`
 * anything else. Legacy's sequence is **one counter per day shared by every type**: it walks
 * `1, 2, 3 …` and takes the first `Ymd + seq` that no existing code carries at `substr(code, 2, 12)`,
 * whatever its prefix. That means gaps are refilled, and an income and an expense never share a
 * date+sequence. Kept exactly.
 *
 * What is not kept: legacy loaded every transaction of the year into PHP and looped, and two
 * concurrent requests got the same code (20 duplicated codes exist in the live data). This runs
 * one query under a transaction-scoped advisory lock, so a code is unique among the codes this
 * function hands out. It is **not** backed by a unique index — the legacy data violates one.
 *
 * Must be called inside the caller's transaction so the lock is held until the row is inserted.
 */
const PREFIX: Record<EwalletTransactionKind, string> = { income: "01", expense: "02", purchase: "03" }

/** Postgres advisory-lock key for the code sequence; arbitrary but stable. */
const CODE_LOCK_KEY = 5_201_014

/** `Ymd` in Asia/Jakarta, the timezone legacy's `now()` ran in. */
export const jakartaYmd = (date: Date = new Date()): string => {
	const parts = new Intl.DateTimeFormat("en-CA", {
		timeZone: "Asia/Jakarta",
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).formatToParts(date)
	const part = (type: string): string => parts.find((p) => p.type === type)?.value ?? ""
	return `${part("year")}${part("month")}${part("day")}`
}

export const generateTransactionCode = async (
	manager: EntityManager,
	type: EwalletTransactionKind,
	now: Date = new Date(),
): Promise<string> => {
	await manager.query("SELECT pg_advisory_xact_lock($1)", [CODE_LOCK_KEY])

	const ymd = jakartaYmd(now)
	// `substr(code, 3, 8)` is the date (1-based), `substr(code, 11, 4)` the sequence
	const rows = (await manager.query(
		`SELECT DISTINCT substr(code, 11, 4) AS seq FROM tbr_ewallet_transactions
		WHERE code IS NOT NULL AND substr(code, 3, 8) = $1`,
		[ymd],
	)) as Array<{ seq: string }>
	const used = new Set(rows.map((row) => Number(row.seq)))

	let sequence = 1
	while (used.has(sequence)) sequence += 1

	return `${PREFIX[type]}${ymd}${String(sequence).padStart(4, "0")}`
}
