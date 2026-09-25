import type { EwalletPendingWithdraw } from "@roja/types"

import type { RedisService } from "@core/redis/redis.service"

// Seam 2 of the Dompet port. Legacy kept the withdraw amount in the PHP session (`withdraw_amount`)
// and the wrong-PIN counter in a 1-minute browser cookie (`validate-pin`), and `withdraw` trusted
// both. Here the amount is parked in Redis, keyed by (admin user, wallet), and the PIN strikes
// are counted on the server.

/** Long enough to read the PIN off the santri, short enough that a forgotten amount expires. */
const PENDING_TTL_SECONDS = 10 * 60
/** Legacy `Cookie::queue('validate-pin', …, 1)` — one minute, restarted on every wrong PIN. */
const STRIKE_WINDOW_SECONDS = 60
/** Legacy: the cookie is `0..3`; a wrong PIN with the cookie already at 3 locks the wallet. */
export const MAX_FREE_STRIKES = 3

const pendingKey = (adminId: number, walletId: number): string => `ewallet:withdraw:${adminId}:${walletId}`
const strikeKey = (adminId: number, walletId: number): string => `ewallet:pin-strikes:${adminId}:${walletId}`

export const parkWithdraw = async (redis: RedisService, adminId: number, walletId: number, amount: number): Promise<void> => {
	const value: EwalletPendingWithdraw = { amount, pinVerified: false }
	await redis.set(pendingKey(adminId, walletId), JSON.stringify(value), PENDING_TTL_SECONDS)
}

export const readPendingWithdraw = async (
	redis: RedisService,
	adminId: number,
	walletId: number,
): Promise<EwalletPendingWithdraw | null> => {
	const raw = await redis.get(pendingKey(adminId, walletId))
	if (!raw) return null
	try {
		const parsed = JSON.parse(raw) as Partial<EwalletPendingWithdraw>
		if (typeof parsed.amount !== "number" || !Number.isFinite(parsed.amount)) return null
		return { amount: parsed.amount, pinVerified: parsed.pinVerified === true }
	} catch {
		return null
	}
}

/** Flips `pinVerified`, keeping the time the record has left rather than granting a fresh ten minutes. */
export const markWithdrawPinVerified = async (
	redis: RedisService,
	adminId: number,
	walletId: number,
	pending: EwalletPendingWithdraw,
): Promise<void> => {
	const key = pendingKey(adminId, walletId)
	const left = await redis.ttlSeconds(key)
	if (left === 0) return
	await redis.set(key, JSON.stringify({ amount: pending.amount, pinVerified: true }), left)
}

/**
 * Removes the record and says whether *this* caller removed it. `withdraw` calls it before it
 * touches the balance, so a double-clicked "Konfirmasi" spends the parked amount once: the second
 * request finds nothing to claim.
 */
export const claimPendingWithdraw = async (redis: RedisService, adminId: number, walletId: number): Promise<boolean> => {
	return redis.delIfPresent(pendingKey(adminId, walletId))
}

export const clearPendingWithdraw = async (redis: RedisService, adminId: number, walletId: number): Promise<void> => {
	await redis.del(pendingKey(adminId, walletId))
}

/**
 * Counts one wrong PIN and answers how many the admin had before it (legacy's cookie value
 * *before* the increment, which is what its messages are built from). The window restarts on
 * every strike, as re-queueing the cookie did.
 */
export const registerPinStrike = async (redis: RedisService, adminId: number, walletId: number): Promise<number> => {
	const key = strikeKey(adminId, walletId)
	const count = await redis.incrWithWindow(key, STRIKE_WINDOW_SECONDS)
	await redis.expire(key, STRIKE_WINDOW_SECONDS)
	return count - 1
}

export const clearPinStrikes = async (redis: RedisService, adminId: number, walletId: number): Promise<void> => {
	await redis.del(strikeKey(adminId, walletId))
}

/** `ValidatePin` messages, keyed by how many wrong PINs came before this one. */
export const wrongPinMessage = (before: number): string =>
	3 - before === 1 ? "Pin tidak cocok! Coba kesempatan terakhir." : `Pin tidak cocok! Coba dalam ${3 - before} kali kesempatan.`

export const LOCKED_PIN_MESSAGE = "Terlalu banyak percobaan. Silahkan coba lagi nanti."
