// Raw SQL for Akun Dompet — legacy `EwalletController` (list `:ewalletListAmar`, widget, detail,
// setting, `@transactionList`, QR print, balance export). Owned by WS D-A.
//
// The database quirks that shape every query here (all from the shared brief):
//   * `tbr_ewallets.ewalletable_id` is a varchar → join with `s.id::text = e.ewalletable_id`;
//   * `ewalletable_type` is the PHP class string;
//   * `details.{ewallet_id,ewallet_transaction_id}` and `items.ewallet_transaction_id` are numeric;
//   * 3 transactions carry duplicate detail rows → the first detail (lowest id) wins, never a join;
//   * `tbr_students` and `tbr_student_grades` are soft-deleted, and 38 santri hold more than one
//     `active` grade — `studentGrades()->firstWhere('grade_status','active')` is the lowest id.

import { LOCAL_TIMESTAMP, type SqlParams } from "@admin/common/sql"
import { EWALLET_MERCHANT_TYPE, EWALLET_STUDENT_TYPE } from "@shared/ewallet/balance"

// `standard_conforming_strings` is on, so the PHP class string's backslash is literal inside '…'
const STUDENT = `'${EWALLET_STUDENT_TYPE}'`
const MERCHANT = `'${EWALLET_MERCHANT_TYPE}'`

/** `studentGrades()->firstWhere('grade_status', 'active')` for the santri `${studentId}` (lowest id, live rows only). */
const ACTIVE_GRADE = (studentId: string): string => `LEFT JOIN LATERAL (
		SELECT g.id, g.fullname, g.attach_photo, g.grade, g.father_fullname, g.level_id
		FROM tbr_student_grades g
		WHERE g.student_id = ${studentId} AND g.grade_status = 'active' AND g.deleted_at IS NULL
		ORDER BY g.id LIMIT 1
	) sg ON true`

// --- Akun Dompet list ------------------------------------------------------------------

export type WalletFilter = { status?: "active" | "inactive" | undefined; member?: "santri" | "merchant" | undefined }

/** `filter()` closure of `ewalletListAmar`: the two dropdowns plus the search box. */
export const walletListWhere = (filter: WalletFilter & { search?: string | undefined }, params: SqlParams): string => {
	const conditions: string[] = []
	if (filter.status) conditions.push(`e.is_active = ${params.add(filter.status === "active")}`)
	if (filter.member) conditions.push(`e.ewalletable_type = ${params.add(filter.member === "santri" ? EWALLET_STUDENT_TYPE : EWALLET_MERCHANT_TYPE)}`)
	if (filter.search) {
		const term = params.add(`%${filter.search}%`)
		conditions.push(`(e.unique_id::text ILIKE ${term} OR e.ewalletable_name ILIKE ${term})`)
	}
	return conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : ""
}

/** One pass over the ledger: the row count and both badge counters per wallet. */
const TXN_COUNTS = `LEFT JOIN (
		SELECT t.ewallet_id,
			count(*) AS total,
			count(*) FILTER (WHERE t.status = 'process') AS process,
			count(*) FILTER (WHERE t.status = 'waiting') AS waiting
		FROM tbr_ewallet_transactions t GROUP BY t.ewallet_id
	) c ON c.ewallet_id = e.id`

export const WALLET_SORT_SQL = {
	uniqueId: "e.unique_id",
	ownerName: "e.ewalletable_name",
	ownerType: "e.ewalletable_type",
	storedBalance: "e.total_balance",
	transactionCount: "COALESCE(c.total, 0)",
	isActive: "e.is_active",
} as const

export type WalletSortKey = keyof typeof WALLET_SORT_SQL

/** `ewallet-student-serverside.js`: `order: [[1, "desc"]]` — `unique_id` descending. */
export const DEFAULT_SORT: { orderBy: WalletSortKey; orderDir: "asc" | "desc" } = {
	orderBy: "uniqueId",
	orderDir: "desc",
}

export const walletCountSql = (where: string): string => `SELECT count(*)::int AS total FROM tbr_ewallets e ${where}`

/**
 * `Ewallet::getProcessedTransactionsCountAttribute`: santri wallets count `process` rows,
 * merchant wallets count `waiting` rows. `e.id DESC` is a tie-break legacy lacks, so paging
 * cannot repeat a row.
 */
export const walletListSql = (where: string, sortSql: string, dir: string, limit: string, offset: string): string => `
SELECT e.id::int AS id, e.unique_id::text AS "uniqueId", e.ewalletable_name AS "ownerName",
	e.ewalletable_type AS "ownerType", e.total_balance::text AS "storedBalance",
	COALESCE(c.total, 0)::int AS "transactionCount", e.is_active AS "isActive",
	(CASE e.ewalletable_type WHEN ${STUDENT} THEN COALESCE(c.process, 0)
		WHEN ${MERCHANT} THEN COALESCE(c.waiting, 0) ELSE 0 END)::int AS "processCount"
FROM tbr_ewallets e
${TXN_COUNTS}
${where}
ORDER BY ${sortSql} ${dir} NULLS LAST, e.id DESC
LIMIT ${limit} OFFSET ${offset}`

/** `ewalletBalance()` × 6 in legacy; here the three sums are one statement over the stored column. */
export const walletWidgetSql = (where: string): string => `
SELECT COALESCE(SUM(e.total_balance) FILTER (WHERE e.ewalletable_type = ${STUDENT}), 0)::text AS student,
	COALESCE(SUM(e.total_balance) FILTER (WHERE e.ewalletable_type = ${MERCHANT}), 0)::text AS merchant
FROM tbr_ewallets e ${where}`

// --- One wallet ------------------------------------------------------------------------

export type StudentOwnerRow = {
	nis: string | null
	studentStatus: string | null
	isBlocked: boolean | null
	email: string | null
	fullname: string | null
	attachPhoto: string | null
	grade: string | null
	fatherFullname: string | null
	levelName: string | null
	hasActiveGrade: boolean
}

/** `$ewallet->ewalletable` for a santri; the default `SoftDeletes` scope hides trashed santri. */
export const STUDENT_OWNER_SQL = `
SELECT s.nis, s.student_status AS "studentStatus", s.is_blocked AS "isBlocked", s.email,
	sg.fullname, sg.attach_photo AS "attachPhoto", sg.grade::text AS grade,
	sg.father_fullname AS "fatherFullname", l.name AS "levelName", (sg.id IS NOT NULL) AS "hasActiveGrade"
FROM tbr_students s
${ACTIVE_GRADE("s.id")}
LEFT JOIN tbr_levels l ON l.id = sg.level_id
WHERE s.id::text = $1 AND s.deleted_at IS NULL`

export type MerchantOwnerRow = {
	name: string | null
	photo: string | null
	merchantName: string | null
	address: string | null
	phone: string | null
	uniqueNumber: string | null
	isBlocked: boolean | null
	email: string | null
}

export const MERCHANT_OWNER_SQL = `
SELECT m.name, m.photo, m.merchant_name AS "merchantName", m.address, m.phone,
	m.unique_number AS "uniqueNumber", m.is_blocked AS "isBlocked", m.email
FROM tbr_merchants m WHERE m.id::text = $1`

// --- The per-wallet transaction table --------------------------------------------------

export type WalletTransactionSqlRow = {
	id: string
	code: string | null
	name: string | null
	type: string
	status: string
	paymentMethod: string | null
	amount: string | null
	createdAt: string | null
	createdAtTs: string | null
	hasDetail: boolean
	txnWalletMerchantName: string | null
	belongsName: string | null
}

/**
 * `@transactionList`. A santri's table is their own rows **plus** every transaction whose detail
 * row points at their wallet (`EwalletTransaction::whereHas('ewalletTransactionDetail')`) — the
 * `merge` de-duplicates by id, which `OR EXISTS` does here. A merchant's table is its own rows.
 *
 * `total_items_price` is the items' sum when the row has items, else `amount`. The two names a
 * purchase can carry come from the transaction's own wallet owner (`merchant_name`, for a santri's
 * "Pembelian - …") and from the santri behind the first detail row (`ewallet_belongs_name`, for a
 * merchant's "Penjualan - …").
 */
export const walletTransactionsSql = (student: boolean): string => `
SELECT t.id::text AS id, t.code, t.name, t.type, t.status, t.payment_method AS "paymentMethod",
	COALESCE((SELECT SUM(i.price) FROM tbr_ewallet_transaction_items i WHERE i.ewallet_transaction_id = t.id), t.amount)::text AS amount,
	${LOCAL_TIMESTAMP("t.created_at")} AS "createdAt",
	EXTRACT(EPOCH FROM t.created_at)::bigint::text AS "createdAtTs",
	EXISTS (SELECT 1 FROM tbr_ewallet_transaction_details d WHERE d.ewallet_transaction_id = t.id) AS "hasDetail",
	(SELECT m.merchant_name FROM tbr_ewallets tw
		JOIN tbr_merchants m ON m.id::text = tw.ewalletable_id
		WHERE tw.id = t.ewallet_id AND tw.ewalletable_type = ${MERCHANT}) AS "txnWalletMerchantName",
	(SELECT CASE WHEN sg.id IS NOT NULL THEN sg.fullname ELSE dw.student_name END
		FROM tbr_ewallet_transaction_details d
		JOIN tbr_ewallets dw ON dw.id = d.ewallet_id
		LEFT JOIN tbr_students s ON dw.ewalletable_type = ${STUDENT} AND s.id::text = dw.ewalletable_id AND s.deleted_at IS NULL
		${ACTIVE_GRADE("s.id")}
		WHERE d.ewallet_transaction_id = t.id ORDER BY d.id LIMIT 1) AS "belongsName"
FROM tbr_ewallet_transactions t
WHERE t.ewallet_id = $1${
	student ? " OR EXISTS (SELECT 1 FROM tbr_ewallet_transaction_details d WHERE d.ewallet_transaction_id = t.id AND d.ewallet_id = $1)" : ""
}
ORDER BY t.created_at DESC, t.id DESC`

// --- QR --------------------------------------------------------------------------------

export type QrAllSqlRow = { nis: string | null; name: string | null }

/** `qrCodePrintAll`: `Student::get()` — every live santri, wallet or not, in id order. */
export const QR_ALL_SQL = `
SELECT s.nis, sg.fullname AS name
FROM tbr_students s
${ACTIVE_GRADE("s.id")}
WHERE s.deleted_at IS NULL
ORDER BY s.id`

// --- Balance export --------------------------------------------------------------------

export type ExportSqlRow = {
	uniqueId: string | null
	name: string | null
	ownerType: string | null
	isActive: boolean
	balance: string | null
}

/**
 * `Ewallet::when(is_active)->when(ewalletable_type)->orderBy('created_at', 'desc')`, with the
 * `ewallet_user_name` / `ewallet_user_type` accessors resolved in SQL. `e.id DESC` breaks ties
 * between wallets created in the same instant.
 */
export const walletExportSql = (where: string): string => `
SELECT e.unique_id::text AS "uniqueId",
	CASE e.ewalletable_type
		WHEN ${MERCHANT} THEN m.name
		WHEN ${STUDENT} THEN (CASE WHEN sg.id IS NOT NULL THEN sg.fullname ELSE e.student_name END)
		ELSE 'Tidak ditemukan' END AS name,
	e.ewalletable_type AS "ownerType", e.is_active AS "isActive", e.total_balance::text AS balance
FROM tbr_ewallets e
LEFT JOIN tbr_merchants m ON e.ewalletable_type = ${MERCHANT} AND m.id::text = e.ewalletable_id
LEFT JOIN tbr_students s ON e.ewalletable_type = ${STUDENT} AND s.id::text = e.ewalletable_id AND s.deleted_at IS NULL
${ACTIVE_GRADE("s.id")}
${where}
ORDER BY e.created_at DESC, e.id DESC`
