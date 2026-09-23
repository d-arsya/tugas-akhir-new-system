// Contract for the admin "Pembayaran Santri" menu, phase 1: Tagihan Santri and
// Riwayat Transaksi. Ported 1:1 from the legacy Laravel admin
// (StudentInvoiceController, StudentTransactionController).
//
// Legacy list endpoints answer yajra DataTables payloads whose cells are
// PHP-rendered HTML. Each becomes a typed row, following the same rules the
// Data Master contract established:
//   * the baked-in `$no` counter is dropped — the table indexes rows itself;
//   * `<span class='tbr_label…'>` becomes an enum, rendered by <LegacyLabel>;
//   * a hidden `<span class="d-none">{unix}</span>` sort key becomes a `*Ts` field.
//
// Three of these lists are `serverSide` in legacy (the student list, the Tagihan
// tab and the Riwayat index), which is new for this port — every Data Master list
// was client-side.

// --- Server-side table plumbing -------------------------------------------------------

export type ServerTableSortDir = "asc" | "desc"

/** Query for a server-paged list. Mirrors what legacy read out of the DataTables request. */
export type ServerTableQuery = {
	page: number
	limit: number
	search?: string
	orderBy?: string
	orderDir?: ServerTableSortDir
}

/**
 * Answer for a server-paged list. `recordsFiltered` drives the "Dimunculkan dari
 * total N" caption that legacy overwrote client-side from `data.json.recordsFiltered`.
 */
export type ServerTableResult<TRow> = {
	rows: TRow[]
	recordsTotal: number
	recordsFiltered: number
}

// --- Tagihan Santri: the student picker (legacy StudentInvoiceController@index) --------

export type StudentInvoiceListQuery = ServerTableQuery & {
	/** `Grade.label`, from the `#grade` select2. */
	grade?: string
	/** `SubGrade.label`, or the literal "Undefined" option. */
	subGrade?: string
}

export type StudentInvoiceListRow = {
	/** `student_grades.id` — every downstream route keys on this, never `students.id`. */
	studentGradeId: number
	studentId: number
	nis: string | null
	fullName: string | null
	/** `father_fullname` when set, else `guardian_fullname`. */
	parentOrGuardian: string | null
	grade: string | null
	subGrade: string | null
	/** Count of invoices with `validity_status = true`. */
	invoiceCount: number
	/** Count of those that are still `unpaid`. */
	unpaidCount: number
}

// --- Tagihan Santri: one student's detail page ----------------------------------------

/** The student card rendered down the left of every Tagihan detail page. */
export type InvoiceStudentCard = {
	studentGradeId: number
	studentId: number
	nis: string | null
	fullName: string | null
	photoUrl: string | null
	academicYear: string | null
	levelName: string | null
	grade: string | null
	subGrade: string | null
	fatherName: string | null
}

/** The three widget tiles above the tabs. */
export type InvoiceDetailSummary = {
	/** "Total belum dibayar" — floored at 0, as legacy does. */
	totalUnpaid: number
	/** "Item belum dibayar" — count of `status = 'unpaid'`. */
	unpaidItemCount: number
	/** "Item diangsur" — unpaid AND `payment_method = 'installment'`. */
	installmentItemCount: number
}

export type InvoiceDetailPage = {
	student: InvoiceStudentCard
	summary: InvoiceDetailSummary
	/** Child accountancies with `is_student_cost = 1`, for the cost dropdown. */
	costOptions: { id: number; name: string | null }[]
}

// --- Tagihan tab (legacy @listBillServerSide) -----------------------------------------

export type InvoiceStatusLabel = "Belum Dibayar" | "Dibayar" | "Diangsur"

/**
 * The two eye-toggles above the Tagihan table. Legacy's default is both `deactive`,
 * which filters to `status='unpaid' AND reminder < now()` — i.e. only invoices past
 * their reminder date, which is not obvious from the UI.
 */
export type InvoiceBillFilter = {
	paid: "active" | "deactive"
	unpaid: "active" | "deactive"
	/** Matches `student_invoices.name` LIKE; mutually exclusive with `search` in legacy. */
	cost?: string
}

export type InvoiceBillQuery = ServerTableQuery & InvoiceBillFilter

export type InvoiceBillRow = {
	id: number
	name: string | null
	amount: number
	/** `SUM(pay)` over links whose transaction is still `valid`. */
	paid: number
	/** `amount - paid`; may be negative when a payment overshot. */
	balance: number
	status: "paid" | "unpaid" | null
	paymentMethod: "cash" | "installment" | null
	statusLabel: InvoiceStatusLabel | null
	dueDate: string | null
	dueDateTs: number | null
	/** Past due and not settled — legacy paints the row `#FDEDEF` by scraping the cell HTML. */
	isOverdue: boolean
	/** Legacy renders a checkbox only for `status = 'unpaid'`. */
	selectable: boolean
}

// --- Riwayat / Dibatalkan tabs (client-side in legacy) --------------------------------

export type InvoiceTransactionRow = {
	id: number
	transactionCode: string | null
	paidAt: string | null
	paidAtTs: number | null
	amount: number
	/** Number of invoices this one payment settled. */
	itemCount: number
	description: string | null
	/** Only on the Dibatalkan tab; legacy shows it as a tooltip. */
	cancelNote?: string | null
}

// --- One invoice (legacy @detailBill) -------------------------------------------------

export type InvoiceBillDetail = {
	id: number
	/** Legacy splits `name` on " Bulan" / " ke" — the head becomes the title. */
	name: string | null
	title: string
	/** The badge after the title, e.g. "Juli 2022" or "ke 2"; empty when the name has neither marker. */
	periodBadge: string
	amount: number
	dueDate: string | null
	createdAt: string | null
	note: string | null
	student: InvoiceStudentCard
	transactions: {
		id: number
		transactionCode: string | null
		note: string | null
		paidAt: string | null
		/** This transaction's contribution to THIS invoice (`pivot.pay`), not its total. */
		pay: number
	}[]
	totalPaid: number
	/** "Sisa yang harus dibayar" — initialised from `amount`, not 0. */
	costRemain: number
}

export type UpdateInvoiceNoteDto = {
	note: string | null
}

// --- Recording a payment (legacy @getDataInvoice → @createTransaction → @storeTransaction)

/**
 * Legacy stored the selection in one global session key (`idInvoice`) that was not
 * bound to the student, so two tabs could pay student A's invoices against student B.
 * The port carries the selection explicitly instead.
 */
export type InvoiceSelectionDto = {
	studentGradeId: number
	invoiceIds: number[]
}

export type InvoiceSelectionResult = {
	studentGradeId: number
	items: {
		invoiceId: number
		name: string | null
		dueDate: string | null
		/** Remaining balance for this invoice — what the payment form bills. */
		amount: number
	}[]
	/** Sum of `items[].amount`. */
	total: number
}

export type CreateTransactionDto = {
	studentGradeId: number
	invoiceIds: number[]
	/** Keterangan. */
	desc: string
	/** Masked rupiah from autoNumeric, e.g. "1.500.000". */
	amount: string
	note?: string | null
}

export type CreateTransactionResult = {
	message: string
	transactionId: number
	/** Frontend path; legacy appended `?download=yes` to auto-download the receipt. */
	redirect: string
}

export type CancelTransactionDto = {
	cancelNote: string
}

// --- Riwayat Transaksi (legacy StudentTransactionController@index) ---------------------

export type StudentTransactionListQuery = ServerTableQuery & {
	/** `d/m/Y` as the datepicker submits it. */
	from?: string
	to?: string
}

export type StudentTransactionListRow = {
	id: number
	transactionCode: string | null
	paidAt: string | null
	paidAtTs: number | null
	amount: number
	itemCount: number
	description: string | null
	nis: string | null
	fullName: string | null
	grade: string | null
	subGrade: string | null
}

export type StudentTransactionDetail = {
	id: number
	transactionCode: string | null
	paidAt: string | null
	createdAt: string | null
	amount: number
	description: string | null
	note: string | null
	status: "valid" | "invalid"
	cancelNote: string | null
	student: InvoiceStudentCard
	items: {
		invoiceId: number
		name: string | null
		dueDate: string | null
		/** What this transaction paid toward that invoice. */
		pay: number
		/** The invoice amount snapshotted when the payment was recorded. */
		amount: number
	}[]
	totalAmount: number
	totalPaid: number
	balance: number
}

export type UpdateTransactionNoteDto = {
	note: string | null
	/** Only accepted when the transaction is already `invalid`. */
	cancelNote?: string | null
}
