import type { AuthUser, Merchant, Ewallet, EwalletTransaction } from "@roja/types"

export const hijackAuthUser: AuthUser = {
	id: 301,
	email: "merchant@pondokroja.ac.id",
	name: "Pak Budi (Kantin Utama Roja)",
	role: "merchant",
	domain: "merchant",
}

export const mockMerchantProfile: Merchant = {
	id: 301,
	name: "Pak Budi",
	merchantName: "Kantin Utama Roja",
	uniqueNumber: "MRC-2026-001",
	email: "merchant@pondokroja.ac.id",
	emailVerifiedAt: "2026-01-10T08:00:00Z",
	phone: "081234567890",
	address: "Gedung Utama Lt 1, Pesantren Pondok Roja",
	photo: null,
	enabled2fa: true,
	isActive: true,
	createdAt: "2026-01-01T00:00:00Z",
	updatedAt: "2026-01-01T00:00:00Z",
}

export const mockEwallet: Ewallet = {
	id: 601,
	uniqueNumber: "EW-MRC-2026-001",
	totalSaldo: 4250000,
	isActive: true,
	ewalletableId: 301,
	ewalletableType: "Merchant",
	createdAt: "2026-01-01T00:00:00Z",
	updatedAt: "2026-01-01T00:00:00Z",
}

export const mockTransactions: EwalletTransaction[] = [
	{
		id: 101,
		ewalletId: 601,
		code: "PRC-20260912-8812",
		name: "Penjualan Paket Snack Santri",
		type: "purchase",
		amount: 45000,
		status: "valid",
		paymentMethod: "E-Wallet PIN",
		paymentAccount: null,
		transferNewsNumber: null,
		attachment: null,
		createdAt: "2026-09-12T09:30:00Z",
		updatedAt: "2026-09-12T09:30:00Z",
	},
	{
		id: 102,
		ewalletId: 601,
		code: "PRC-20260912-7431",
		name: "Penjualan Perlengkapan Tulis",
		type: "purchase",
		amount: 25000,
		status: "valid",
		paymentMethod: "E-Wallet PIN",
		paymentAccount: null,
		transferNewsNumber: null,
		attachment: null,
		createdAt: "2026-09-12T08:15:00Z",
		updatedAt: "2026-09-12T08:15:00Z",
	},
	{
		id: 103,
		ewalletId: 601,
		code: "TOPUP-MRC-001",
		name: "Top-Up Modal Merchant via Transfer Bank",
		type: "income",
		amount: 1000000,
		status: "valid",
		paymentMethod: "Bank Transfer",
		paymentAccount: "BSI 7192852646",
		transferNewsNumber: "TOPUP-MRC-001",
		attachment: "/assets/sample-receipt.png",
		createdAt: "2026-09-10T11:00:00Z",
		updatedAt: "2026-09-10T11:00:00Z",
	},
]
