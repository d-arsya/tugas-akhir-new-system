import type { EntityManager } from "typeorm"

/**
 * Single source of truth for "how much is in this wallet". Both the admin Dompet module
 * and, in time, the santri/merchant portals should call this instead of re-deriving it.
 * The portal's `EwalletService.calculateBalance` reads every row into memory and runs one
 * query per purchase; this is one statement.
 *
 * Ported from legacy `Ewallet::getTotalSaldoAttribute` (`app/Models/Ewallet.php:35`):
 *
 *   santri   = valid income − valid expense − Σ valid purchases the santri PAID
 *              (reached through `tbr_ewallet_transaction_details`, because a purchase row
 *              itself sits on the *merchant's* wallet)
 *   merchant = valid income − valid expense + Σ valid purchases on its own wallet
 *   other    = 0
 *
 * A purchase's price is `EwalletTransaction::getTotalItemsPriceAttribute`: the sum of its
 * items when it has any, otherwise `amount`.
 *
 * Only `valid` rows count. `waiting`, `process` and `invalid` never move a balance.
 *
 * Type traps, all handled here so callers never see them:
 *   * every money column is bigint and node-postgres returns strings → `Number()`;
 *   * `details.ewallet_id` / `details.ewallet_transaction_id` and `items.ewallet_transaction_id`
 *     are **numeric**, so they are compared as-is against bigint ids (Postgres widens them);
 *   * 3 live transactions carry **duplicate detail rows** — `EXISTS` (not a join) keeps a
 *     purchase from being counted twice;
 *   * `ewalletable_type` is the PHP class string, not a friendly name.
 */
export const EWALLET_STUDENT_TYPE = "App\\Models\\Student"
export const EWALLET_MERCHANT_TYPE = "App\\Models\\Merchant"

/** The price of one purchase row: its items' sum when it has items, else its `amount`. */
const PURCHASE_PRICE_SQL = `COALESCE(
	(SELECT SUM(i.price) FROM tbr_ewallet_transaction_items i WHERE i.ewallet_transaction_id = t.id),
	t.amount
)`

const BALANCE_SQL = `
SELECT
	e.ewalletable_type AS owner_type,
	COALESCE((SELECT SUM(t.amount) FROM tbr_ewallet_transactions t
		WHERE t.ewallet_id = e.id AND t.type = 'income' AND t.status = 'valid'), 0) AS income,
	COALESCE((SELECT SUM(t.amount) FROM tbr_ewallet_transactions t
		WHERE t.ewallet_id = e.id AND t.type = 'expense' AND t.status = 'valid'), 0) AS expense,
	COALESCE((SELECT SUM(${PURCHASE_PRICE_SQL}) FROM tbr_ewallet_transactions t
		WHERE t.ewallet_id = e.id AND t.type = 'purchase' AND t.status = 'valid'), 0) AS sales,
	COALESCE((SELECT SUM(${PURCHASE_PRICE_SQL}) FROM tbr_ewallet_transactions t
		WHERE t.type = 'purchase' AND t.status = 'valid'
		AND EXISTS (SELECT 1 FROM tbr_ewallet_transaction_details d
			WHERE d.ewallet_transaction_id = t.id AND d.ewallet_id = e.id)), 0) AS purchases
FROM tbr_ewallets e
WHERE e.id = $1
`

type BalanceSqlRow = {
	owner_type: string | null
	income: string
	expense: string
	sales: string
	purchases: string
}

/** `Ewallet::total_saldo`. Returns 0 for a wallet that does not exist, as legacy's `else` branch does. */
export const computeBalance = async (manager: EntityManager, ewalletId: number): Promise<number> => {
	const rows = (await manager.query(BALANCE_SQL, [ewalletId])) as BalanceSqlRow[]
	const row = rows[0]
	if (!row) return 0
	const income = Number(row.income)
	const expense = Number(row.expense)
	if (row.owner_type === EWALLET_STUDENT_TYPE) return income - expense - Number(row.purchases)
	if (row.owner_type === EWALLET_MERCHANT_TYPE) return income - expense + Number(row.sales)
	return 0
}

/**
 * Takes the wallet's row lock (`SELECT … FOR UPDATE`) and answers whether it exists. Every
 * write that changes a balance calls this **first**, inside its transaction: legacy checked the
 * balance and wrote it without one, so two parallel withdrawals could both pass "Saldo tidak
 * mencukupi." and overdraw.
 */
export const lockWallet = async (manager: EntityManager, ewalletId: number): Promise<boolean> => {
	const rows = (await manager.query("SELECT id FROM tbr_ewallets WHERE id = $1 FOR UPDATE", [ewalletId])) as unknown[]
	return rows.length > 0
}

/**
 * Recomputes the balance and writes it to `tbr_ewallets.total_balance`, which is what legacy's
 * `$ewallet->update(['total_balance' => $ewallet->total_saldo])` did after topUp, withdraw and
 * transactionUpdate. It also "heals" a drifted wallet on the first write — that is legacy's
 * behaviour and it is kept; nothing rewrites balances in bulk.
 */
export const syncBalance = async (manager: EntityManager, ewalletId: number): Promise<number> => {
	const balance = await computeBalance(manager, ewalletId)
	await manager.query("UPDATE tbr_ewallets SET total_balance = $2, updated_at = NOW() WHERE id = $1", [
		ewalletId,
		balance,
	])
	return balance
}

/**
 * The wallets a transaction's status change moves. For a purchase that is the merchant's wallet
 * (`tbr_ewallet_transactions.ewallet_id`) **and** the santri who paid (via the details pivot);
 * legacy refreshed only the first, so the santri's stored balance went stale. Duplicate detail
 * rows collapse here.
 */
export const walletsAffectedBy = async (manager: EntityManager, transactionId: number): Promise<number[]> => {
	const rows = (await manager.query(
		`SELECT t.ewallet_id::bigint AS id FROM tbr_ewallet_transactions t
			WHERE t.id = $1 AND t.ewallet_id IS NOT NULL
		UNION
		SELECT d.ewallet_id::bigint FROM tbr_ewallet_transaction_details d
			WHERE d.ewallet_transaction_id = $1 AND d.ewallet_id IS NOT NULL`,
		[transactionId],
	)) as Array<{ id: string }>
	return rows.map((row) => Number(row.id))
}
