import type { EntityManager } from "typeorm"

import type { EwalletOwnerType } from "@roja/types"

import { EWALLET_MERCHANT_TYPE, EWALLET_STUDENT_TYPE } from "@shared/ewallet/balance"
import { SettingSchool } from "@shared/school/entities/setting-school.entity"
import { User } from "@admin/auth/entities/user.entity"
import { EwalletTransaction } from "@ewallet/entities/ewallet-transaction.entity"

// Raw SQL for the Dompet money routes. `ewalletable_id` is a varchar, so the owner is joined
// with `id::text = ewalletable_id`; the santri's name is the active grade's fullname, else the
// wallet's snapshot (`Ewallet::ewallet_user_name`).

export type MoneyWallet = {
	id: number
	uniqueId: string | null
	isActive: boolean
	ownerType: EwalletOwnerType | null
	/** False when the wallet's owner row is gone; legacy 500'd on it, the port answers 422. */
	hasOwner: boolean
	ownerName: string | null
	ownerEmail: string | null
	studentStatus: string | null
	/** Plaintext integer column as a string. Never leaves the service. */
	pin: string | null
	ownerId: string | null
}

type WalletRow = {
	id: string
	unique_id: string | null
	is_active: boolean | null
	ewalletable_type: string | null
	ewalletable_id: string | null
	pin: string | null
	student_name: string | null
	s_id: string | null
	s_email: string | null
	s_status: string | null
	s_fullname: string | null
	m_id: string | null
	m_name: string | null
	m_email: string | null
}

const WALLET_SQL = `
SELECT e.id, e.unique_id, e.is_active, e.ewalletable_type, e.ewalletable_id, e.pin, e.student_name,
	s.id AS s_id, s.email AS s_email, s.student_status AS s_status,
	(SELECT g.fullname FROM tbr_student_grades g
		WHERE g.student_id = s.id AND g.grade_status = 'active' ORDER BY g.id DESC LIMIT 1) AS s_fullname,
	m.id AS m_id, m.name AS m_name, m.email AS m_email
FROM tbr_ewallets e
LEFT JOIN tbr_students s ON e.ewalletable_type = $2 AND s.id::text = e.ewalletable_id
LEFT JOIN tbr_merchants m ON e.ewalletable_type = $3 AND m.id::text = e.ewalletable_id
WHERE e.id = $1
`

/** The wallet plus the bits of its owner the money routes need, or `null` for an unknown id. */
export const loadMoneyWallet = async (manager: EntityManager, walletId: number): Promise<MoneyWallet | null> => {
	const rows = (await manager.query(WALLET_SQL, [walletId, EWALLET_STUDENT_TYPE, EWALLET_MERCHANT_TYPE])) as WalletRow[]
	const row = rows[0]
	if (!row) return null

	const isStudent = row.ewalletable_type === EWALLET_STUDENT_TYPE
	const isMerchant = row.ewalletable_type === EWALLET_MERCHANT_TYPE
	return {
		id: Number(row.id),
		uniqueId: row.unique_id,
		isActive: row.is_active === true,
		ownerType: isStudent ? "santri" : isMerchant ? "merchant" : null,
		hasOwner: isStudent ? row.s_id !== null : isMerchant ? row.m_id !== null : false,
		ownerName: isStudent ? (row.s_fullname ?? row.student_name) : isMerchant ? row.m_name : null,
		ownerEmail: isStudent ? row.s_email : isMerchant ? row.m_email : null,
		studentStatus: row.s_status,
		pin: row.pin,
		ownerId: row.ewalletable_id,
	}
}

export type CashTransactionInput = {
	walletId: number
	code: string
	name: "Isi saldo" | "Tarik saldo"
	amount: number
	type: "income" | "expense"
	officerName: string
}

export type InsertedTransaction = { id: number; createdAt: Date }

/** Legacy `topUp` / `withdraw` row: valid, Cash/Cash, on behalf of the officer, no transfer news number. */
export const insertCashTransaction = async (manager: EntityManager, input: CashTransactionInput): Promise<InsertedTransaction> => {
	const saved = await manager.save(
		manager.create(EwalletTransaction, {
			ewalletId: String(input.walletId),
			code: input.code,
			name: input.name,
			amount: String(input.amount),
			status: "valid",
			type: input.type,
			paymentMethod: "Cash",
			paymentAccount: "Cash",
			paymentOnBehalfOf: input.officerName,
			transferNewsNumber: null,
		}),
	)
	return { id: Number(saved.id), createdAt: saved.createdAt }
}

export type Officer = { name: string; email: string | null }

/** The signed-in admin (`request()->user()`): `payment_on_behalf_of` and the cashier's copy of the email. */
export const loadOfficer = async (manager: EntityManager, userId: number): Promise<Officer | null> => {
	const row = await manager.findOne(User, { select: { name: true, email: true }, where: { id: userId } })
	if (!row) return null
	return { name: row.name ?? "", email: row.email }
}

/** `SettingSchool::first()` — the school name in the email subject and footer. */
export const loadSchoolName = async (manager: EntityManager): Promise<string | null> => {
	const [school] = await manager.find(SettingSchool, { select: { name: true }, order: { id: "ASC" }, take: 1 })
	return school?.name ?? null
}
