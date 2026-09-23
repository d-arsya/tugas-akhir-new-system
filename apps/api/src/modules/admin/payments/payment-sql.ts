// Raw SQL for the write half of the legacy `StudentInvoiceController`: `@getDataInvoice`
// (467-499), `@createTransaction` (508-538), `@storeTransaction` (546-616),
// `@editTransaction` (624-646), `@updateTransaction` (655-673), `@cancelTransaction`
// (682-741) and `@downloadTransaction` (822-845).
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
 * Every payment link addressed to the given invoices, with the status of the transaction it
 * belongs to. Feeds `invoice-calculator`, which decides on its own which links count — this
 * statement deliberately does **not** filter to `valid`, because `cancelTransaction` has to see
 * the cancelled ones to recompute correctly.
 *
 * Cancellation is a status flip and never a delete, so a link whose transaction row is missing
 * entirely is data damage rather than a cancellation; the LEFT JOIN surfaces it as a NULL
 * status, which the calculator then excludes.
 */
export const SELECT_INVOICE_LINKS_SQL = `SELECT lnk.id,
		lnk.student_invoice_id AS "studentInvoiceId",
		lnk.student_transaction_id AS "studentTransactionId",
		lnk.pay,
		lnk.amount,
		trx.status AS "transactionStatus"
	FROM tbr_student_invoice_transactions lnk
	LEFT JOIN tbr_student_transactions trx ON trx.id = lnk.student_transaction_id
	WHERE lnk.student_invoice_id = ANY($1::bigint[])
	ORDER BY lnk.id`

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

/**
 * `StudentTransaction::create()` in both branches of `storeTransaction` (556-563, 572-579).
 * `status` is NOT NULL DEFAULT 'valid' and legacy never passes it; it is written explicitly here
 * so the row's meaning does not depend on the default surviving a future migration.
 *
 * `desc` is a reserved word in SQL and has to stay quoted.
 */
export const INSERT_TRANSACTION_SQL = `INSERT INTO tbr_student_transactions
		(student_transaction_code, student_grade_id, paid_at, amount, "desc", note, status, created_at, updated_at)
	VALUES ($1, $2, now(), $3, $4, $5, 'valid', now(), now())
	RETURNING id`

/**
 * `$student_transaction->studentInvoices()->attach()` (566-569, 595-598).
 *
 * `amount` is the invoice's outstanding balance snapshotted at payment time and `pay` is what
 * this transaction actually contributed — they differ in 1,039 live rows, which is why `pay`
 * is the only correct basis for "how much was paid".
 */
export const INSERT_LINK_SQL = `INSERT INTO tbr_student_invoice_transactions
		(student_transaction_id, student_invoice_id, amount, pay, created_at, updated_at)
	VALUES ($1, $2, $3, $4, now(), now())`

/** `status` only — the branch that keeps an existing `payment_method` (585-588, 715-718). */
export const SET_INVOICE_STATUS_SQL = `UPDATE tbr_student_invoices
	SET status = $2, updated_at = now()
	WHERE id = $1`

/** `status` and `payment_method` together (590-593, 729-732, and the installment mark at 549). */
export const SET_INVOICE_STATE_SQL = `UPDATE tbr_student_invoices
	SET status = $2, payment_method = $3, updated_at = now()
	WHERE id = $1`

/** `payment_method` only — `storeTransaction`'s installment branch leaves `status` unpaid (565). */
export const SET_INVOICE_PAYMENT_METHOD_SQL = `UPDATE tbr_student_invoices
	SET payment_method = $2, updated_at = now()
	WHERE id = $1`

/** Route-model binding for `{transaction}`, with the row locked for the cancel / note write. */
export const SELECT_TRANSACTION_FOR_UPDATE_SQL = `SELECT t.id,
		t.student_transaction_code::text AS "transactionCode",
		t.student_grade_id AS "studentGradeId",
		t.amount,
		t.status,
		t.note,
		t.cancel_note AS "cancelNote"
	FROM tbr_student_transactions t
	WHERE t.id = $1
	FOR UPDATE`

/** `$transaction->studentInvoices` — the ids this payment touched, pivot order. */
export const SELECT_TRANSACTION_INVOICE_IDS_SQL = `SELECT lnk.student_invoice_id AS "invoiceId"
	FROM tbr_student_invoice_transactions lnk
	WHERE lnk.student_transaction_id = $1
	ORDER BY lnk.id`

/** `cancelTransaction` (695-698): the flip to `invalid` plus the reason. */
export const CANCEL_TRANSACTION_SQL = `UPDATE tbr_student_transactions
	SET status = 'invalid', cancel_note = $2, updated_at = now()
	WHERE id = $1`

/** `updateTransaction` (660-662): the note, always. */
export const UPDATE_TRANSACTION_NOTE_SQL = `UPDATE tbr_student_transactions
	SET note = $2, updated_at = now()
	WHERE id = $1`

/** `updateTransaction` (664-668): the cancel reason, only while the row is already `invalid`. */
export const UPDATE_TRANSACTION_CANCEL_NOTE_SQL = `UPDATE tbr_student_transactions
	SET cancel_note = $2, updated_at = now()
	WHERE id = $1`

/**
 * `downloadTransaction` (822-845) — the receipt header. `studentGradeWithTrashed` is what the
 * blades read, so a santri deleted after paying still prints their own name; there is no
 * `deleted_at` filter here for exactly that reason.
 */
export const SELECT_RECEIPT_SQL = `SELECT t.id,
		t.student_transaction_code::text AS "transactionCode",
		t.paid_at AS "paidAt",
		t.amount,
		t."desc",
		t.status,
		sg.fullname,
		sg.grade::text AS grade,
		sg.sub_grade AS "subGrade",
		s.nis
	FROM tbr_student_transactions t
	LEFT JOIN tbr_student_grades sg ON sg.id = t.student_grade_id
	LEFT JOIN tbr_students s ON s.id = sg.student_id
	WHERE t.id = $1`

/**
 * The receipt's cost lines. Legacy indexes `$amount[]` by the position of `$invoices`, filled
 * from `$transaction->studentInvoiceTransations[$key]->pay` — two separately ordered relations
 * lined up by position. Joining the pivot to the invoice removes the assumption entirely.
 */
export const SELECT_RECEIPT_ITEMS_SQL = `SELECT lnk.id,
		lnk.student_invoice_id AS "invoiceId",
		lnk.pay,
		i.name
	FROM tbr_student_invoice_transactions lnk
	LEFT JOIN tbr_student_invoices i ON i.id = lnk.student_invoice_id
	WHERE lnk.student_transaction_id = $1
	ORDER BY lnk.id`

/**
 * `SettingSchool::first()` plus the three lookups behind the `school_invoice_address` accessor
 * (`SettingSchool.php:38-46` → `Helper.php:228-297`). Each helper swallows a missing row and
 * returns `""`, which the LEFT JOINs reproduce as NULL.
 */
export const SELECT_RECEIPT_SCHOOL_SQL = `SELECT ss.name,
		ss.phone::text AS phone,
		ss.full_address AS "fullAddress",
		d.name AS "districtName",
		r.name AS "regencyName",
		p.name AS "provinceName"
	FROM tbr_setting_schools ss
	LEFT JOIN tbr_districts d ON d.id = ss.district_id
	LEFT JOIN tbr_regencies r ON r.id = ss.regency_id
	LEFT JOIN tbr_provinces p ON p.id = ss.province_id
	ORDER BY ss.id
	LIMIT 1`
