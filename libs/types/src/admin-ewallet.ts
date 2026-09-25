// Contract for the admin "Dompet" (E-Wallet) menu.
// Ported 1:1 from the legacy Laravel admin (EwalletController + EwalletTransactionHistoryController,
// 22 routes, all gated `can:do-as-cashier` — Superadmin and Kasir E-Wallet only).
//
// Conventions, the same as the earlier menus:
//   * the baked-in `$no` counter is dropped — the table indexes rows itself;
//   * `<span class='tbr_label…'>` HTML becomes an enum, rendered by <LegacyLabel>;
//   * a hidden `<span class="d-none">{unix}</span>` sort key becomes a `*Ts` field;
//   * money is a `number` (every column is bigint in the database; the API converts).
//
// The database quirks a port has to know about are in the plan; the ones that leak into
// this contract are: `ewalletable_type` is a PHP class string (here `EwalletOwnerType`),
// `pin` is a plaintext integer that is NEVER sent to the browser, and `total_balance` is a
// stored cache that disagrees with the ledger on most wallets — so the list, the widgets and
// the balance export show `storedBalance` while the detail page shows the recomputed one.

import type { ServerTableQuery } from "./admin-payments"

// --- Shared vocabulary ----------------------------------------------------------------

/** `tbr_ewallets.ewalletable_type`: `App\Models\Student` | `App\Models\Merchant`. */
export type EwalletOwnerType = "santri" | "merchant"

/** `tbr_ewallet_transactions.type`. Free text in the database; these are the only live values. */
export type EwalletTransactionKind = "income" | "expense" | "purchase"

/**
 * `tbr_ewallet_transactions.status`. Free text in the database. Only `valid` rows move a
 * balance. `EwalletService::statusLabel`: Menunggu | Diproses | Berhasil | Gagal.
 */
export type EwalletTransactionStatus = "waiting" | "process" | "valid" | "invalid"

/** `tbr_ewallet_transactions.payment_method` — the three values that exist. */
export type EwalletPaymentMethod = "Cash" | "Bank Transfer (Manual)" | "E-Wallet"

// --- Akun Dompet: the list (legacy EwalletController@ewalletList, yajra server-side) ----

export type EwalletActiveFilter = "active" | "inactive"

export type EwalletListQuery = ServerTableQuery & {
	/** `#ewallet` — Aktif / Nonaktif. */
	status?: EwalletActiveFilter
	/** `#member` — Santri / Merchant. */
	member?: EwalletOwnerType
}

export type EwalletListRow = {
	/** `tbr_ewallets.id`, what every wallet-scoped route keys on. */
	id: number
	/** `unique_id` — bigint in the database, a string here. */
	uniqueId: string | null
	ownerName: string | null
	ownerType: EwalletOwnerType
	/** The stored `total_balance`, not the recomputed one. */
	storedBalance: number
	/** `ewallet_transactions_count` — every status, own rows only. */
	transactionCount: number
	isActive: boolean
	/**
	 * The red badge beside the id (`Ewallet::getProcessedTransactionsCountAttribute`):
	 * students count `process` rows, merchants count `waiting` rows.
	 */
	processCount: number
}

/** `ewallet.widget` — legacy ran six `SUM`s; the three figures are one query here. */
export type EwalletWidgetQuery = {
	status?: EwalletActiveFilter
	member?: EwalletOwnerType
}

export type EwalletWidget = {
	total: number
	student: number
	merchant: number
}

/** The sidebar's red badge on "Akun Dompet" (`ViewServiceProvider`): `EwalletTransaction::process()->count()`. */
export type EwalletBadge = {
	count: number
}

// --- Detail (legacy EwalletController@detail, _partials/{student,merchant}-detail) ------

export type EwalletStudentOwner = {
	kind: "santri"
	name: string | null
	photoUrl: string | null
	/** `level->name, Kelas N` from the active grade, else the snapshot columns on the wallet. */
	levelAndGrade: string
	/** Nama Orang Tua atau Wali. */
	parentName: string | null
	nis: string | null
	/** `students.student_status` — `withdraw` for an inactive santri is still allowed. */
	studentStatus: string | null
}

export type EwalletMerchantOwner = {
	kind: "merchant"
	name: string | null
	photoUrl: string | null
	merchantName: string | null
	address: string | null
	phone: string | null
	uniqueNumber: string | null
}

export type EwalletOwner = EwalletStudentOwner | EwalletMerchantOwner

export type EwalletDetail = {
	id: number
	uniqueId: string | null
	ownerType: EwalletOwnerType
	isActive: boolean
	owner: EwalletOwner
	/** `Ewallet::total_saldo` — recomputed from the ledger, not the stored column. */
	balance: number
	/** The blade's `@if ($ewallet->is_active == 1)` ladder, decided once by the API. */
	canTopUp: boolean
	canWithdraw: boolean
	/** The orange "?" tooltip beside the buttons, shown only when the wallet is inactive. */
	showInactiveNotice: boolean
	/** What the QR encodes (`unique_id`) and the caption under it ("NISP …" / "No Merchant …"). */
	qrValue: string | null
	qrCaption: string
}

// --- Per-wallet transactions (legacy @transactionList — a client-side DataTable) ---------

/** Where the row's action icon goes: a cash/bank detail, the purchase (history) detail, or nowhere. */
export type EwalletTransactionTarget = "transaction" | "history" | "none"

export type EwalletWalletTransactionRow = {
	id: number
	code: string | null
	/** "Pembelian - {merchant}" / "Penjualan - {name}" for purchases, else the stored `name`. */
	name: string
	paymentMethod: string | null
	/** `total_items_price` — the items' sum when there are items, else `amount`. */
	amount: number
	/** `d F Y, H:i`. */
	createdAt: string
	createdAtTs: number
	type: EwalletTransactionKind
	status: EwalletTransactionStatus
	target: EwalletTransactionTarget
}

// --- Cash top-up and withdraw ----------------------------------------------------------

/** `TopUpRequest`. The amount is a real number ≥ 1.000 here; legacy only checked `min:4` characters. */
export type EwalletAmountDto = {
	amount: number
}

/** Legacy @validatePin. */
export type EwalletPinDto = {
	pin: string
}

/**
 * The amount parked between "Selanjutnya" and the PIN page. Legacy kept it in the PHP session;
 * the port keeps it on the server too, keyed by user and wallet, and the withdraw route takes
 * no body — it withdraws exactly this, and only once the PIN has been verified for it.
 */
export type EwalletPendingWithdraw = {
	amount: number
	pinVerified: boolean
}

/** `defaultAjax` answers `{ message, redirect? }`; a wrong PIN that locks the wallet adds `redirect`. */
export type EwalletMoneyResult = {
	message: string
	redirect?: string
}

// --- Setting and PIN (legacy setting.blade.php) -----------------------------------------

export type EwalletSettingPage = {
	id: number
	uniqueId: string | null
	ownerType: EwalletOwnerType
	isActive: boolean
	owner: EwalletOwner
	/** The owner's email, shown read-only on the "Reset pin" card. */
	ownerEmail: string | null
	/** True when the owner is blocked (`is_blocked`) — legacy then hides the email and status forms. */
	ownerBlocked: boolean
	/** Seconds until another reset email may be sent, or 0. Legacy kept this in a raw cookie. */
	resetEmailRetryAfter: number
}

export type EwalletSettingDto = {
	isActive: boolean
}

// --- Transaction detail (legacy @transactionDetail / @transactionUpdate) ----------------

export type EwalletTransactionDetail = {
	id: number
	code: string | null
	name: string | null
	type: EwalletTransactionKind
	status: EwalletTransactionStatus
	paymentMethod: string | null
	/** `amount + transfer_news_number` — the bank transfer's unique code is part of what was paid. */
	totalAmount: number
	transferNewsNumber: number | null
	/** `d M Y \j\a\m H:i`. */
	createdAt: string
	paymentDate: string | null
	paymentNote: string | null
	invalidNote: string | null
	paymentOnBehalfOf: string | null
	/** Presigned or public URL of the uploaded proof, when there is one. */
	paymentAttachmentUrl: string | null
	ewallet: { id: number; uniqueId: string | null; ownerType: EwalletOwnerType }
	/** "Dibuat oleh / Dikonfirmasi oleh" on a bank transfer — the santri's active-grade name. */
	requesterName: string | null
	/** Cash expense: "Penerima" is the wallet owner's name. */
	recipientName: string | null
	/**
	 * False for a `valid` Cash top-up or withdrawal: those can no longer be changed (a decision
	 * taken for this port; legacy let any row flip to any status).
	 */
	editable: boolean
}

export type EwalletTransactionUpdateDto = {
	status: EwalletTransactionStatus
	/** Required when `status` is `invalid` ("Kolom catatan wajib untuk diisi."). */
	invalidNote?: string
}

// --- Riwayat Transaksi (legacy EwalletTransactionHistoryController) ---------------------

export type EwalletHistoryQuery = ServerTableQuery & {
	/** `dd/mm/yyyy` or `dd/mm/yyyy - dd/mm/yyyy`, as the date-range picker writes it. */
	date?: string
	status?: EwalletTransactionStatus
	type?: EwalletTransactionKind
}

export type EwalletHistoryRow = {
	id: number
	code: string | null
	type: EwalletTransactionKind
	paymentMethod: string | null
	totalAmount: number
	/** `d F Y, H:i`. */
	createdAt: string
	createdAtTs: number
	status: EwalletTransactionStatus
	/** Legacy renders the action link only when the row is `valid`. */
	target: EwalletTransactionTarget
}

export type EwalletHistoryDetail = {
	id: number
	code: string | null
	type: EwalletTransactionKind
	status: EwalletTransactionStatus
	paymentMethod: string | null
	createdAt: string
	totalAmount: number
	items: Array<{ description: string; price: number }>
	merchant: { uniqueId: string | null; name: string | null }
	student: { uniqueId: string | null; name: string | null }
}

// --- Print and export --------------------------------------------------------------------

export type EwalletQrPrint = {
	qrValue: string | null
	caption: string
	name: string | null
}

/** `qrCodePrintAll` — one page for every santri, encoding the NIS (legacy's own inconsistency, kept). */
export type EwalletQrPrintAllRow = {
	name: string | null
	nis: string | null
	qrValue: string | null
}

export type EwalletBalanceExportQuery = {
	status?: EwalletActiveFilter
	member?: EwalletOwnerType
}

export type EwalletHistoryExportQuery = {
	date?: string
	status?: EwalletTransactionStatus
	type?: EwalletTransactionKind
	search?: string
}
