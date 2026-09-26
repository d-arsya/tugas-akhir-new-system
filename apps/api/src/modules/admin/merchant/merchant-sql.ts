import { EPOCH_SECONDS, LOCAL_TIMESTAMP } from "@admin/common/sql"

// Raw SQL behind Data Master ▸ Merchant — legacy `MerchantController`.
//
// Legacy has no `show()` and no `destroy()`, so there is no delete statement here, and no
// upload either: `photo` is written by the merchant app and only read back by this menu.

export type MerchantSqlRow = {
	id: string
	uniqueNumber: string
	name: string | null
	merchantName: string | null
	email: string | null
	localCreatedAt: string | null
	createdAtTs: string | null
	isBlocked: boolean | null
}

export type MerchantDetailSqlRow = MerchantSqlRow & {
	gender: string | null
	address: string | null
	phone: string | null
	photo: string | null
}

/**
 * `@list`: `Merchant::get()` — no where, no order, no limit, then yajra's **collection**
 * engine numbers the rows. Legacy therefore rendered them in whatever order Postgres
 * returned; `ORDER BY id` pins that down so two draws agree after a row is rewritten.
 */
export const MERCHANT_LIST_SQL = `SELECT m.id, m.unique_number AS "uniqueNumber", m.name,
		m.merchant_name AS "merchantName", m.email, m.is_blocked AS "isBlocked",
		${LOCAL_TIMESTAMP("m.created_at")} AS "localCreatedAt",
		${EPOCH_SECONDS("m.created_at")} AS "createdAtTs"
	FROM tbr_merchants m
	ORDER BY m.id`

/** Route-model binding — `SELECT * FROM merchants WHERE id = ? LIMIT 1`. */
export const MERCHANT_BY_ID_SQL = `SELECT m.id, m.unique_number AS "uniqueNumber", m.name,
		m.merchant_name AS "merchantName", m.email, m.is_blocked AS "isBlocked",
		m.gender, m.address, m.phone, m.photo,
		${LOCAL_TIMESTAMP("m.created_at")} AS "localCreatedAt",
		${EPOCH_SECONDS("m.created_at")} AS "createdAtTs"
	FROM tbr_merchants m
	WHERE m.id = $1`

/**
 * `generateUniqueNumber()`:
 * `Merchant::whereYear('created_at', today()->format('Y'))->max('id')`, then
 * `today()->format('Y') . str_pad($max + 1, 3, '0', STR_PAD_LEFT)`.
 *
 * `today()` is Jakarta-local, so the year filter is too — `EXTRACT(YEAR FROM created_at)`
 * alone would read the session time zone. `max(id)` is a **global** id, not a per-year
 * counter, and NULL (no merchant created this year) makes the first number `<year>001`.
 */
export const MERCHANT_NEXT_NUMBER_SQL = `SELECT to_char(now() AT TIME ZONE 'Asia/Jakarta', 'YYYY')
		|| lpad((coalesce(max(m.id), 0) + 1)::text, 3, '0') AS "uniqueNumber"
	FROM tbr_merchants m
	WHERE date_part('year', m.created_at AT TIME ZONE 'Asia/Jakarta')
		= date_part('year', now() AT TIME ZONE 'Asia/Jakarta')`

/** `unique:merchants` / `unique:merchants,email,{id}` — the rule zod cannot express. */
export const MERCHANT_EMAIL_TAKEN_SQL = `SELECT m.id FROM tbr_merchants m
	WHERE lower(m.email) = lower($1) AND ($2::bigint IS NULL OR m.id <> $2::bigint)
	LIMIT 1`

/**
 * `Merchant::create($request->validated() + ['unique_number' => …, 'password' => bcrypt(…)])`.
 * `enabled_2fa` and `photo` are left at their column defaults, exactly as `create()` does.
 */
export const MERCHANT_INSERT_SQL = `INSERT INTO tbr_merchants
		(name, gender, email, merchant_name, address, phone, is_blocked, unique_number, password,
		 created_at, updated_at)
	VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, now(), now())
	RETURNING id`

/** `$merchant->update($request->validated())` — `unique_number` is never submitted. */
export const MERCHANT_UPDATE_SQL = `UPDATE tbr_merchants
	SET name = $2, gender = $3, email = $4, merchant_name = $5, address = $6, phone = $7,
		is_blocked = $8, updated_at = now()
	WHERE id = $1`

/**
 * The status sync legacy runs after every update:
 * `Ewallet::where('unique_id', $merchant->unique_number)->first()->update(['is_active' => …])`.
 *
 * `ewallets.unique_id` is a **bigint** and `merchants.unique_number` a **varchar**, so
 * Postgres needs the cast spelled out; casting the column to text rather than the parameter
 * to bigint keeps a non-numeric `unique_number` from raising `invalid input syntax`.
 *
 * Legacy matches on this column rather than the `ewalletable_type`/`ewalletable_id` morph the
 * rest of the app uses, and does not guard `->first()` — a merchant with no wallet 500-ed the
 * request *after* the merchant row had already been written. Kept as the lookup key
 * (plan decision), guarded here.
 */
export const EWALLET_BY_UNIQUE_NUMBER_SQL = `SELECT e.id, e.is_active AS "isActive"
	FROM tbr_ewallets e
	WHERE e.unique_id::text = $1
	ORDER BY e.id
	LIMIT 1`

/** The force-write: every save re-asserts `is_active = NOT is_blocked`, even when unchanged. */
export const EWALLET_SET_ACTIVE_SQL = `UPDATE tbr_ewallets SET is_active = $2, updated_at = now() WHERE id = $1`
