export type Student = {
	id: number
	nis: string
	fullName: string
	email: string
	emailVerifiedAt: string | null
	gender: "male" | "female"
	isActive: boolean
	gradeId: number | null
	createdAt: string
	updatedAt: string
}

export type EwalletStatus = "waiting" | "process" | "valid" | "invalid"

export type EwalletTransactionType = "income" | "outcome" | "purchase" | "withdraw"

export type Ewallet = {
	id: number
	uniqueNumber: string
	totalSaldo: number
	isActive: boolean
	ewalletableId: number
	ewalletableType: string
	createdAt: string
	updatedAt: string
}

export type EwalletTransaction = {
	id: number
	ewalletId: number
	code: string
	name: string
	type: EwalletTransactionType
	amount: number
	status: EwalletStatus
	paymentMethod: string | null
	paymentAccount: string | null
	transferNewsNumber: string | null
	attachment: string | null
	createdAt: string
	updatedAt: string
}

export type StudentInvoice = {
	id: number
	studentId: number
	name: string
	amount: number
	amountPaid: number
	status: "paid" | "partial" | "unpaid" | "installment"
	dueDate: string | null
	createdAt: string
	updatedAt: string
}

export type StudentTransaction = {
	id: number
	studentInvoiceId: number
	amount: number
	method: string | null
	note: string | null
	createdAt: string
}
