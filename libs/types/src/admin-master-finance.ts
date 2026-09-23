// Contract for the admin "Data Master" menu, phase 2: Keuangan (Akun, Biaya Santri)
// and Merchant. Ported 1:1 from the legacy Laravel admin.
//
// Same three rules as phase 1: the baked-in `$no` counter is dropped, server-rendered
// `<span class='tbr_label…'>` becomes an enum, and a hidden numeric sort span becomes a
// `*Sort` field beside its display string.

// --- Akun (legacy AccountancyController) ------------------------------------------------

export type AccountancyGroup = "income" | "expense"

/** Where a row's destroy icon points — legacy picks this per row from the child count. */
export type AccountancyDeleteTarget = "delete" | "delegate-child"

export type AccountancyRow = {
	id: number
	name: string | null
	/**
	 * Depth-first pre-order depth, root = 0. Legacy indents with a `Child.svg` dash:
	 * level 1 gets the icon plus a 15px gap, level n>1 pushes it `35 + 40 * (n - 2)` px.
	 */
	level: number
	group: AccountancyGroup | null
	/** "Pemasukan" | "Pengeluaran" | "" — `AccountancyService::getGroup`. */
	groupLabel: string
	deleteTarget: AccountancyDeleteTarget
	hasChildren: boolean
}

export type AccountancyDetail = {
	id: number
	name: string | null
	isParent: boolean
	parentId: number | null
	group: AccountancyGroup | null
	isStudentCost: boolean
	note: string | null
}

export type AccountancyOption = {
	id: number
	name: string | null
}

export type AccountancyPayload = {
	name: string
	isParent: boolean
	/** Legacy sends "" for a root account, which persists and makes the row invisible. Null here. */
	parentId: number | null
	group: AccountancyGroup | null
	isStudentCost: boolean
	note?: string | null
}

export type AccountancyDeleteStep = {
	id: number
	name: string | null
	step: AccountancyDeleteTarget
	/** Candidate new parents: other roots when deleting a root, otherwise non-roots minus this subtree. */
	parents: AccountancyOption[]
	redirect: string | null
}

export type AccountancyDelegatePayload = {
	parentId: number
}

// --- Biaya Santri (legacy StudentCostTermController) -------------------------------------

/** Level 1: pick an academic year. */
export type StudentCostYearRow = {
	id: number
	year: string | null
	/** `getCostPeriodAttribute()` — "01 Jul 2025 - 30 Jun 2026". */
	period: string
	statusAkademik: "berjalan" | "berakhir" | "empty" | "none"
}

/** Level 2: pick a grade within that year. */
export type StudentCostGradeRow = {
	gradeId: number
	label: number | null
	/** "Kelas 7". */
	name: string
	appliedCount: number
	totalItems: number
	/** `appliedCostItem()` — "3 dari 9 item biaya". */
	appliedText: string
}

/** Level 3: the accountancy rows for one year + grade. */
export type StudentCostAccountRow = {
	accountancyId: number
	name: string | null
	/** "-" when the accountancy has no note. */
	note: string
	/** null => no saved term: legacy renders no checkbox and the pencil links to create. */
	termId: number | null
	applied: boolean
	type: "maximum" | "option" | null
	/** "Rp 1.500.000" plus the hidden numeric sort key legacy embeds for the `any-number` sort. */
	maximumCost: string | null
	maximumSort: number | null
	/** Rendered comma-separated across lines; legacy puts a trailing comma on all but the last. */
	optionCosts: string[]
	optionSort: number | null
	/** "Sekali" (sort 1) | "Bulanan" (sort 2) | "-". */
	periodLabel: string
	periodSort: number | null
	/** "7 Hari" | "-". */
	reminderLabel: string
	reminderSort: number | null
	/** "Bulan ke 3, Tanggal 10" | "15 Agustus 2025" | "-". */
	dueDate: string
}

export type StudentCostAccountPage = {
	academicYear: { id: number; year: string | null; costPeriod: string; costDateStart: string | null }
	grade: { id: number; label: number | null }
	/** `isAccountancyAppliedAll()` — drives the header check-all box's initial state. */
	allApplied: boolean
	rows: StudentCostAccountRow[]
}

/**
 * Level 4: the create/edit form's payload, already decoded out of the stored representation.
 *
 * Storage is lossy in both period branches, so the codec is the risky part of this menu:
 *   once    — stores `time_span = |days(onceBill, costDateStart)|`, reads back `costDateStart + time_span`
 *   monthly — stores `time_span = monthBill * 30`, reads back `time_span / 30`
 */
export type StudentCostTermDetail = {
	accountancy: { id: number; name: string | null }
	academicYear: { id: number; year: string | null; costDateStart: string | null }
	grade: { id: number; label: number | null }
	/** null on the create page. */
	term: {
		id: number
		type: "maximum" | "option"
		period: "once" | "monthly"
		/** dd/mm/yyyy, already resolved from `costDateStart + timeSpan`. */
		onceBill: string | null
		reminder: number | null
		monthBill: number | null
		monthOf: number | null
		dayOf: number | null
		/** Masked ("1.500.000"), in saved order. */
		amounts: string[]
	} | null
	/** An approved StudentCapability exists, so legacy renders the Periode radios `tbr_disabled`. */
	periodLocked: boolean
}

export type StudentCostTermPayload = {
	type: "maximum" | "option"
	period: "once" | "monthly"
	/** Masked, as the autoNumeric input holds it; sent only when `type` is "maximum". */
	amount?: string
	/** Sent only when `type` is "option"; legacy caps the list at 20. */
	amounts?: string[]
	/** dd/mm/yyyy; sent only when `period` is "once". */
	onceBill?: string
	reminderOnce?: number
	monthBill?: number
	monthOfMonth?: number
	dayOfMonth?: number
	reminderMonthly?: number
}

export type StudentCostAppliedPayload = {
	/** Legacy could not clear the selection at all — an empty array answered a swallowed 500. */
	ids: number[]
}

// --- Merchant (legacy MerchantController) ------------------------------------------------

export type MerchantRow = {
	id: number
	uniqueNumber: string
	name: string | null
	merchantName: string | null
	email: string | null
	/** `translatedFormat('d F Y')` — "23 September 2026". Note: no time, unlike the Akademik lists. */
	createdAt: string
	createdAtTs: number
	/** Rendered as the "Active" / "Nonactive" label. */
	isBlocked: boolean
}

export type MerchantDetail = {
	id: number
	uniqueNumber: string
	name: string | null
	gender: "male" | "female" | null
	email: string | null
	merchantName: string | null
	address: string | null
	phone: string | null
	/** Served from the merchant app's storage; null falls back to `ic_no-photo.svg`. Read-only. */
	photoUrl: string | null
	isBlocked: boolean
}

export type MerchantPayload = {
	name: string
	gender: "male" | "female"
	email: string
	merchantName: string
	address: string
	phone: string
	isBlocked: boolean
}
