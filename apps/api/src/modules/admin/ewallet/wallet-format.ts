import type { EwalletOwnerType } from "@roja/types"

import { MONTHS_ID } from "@admin/common/date-format"
import { EWALLET_MERCHANT_TYPE, EWALLET_STUDENT_TYPE } from "@shared/ewallet/balance"

// Formatting for Akun Dompet (legacy `formatDate()`, `rupiah()` and the model accessors). Owned by WS D-A.

/** Legacy `formatDate($date, 'd F Y, H:i')` → "23 September 2026, 14:05", from a Jakarta-local stamp. */
export const indoDateTime = (local: string | null): string => {
	if (!local) return ""
	const month = MONTHS_ID[Number(local.slice(5, 7)) - 1] ?? ""
	return `${local.slice(8, 10)} ${month} ${local.slice(0, 4)}, ${local.slice(11, 16)}`
}

/** `Ewallet::ewalletable_type` → the contract's owner kind; anything else is not a Dompet owner. */
export const ownerKind = (type: string | null): EwalletOwnerType | null => {
	if (type === EWALLET_STUDENT_TYPE) return "santri"
	if (type === EWALLET_MERCHANT_TYPE) return "merchant"
	return null
}

/** `Ewallet::getEwalletUserTypeAttribute`, as the export prints it. */
export const ownerLabel = (type: string | null): string => {
	const kind = ownerKind(type)
	return kind === "merchant" ? "Merchant" : kind === "santri" ? "Santri" : "Tidak ditemukan"
}

/** Absolute URLs pass through, `storage/` prefixes are stripped (`storage_url()`, `Helper.php:999`). */
export const storageKey = (path: string): string => path.replace(/^\/?storage\//, "").replace(/^\/+/, "")
