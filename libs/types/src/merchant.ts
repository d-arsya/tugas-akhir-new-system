export type Merchant = {
	id: number
	name: string
	merchantName: string | null
	uniqueNumber: string
	email: string
	emailVerifiedAt: string | null
	phone: string | null
	address: string | null
	photo: string | null
	enabled2fa: boolean
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
