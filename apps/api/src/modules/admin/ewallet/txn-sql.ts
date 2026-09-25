import { EPOCH_SECONDS, LOCAL_TIMESTAMP } from "@admin/academic/academic-format"
import { parseDmy } from "@admin/payments/transaction-sql"
import { EWALLET_MERCHANT_TYPE, EWALLET_STUDENT_TYPE } from "@shared/ewallet/balance"

// Raw SQL for the transaction detail, the status update and Riwayat Transaksi — legacy
// `EwalletController@transactionDetail/@transactionUpdate` and `EwalletTransactionHistoryController`.
//
// Everything is raw SQL because the ewallet tables mix `bigint`, `numeric` and `varchar` ids:
// `details.ewallet_transaction_id` and `items.ewallet_transaction_id` are numeric,
// `ewalletable_id` is a varchar. See the plan's "Data reality".

const TIMEZONE = "Asia/Jakarta"

/** Collects positional parameters ($1, $2 …) for raw SQL. */
export class SqlParams {
	readonly values: unknown[] = []

	add(value: unknown): string {
		this.values.push(value)
		return `$${this.values.length}`
	}
}

/**
 * `EwalletTransaction::getTotalItemsPriceAttribute`: the items' sum when the row has items,
 * otherwise its own `amount`. Both `items.ewallet_transaction_id` and the id are compared as-is
 * (numeric vs bigint widen in Postgres); the items are grouped once instead of once per row.
 */
const ITEMS_JOIN = `LEFT JOIN (
		SELECT ewallet_transaction_id, COALESCE(SUM(price), 0) AS total
		FROM tbr_ewallet_transaction_items GROUP BY ewallet_transaction_id
	) it ON it.ewallet_transaction_id = t.id`

export const TOTAL_ITEMS_PRICE = "COALESCE(it.total, t.amount)"

// ─── Detail (`@transactionDetail`) ───────────────────────────────

/** The transaction, its wallet and the wallet owner's snapshot columns. */
export const TRANSACTION_DETAIL_SQL = `SELECT t.id, t.code, t.name, t.type, t.status, t.payment_method AS "paymentMethod",
		t.amount, t.transfer_news_number AS "transferNewsNumber",
		${LOCAL_TIMESTAMP("t.created_at")} AS "createdAt",
		${LOCAL_TIMESTAMP("t.payment_date")} AS "paymentDate",
		t.payment_note AS "paymentNote", t.invalid_note AS "invalidNote",
		t.payment_on_behalf_of AS "paymentOnBehalfOf", t.payment_attachment AS "paymentAttachment",
		e.id AS "ewalletId", e.unique_id::text AS "uniqueId", e.ewalletable_type AS "ownerType",
		e.ewalletable_id AS "ownerId", e.student_name AS "snapshotName"
	FROM tbr_ewallet_transactions t
	JOIN tbr_ewallets e ON e.id = t.ewallet_id
	WHERE t.id = $1`

/**
 * A santri's name. The bank-transfer view reads `studentGrades()->latest()->first()` and the
 * cash view reads the `active` grade; nine santri with a bank transfer have no active grade, so
 * the active one wins and the newest is the fallback (legacy would have shown the newest, or
 * crashed on a santri with none).
 */
export const STUDENT_NAMES_SQL = `SELECT
		(SELECT g.fullname FROM tbr_student_grades g
			WHERE g.student_id::text = $1 AND g.grade_status = 'active' AND g.deleted_at IS NULL
			ORDER BY g.id DESC LIMIT 1) AS active,
		(SELECT g.fullname FROM tbr_student_grades g
			WHERE g.student_id::text = $1 AND g.deleted_at IS NULL
			ORDER BY g.created_at DESC, g.id DESC LIMIT 1) AS latest`

export const MERCHANT_NAME_SQL = "SELECT name FROM tbr_merchants WHERE id::text = $1"

// ─── Update (`@transactionUpdate`) ───────────────────────────────

/** Row lock on the transaction, taken after the wallets (ascending) so no two updates can deadlock. */
export const TRANSACTION_FOR_UPDATE_SQL = `SELECT id, payment_method AS "paymentMethod", status
	FROM tbr_ewallet_transactions WHERE id = $1 FOR UPDATE`

export const TRANSACTION_UPDATE_SQL = `UPDATE tbr_ewallet_transactions
	SET status = $2, invalid_note = $3, updated_at = NOW() WHERE id = $1`

// ─── Riwayat: list, export ───────────────────────────────────────

export type HistoryFilter = {
	date?: string | undefined
	status?: string | undefined
	type?: string | undefined
	search?: string | undefined
}

/**
 * `whereDate()` — one day, or `dd/mm/yyyy - dd/mm/yyyy`. Legacy called `createFromFormat` on each
 * half unguarded, so a half-filled range (the end picker changed while the start was empty) threw
 * a 500; here a range filters only when **both** ends parse, as the Tagihan list does.
 * Comparison is on the Jakarta calendar day, the app timezone legacy read the column in.
 */
const dateCondition = (raw: string, params: SqlParams): string | null => {
	const parts = raw.split(" - ")
	if (parts.length === 1) {
		const day = parseDmy(parts[0]?.trim())
		return day ? `(t.created_at AT TIME ZONE '${TIMEZONE}')::date = ${params.add(day)}::date` : null
	}
	const from = parseDmy(parts[0]?.trim())
	const to = parseDmy(parts[1]?.trim())
	if (!from || !to) return null
	return `(t.created_at AT TIME ZONE '${TIMEZONE}')::date BETWEEN ${params.add(from)}::date AND ${params.add(to)}::date`
}

/**
 * The filters of `list()` / `export()`. Legacy's list wrote the search as a top-level `orWhere`,
 * so typing anything OR-ed the code match with the date/status/type filters instead of narrowing
 * them; here every filter narrows. `withTextSearch` widens the search to what `export()` matched
 * in memory (code, method, name, total).
 */
export const historyWhere = (filter: HistoryFilter, params: SqlParams, withTextSearch: boolean): string => {
	const conditions: string[] = []
	if (filter.date) {
		const condition = dateCondition(filter.date, params)
		if (condition) conditions.push(condition)
	}
	if (filter.status) conditions.push(`t.status = ${params.add(filter.status)}`)
	if (filter.type) conditions.push(`t.type = ${params.add(filter.type)}`)
	if (filter.search) {
		const term = params.add(`%${filter.search}%`)
		const columns = withTextSearch
			? ["t.code", "t.payment_method", "t.name", `${TOTAL_ITEMS_PRICE}::text`]
			: ["t.code"]
		conditions.push(`(${columns.map((column) => `${column} ILIKE ${term}`).join(" OR ")})`)
	}
	return conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : ""
}

/** `initTransactionHistoryEwalletDT` columns: `order: [[5, "desc"]]` is created_at. */
export const HISTORY_SORT_SQL = {
	code: "t.code",
	type: "t.type",
	paymentMethod: "t.payment_method",
	totalAmount: TOTAL_ITEMS_PRICE,
	createdAt: "t.created_at",
	status: "t.status",
} as const

export type HistorySortKey = keyof typeof HISTORY_SORT_SQL

export const HISTORY_DEFAULT_SORT: { orderBy: HistorySortKey; orderDir: "asc" | "desc" } = {
	orderBy: "createdAt",
	orderDir: "desc",
}

export const historyCountSql = (where: string): string =>
	`SELECT count(*)::int AS total FROM tbr_ewallet_transactions t ${ITEMS_JOIN} ${where}`

/** `recordsTotal`: the base query, no filter. */
export const HISTORY_TOTAL_SQL = "SELECT count(*)::int AS total FROM tbr_ewallet_transactions"

/** `st.id DESC` breaks ties so a page never repeats or skips a row when the sort column ties. */
export const historyListSql = (where: string, orderExpr: string, orderDir: string, limitExpr: string, offsetExpr: string): string =>
	`SELECT t.id, t.code, t.type, t.payment_method AS "paymentMethod",
		${TOTAL_ITEMS_PRICE} AS "totalAmount",
		${LOCAL_TIMESTAMP("t.created_at")} AS "createdAt",
		${EPOCH_SECONDS("t.created_at")} AS "createdAtTs",
		t.status
	FROM tbr_ewallet_transactions t
	${ITEMS_JOIN}
	${where}
	ORDER BY ${orderExpr} ${orderDir} NULLS LAST, t.id DESC
	LIMIT ${limitExpr} OFFSET ${offsetExpr}`

// ─── Riwayat: purchase detail (`@detail`) ────────────────────────

export const HISTORY_DETAIL_SQL = `SELECT t.id, t.code, t.type, t.status, t.payment_method AS "paymentMethod",
		${LOCAL_TIMESTAMP("t.created_at")} AS "createdAt",
		${TOTAL_ITEMS_PRICE} AS "totalAmount",
		e.unique_id::text AS "walletUniqueId", e.ewalletable_type AS "ownerType", e.ewalletable_id AS "ownerId",
		se.unique_id::text AS "studentUniqueId", se.student_name AS "studentName"
	FROM tbr_ewallet_transactions t
	${ITEMS_JOIN}
	LEFT JOIN tbr_ewallets e ON e.id = t.ewallet_id
	LEFT JOIN LATERAL (
		SELECT d.ewallet_id FROM tbr_ewallet_transaction_details d
		WHERE d.ewallet_transaction_id = t.id ORDER BY d.id LIMIT 1
	) det ON true
	LEFT JOIN tbr_ewallets se ON se.id = det.ewallet_id
	WHERE t.id = $1`

export const HISTORY_ITEMS_SQL = `SELECT description, price FROM tbr_ewallet_transaction_items
	WHERE ewallet_transaction_id = $1 ORDER BY id`

export const MERCHANT_LABEL_SQL = "SELECT merchant_name AS name FROM tbr_merchants WHERE id::text = $1"

// ─── Riwayat: export rows ────────────────────────────────────────

/**
 * One row per transaction for the workbook: the wallet owner (`ewallet_user_type/name`) and the
 * santri who paid a purchase (first details row, its snapshot columns) — legacy read both through
 * Eloquent relations one row at a time.
 */
export const exportRowsSql = (where: string): string =>
	`SELECT t.id, t.code, t.type, t.status, t.payment_method AS "paymentMethod",
		${TOTAL_ITEMS_PRICE} AS "totalAmount",
		${LOCAL_TIMESTAMP("t.created_at")} AS "createdAt",
		e.unique_id::text AS "walletUniqueId", e.ewalletable_type AS "ownerType",
		e.student_name AS "walletStudentName",
		CASE WHEN e.ewalletable_type = '${EWALLET_MERCHANT_TYPE}' THEN m.name
			WHEN e.ewalletable_type = '${EWALLET_STUDENT_TYPE}' THEN COALESCE(g.fullname, e.student_name)
		END AS "ownerName",
		m.merchant_name AS "merchantName",
		se.unique_id::text AS "studentUniqueId", se.student_name AS "studentName"
	FROM tbr_ewallet_transactions t
	${ITEMS_JOIN}
	LEFT JOIN tbr_ewallets e ON e.id = t.ewallet_id
	LEFT JOIN tbr_merchants m ON e.ewalletable_type = '${EWALLET_MERCHANT_TYPE}' AND m.id::text = e.ewalletable_id
	LEFT JOIN LATERAL (
		SELECT sg.fullname FROM tbr_student_grades sg
		WHERE e.ewalletable_type = '${EWALLET_STUDENT_TYPE}' AND sg.student_id::text = e.ewalletable_id
			AND sg.grade_status = 'active' AND sg.deleted_at IS NULL
		ORDER BY sg.id DESC LIMIT 1
	) g ON true
	LEFT JOIN LATERAL (
		SELECT d.ewallet_id FROM tbr_ewallet_transaction_details d
		WHERE d.ewallet_transaction_id = t.id ORDER BY d.id LIMIT 1
	) det ON true
	LEFT JOIN tbr_ewallets se ON se.id = det.ewallet_id
	${where}
	ORDER BY t.created_at DESC, t.id DESC`

/** The items of every exported transaction, filtered by the same WHERE (no giant id list). */
export const exportItemsSql = (where: string): string =>
	`SELECT i.ewallet_transaction_id::bigint AS "transactionId", i.description, i.price
	FROM tbr_ewallet_transaction_items i
	WHERE i.ewallet_transaction_id IN (SELECT t.id FROM tbr_ewallet_transactions t ${ITEMS_JOIN} ${where})
	ORDER BY i.ewallet_transaction_id, i.id`
