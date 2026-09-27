// Raw SQL for the write half of the legacy `StudentInvoiceController`: `@getDataInvoice`
// (467-499), `@createTransaction` (508-538), `@storeTransaction` (546-616),
// `@editTransaction` (624-646), `@updateTransaction` (655-673) and `@cancelTransaction`
// (682-741).
//
// Legacy walks all of these as Eloquent relations, one `StudentInvoice::find()` per selected
// id and one `$invoice->studentTransactions` per invoice, so a five-invoice payment fires
// eleven queries and a cancel fires 2N+1. Each loop below collapses to a single statement.
//
// Two rules from the shared brief apply throughout:
//   * every join to a lookup table is a LEFT JOIN — the schema has zero foreign keys and 496
//     live invoices already point at accountancy ids that no longer exist;
//   * money and id columns are `bigint`, which node-postgres returns as **strings**, so every
//     reader normalises through `toAmount()` / `Number()` at the boundary.

/**
 * The selected invoices, locked for the duration of the write (fix F-7 — legacy wrapped neither
 * `storeTransaction` nor `cancelTransaction` in a transaction at all).
 *
 * `ORDER BY i.id` before `FOR UPDATE` is what stops two concurrent payments over an overlapping
 * selection from deadlocking: every session takes the row locks in the same order.
 *
 * `notYetDue` is the arrears flag legacy computes in PHP as `$invoice->due_date > Carbon::now()`.
 * `due_date` is a `date`, which Eloquent hydrates to midnight in the app timezone, so that
 * comparison is true exactly when the due date is a **later day** than today in Asia/Jakarta —
 * an invoice due today is already arrears. A NULL `due_date` compares false in PHP too, so it
 * also counts as arrears; `IS NOT NULL` keeps that, rather than letting SQL answer NULL.
 */
export const SELECT_INVOICES_FOR_UPDATE_SQL = `SELECT i.id,
		i.name,
		i.amount,
		i.status,
		i.payment_method AS "paymentMethod",
		i.student_grade_id AS "studentGradeId",
		to_char(i.due_date, 'YYYY-MM-DD') AS "dueDate",
		(i.due_date IS NOT NULL AND i.due_date > (now() AT TIME ZONE 'Asia/Jakarta')::date) AS "notYetDue"
	FROM tbr_student_invoices i
	WHERE i.id = ANY($1::bigint[])
	ORDER BY i.id
	FOR UPDATE`

/** The same projection without the lock, for the read-only `prepare` step. */
export const SELECT_INVOICES_SQL = `SELECT i.id,
		i.name,
		i.amount,
		i.status,
		i.payment_method AS "paymentMethod",
		i.student_grade_id AS "studentGradeId",
		to_char(i.due_date, 'YYYY-MM-DD') AS "dueDate",
		(i.due_date IS NOT NULL AND i.due_date > (now() AT TIME ZONE 'Asia/Jakarta')::date) AS "notYetDue"
	FROM tbr_student_invoices i
	WHERE i.id = ANY($1::bigint[])
	ORDER BY i.id`

/**
 * Fix F-9. `UUIDTraits::generateTransactionId()` (42-59) reads `YYYYMMDD001`, asks whether it is
 * taken, and increments until it is free — then returns, and the caller inserts some statements
 * later. There is no unique index on `student_transaction_code`, so two bendahara saving at the
 * same moment both read the same free code and both keep it.
 *
 * The lock is taken on the day bucket rather than the table, so payments recorded on different
 * days never wait on each other, and `pg_advisory_xact_lock` releases at COMMIT or ROLLBACK
 * without any unlock call. Adding the unique index the column should have is a schema change,
 * which this port is not allowed to make.
 */
export const LOCK_TRANSACTION_CODE_DAY_SQL = `SELECT pg_advisory_xact_lock($1::bigint)`

/**
 * Today's bucket, `YYYYMMDD * 1000`, so the first code of the day is `YYYYMMDD001` exactly as
 * legacy's `now()->format('Y').format('m').format('d').str_pad(1, 3, "0")` produces it.
 *
 * The day is resolved in SQL rather than from the Node clock so it agrees with the arrears
 * comparison above and with Laravel's `config('app.timezone') = 'Asia/Jakarta'`, whatever the
 * API container's own timezone happens to be.
 */
export const TRANSACTION_CODE_DAY_BASE_SQL = `SELECT to_char((now() AT TIME ZONE 'Asia/Jakarta')::date, 'YYYYMMDD')::bigint * 1000 AS "dayBase"`

/**
 * The next free code in today's bucket. Legacy counts up from `001`, which is the same answer
 * whenever the day's codes are contiguous — and they are, because this is the only writer.
 * `$1` is `YYYYMMDD * 1000`, so the bucket is `[$1, $1 + 1000)`.
 */
export const NEXT_TRANSACTION_CODE_SQL = `SELECT COALESCE(MAX(t.student_transaction_code), $1::bigint) + 1 AS "nextCode"
	FROM tbr_student_transactions t
	WHERE t.student_transaction_code >= $1::bigint
		AND t.student_transaction_code < $1::bigint + 1000`

/**
 * Both id sequences are **behind their table's own MAX(id)** in the live database:
 * `tbr_student_transactions` holds ids up to 9762 while its sequence sits at 9746, and
 * `tbr_student_invoice_transactions` holds 15433 against 15384. Rows 9747-9762 are a bulk
 * back-dated import written with explicit ids and no `setval`, which is what left the gap.
 *
 * Any insert that draws from the sequence therefore fails on the primary key — legacy's next
 * payment would have failed exactly the same way. `setval` to `GREATEST(last_value, MAX(id))`
 * only ever moves a sequence **forward** to the truth, is a no-op once it is correct, and cannot
 * hand out an id that is already in use. The permanent repair belongs in the live database and
 * is the lead's to apply; this keeps the payment write from failing in the meantime.
 */
export const SYNC_TRANSACTION_SEQUENCE_SQL = `SELECT setval('tbr_student_transactions_id_seq',
		GREATEST(
			(SELECT last_value FROM tbr_student_transactions_id_seq),
			(SELECT COALESCE(MAX(id), 1) FROM tbr_student_transactions)
		), true)`

export const SYNC_LINK_SEQUENCE_SQL = `SELECT setval('tbr_student_invoice_transactions_id_seq',
		GREATEST(
			(SELECT last_value FROM tbr_student_invoice_transactions_id_seq),
			(SELECT COALESCE(MAX(id), 1) FROM tbr_student_invoice_transactions)
		), true)`
