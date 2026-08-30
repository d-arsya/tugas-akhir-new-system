export type Merchant = {
	id: number
	name: string
	email: string
	emailVerifiedAt: string | null
	phone: string | null
	isActive: boolean
	createdAt: string
	updatedAt: string
}

export type TransactionItem = {
	id: number
	ewalletTransactionId: number
	description: string
	price: number
}

export type TransactionDetail = {
	id: number
	ewalletTransactionId: number
	ewalletId: number
	createdAt: string
}
