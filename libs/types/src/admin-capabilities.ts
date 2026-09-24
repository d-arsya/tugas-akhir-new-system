// Contract for the admin "Pembayaran Santri" menu, phase 2: Kesanggupan.
// Ported 1:1 from the legacy Laravel admin (StudentCapabilityController, 23 routes).
//
// Unlike phase 1, **none** of these lists is server-side. Legacy uses no yajra here at
// all — all seven list endpoints hand-build `['data' => [[col0, col1, …]]]` arrays of
// PHP-rendered HTML and return the whole set, and the browser pages it. The same
// conventions still apply to each cell:
//   * the baked-in `$no` counter is dropped — the table indexes rows itself;
//   * `<span class='tbr_label…'>` becomes an enum, rendered by <LegacyLabel>;
//   * a hidden `<span class="d-none">{unix}</span>` sort key becomes a `*Ts` field.
//
// One cell needs saying twice: legacy's santri list embeds a hidden
// `<span class='d-none'>Sudah|Belum memiliki kesanggupan</span>`, and BOTH the filter
// dropdown and the red-row highlight work by string-matching it. That becomes
// `hasCapability`, never a rendered string.

import type { InvoiceStudentCard } from "./admin-payments"

// --- Shared vocabulary ----------------------------------------------------------------

/** `tbr_student_capabilities.status`. Free text in the database; these are the only live values. */
export type CapabilityStatus = "approve" | "disapprove" | "changed"

/** `StudentCapabilityService::getStatus` — the three `tbr_label` badges. */
export type CapabilityStatusLabel = "Disepakati" | "Belum disepakati" | "Dirubah"

/** `StudentCostTerm::getTranslatePeriodAttribute` — `once` reads "Sekali", anything else "Bulanan". */
export type CapabilityPeriodLabel = "Sekali" | "Bulanan"

// --- Level 1: academic years (legacy @academicYearList) --------------------------------

export type CapabilityAcademicYearRow = {
	id: number
	year: string | null
	/** `AcademicYear::getCostPeriodAttribute` — "01 Jul 2024 - 30 Jun 2025". */
	costPeriod: string
	/**
	 * `AcademicYearService::getStatusAkademik`. "-" is not a placeholder for missing data:
	 * legacy returns it literally for academic year id 1, the `year='Archive'` sentinel.
	 * `null` is the genuine no-badge case (a future year that has not started).
	 */
	statusLabel: "Berjalan" | "Berakhir" | "-" | null
}

// --- Level 2: grades within a year (legacy @gradeList) ---------------------------------

export type CapabilityGradeRow = {
	id: number
	label: number | null
	/** "Kelas 3". */
	name: string
	/** `Grade::masterCostStatus` — are there applied cost terms for this grade and year. */
	masterCostDefined: boolean
	/**
	 * `Grade::getTotalStudentGrade`, which counts `grade_status='active'`. Level 3
	 * deliberately does NOT filter on that, so this number and the row count there
	 * legitimately disagree. Replicated, not fixed.
	 */
	studentCount: number
	/** `Grade::getNoteCapability` returns the hardcoded string "Dalam pengerjaan". */
	note: string
	/**
	 * False when no cost term is applied. Legacy's action then opens the
	 * "Master biaya belum ditentukan!" modal instead of drilling in.
	 */
	canDrillDown: boolean
}

// --- Level 3: santri within a grade (legacy @capabilityList) ---------------------------

export type CapabilityStudentRow = {
	/** Every downstream route keys on `student_grades.id`, never `students.id`. */
	studentGradeId: number
	nis: string | null
	fullName: string | null
	/** `father_fullname` when set, else `mother_fullname`. */
	parentOrGuardian: string | null
	subGrade: string | null
	capabilityCount: number
	/** Replaces the hidden "Sudah|Belum memiliki kesanggupan" span; drives the filter and the red row. */
	hasCapability: boolean
}

/** POST @storeToSession. Legacy stores the tick list in one global session key. */
export type CapabilitySelectionDto = {
	studentGradeIds: number[]
	/**
	 * Legacy derives this from the filter dropdown, not from the data: "update" when the
	 * filter reads "Sudah memiliki kesanggupan", otherwise "create". The server re-checks
	 * it — `create` rejects any santri who already has a capability.
	 */
	action: "create" | "update"
}

export type CapabilitySelectionResult = { redirect: string }

// --- Level 4: one santri's capability history (legacy @studentCapability*) -------------

/**
 * Which banner the page shows. Legacy renders **nothing** when the newest capability is
 * `changed`; that gap is reproduced as `null` rather than invented into a fourth state.
 */
export type CapabilityAlertState = "no-capability" | "unagreed" | "agreed" | null

export type CapabilityStudentPage = {
	student: InvoiceStudentCard
	alert: CapabilityAlertState
	/** Resolved server-side for the breadcrumb and the back button. */
	academicYearId: number
	gradeId: number
}

export type CapabilityHistoryRow = {
	id: number
	/** 1-based position in `oldest()` order — legacy's `#1`, `#2` badge. */
	ordinal: number
	/** Null renders the literal "Belum disepakati" in legacy's date column. */
	approveDate: string | null
	approveDateTs: number | null
	/** Leaf billable accountancies on this capability (`parent_id IS NOT NULL AND is_student_cost`). */
	itemCount: number
	status: CapabilityStatus | null
	statusLabel: CapabilityStatusLabel | null
	note: string | null
}

// --- Level 5: the line items of one capability (legacy @studentCapabilityItem*) ---------

/**
 * One row of the kesanggupan table, and everything its edit modal needs.
 *
 * `type='maximum'` renders a slider from 0 to `maxAmount`; `type='option'` renders a
 * radio list built from `options`. The two legacy modals disagree on `step` — mass-create
 * uses `min(masterAmount, 5000)` while the other two hardcode 5000 — so it travels per row.
 */
export type CapabilityItemRow = {
	/** `tbr_student_cost_terms.id`. Legacy keys the edit modal on the row index; this is stabler. */
	costTermId: number
	accountancyId: number
	name: string | null
	type: "maximum" | "option"
	period: "once" | "monthly"
	periodLabel: CapabilityPeriodLabel
	/**
	 * The agreed amount when the capability already carries this account, else the master
	 * cost. Null means "no single master amount" — a `type='option'` term with more than
	 * one price, which legacy renders as an empty cell and which blocks saving.
	 *
	 * Zero is a legal agreed amount (64 live rows), not missing data.
	 */
	amount: number | null
	/** Upper bound of the slider; `tbr_student_costs.amount` of the term's first option. */
	maxAmount: number | null
	/** The selectable prices for `type='option'`; empty for `maximum`. */
	options: number[]
	step: number
	/** Whether the checkbox starts ticked — the santri already agreed to this account. */
	selected: boolean
}

export type CapabilityItemPage = {
	student: InvoiceStudentCard
	capability: {
		id: number
		ordinal: number
		status: CapabilityStatus | null
		statusLabel: CapabilityStatusLabel | null
		note: string | null
		approveDate: string | null
	}
	/**
	 * `status === 'disapprove'`. Legacy only renders checkboxes, the Save button and the
	 * "Telah Disepakati" button while the capability is still unagreed; an agreed or
	 * superseded one is a read-only snapshot.
	 */
	editable: boolean
	academicYearId: number
	gradeId: number
}

// --- Writes ----------------------------------------------------------------------------

/**
 * One agreed line. Legacy posts three parallel arrays — `amount[]` for sliders,
 * `amount[{index}]` for radios, plus `account_id[]` and `position[]` — and then realigns
 * them with `array_search`, which silently writes the wrong santri's amount when the
 * ticked rows are not a contiguous prefix. Pairing the two values removes the class of bug.
 */
export type CapabilityItemInput = {
	accountancyId: number
	/** Masked as the input holds it ("1.500.000"); "0" is valid. */
	amount: string
}

/** POST @store and PATCH @update — one santri. */
export type CapabilityWriteDto = {
	note?: string
	items: CapabilityItemInput[]
}

/**
 * POST @massStore and @massUpdate.
 *
 * Legacy switches the form's action on selection size: one santri posts to `store()` and
 * gets an unagreed capability with no invoices, two or more post here and are approved
 * **and** published in the same request. That flip is reproduced deliberately.
 */
export type CapabilityMassWriteDto = {
	studentGradeIds: number[]
	note?: string
	items: CapabilityItemInput[]
	/**
	 * Mass-edit only. The accountancy ids the shared form actually displayed; anything the
	 * santri already had that is *not* in this list is replicated onto the new capability
	 * rather than dropped. Legacy takes this straight off the request unvalidated.
	 */
	shownAccountancyIds?: number[]
}

export type CapabilityMassPage = {
	academicYear: { id: number; year: string | null }
	grade: { id: number; label: number | null }
	/** The santri carried in from the selection, in the order legacy lists them. */
	students: { studentGradeId: number; nis: string | null; fullName: string | null }[]
	/**
	 * Mass-edit only. True when the selected santri do not all hold the same set of
	 * accounts, which makes legacy show only the intersection plus the accounts none of
	 * them have, behind the "Terdeteksi item yang berbeda…" banner.
	 */
	specialCondition: boolean
}

// --- Publish ---------------------------------------------------------------------------

/**
 * POST @publishInvoice — generates the santri's invoices.
 *
 * `invoicesCreated` and `warning` have no legacy counterpart. Legacy discards this
 * method's return value entirely and swallows its own exceptions, so a publish that wrote
 * **zero** invoices still reports success; grade 7 has no cost terms at all and does
 * exactly that for its 33 active santri. Reporting the count makes the silent no-op visible.
 */
export type CapabilityPublishResult = {
	message: string
	invoicesCreated: number
	warning?: string
	redirect?: string
}

export type CapabilityMassResult = {
	message: string
	redirect: string
	studentsProcessed: number
	invoicesCreated: number
	warning?: string
}
