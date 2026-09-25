import { createZodDto } from "nestjs-zod"
import { z } from "zod"

// Legacy `TopUpRequest` and `ValidatePinRequest` (`app/Http/Requests/Ewallet`), messages verbatim.

export const AMOUNT_REQUIRED = "Kolom nominal wajib untuk diisi."
export const AMOUNT_MIN = "Minimal nominal transaksi adalah Rp1.000."

const MIN_AMOUNT = 1000

/**
 * Legacy: `amount => ['required', 'min:4']`, on the *masked text* (`"1.000"`), so `min:4` was a
 * character count — `"0000"` passed and so did `"1.0"`. The port takes a real number: whole
 * rupiah, at least 1.000. A missing or empty value is "wajib"; anything else short of that is "min".
 */
export const EwalletAmountSchema = z.object({
	amount: z
		.unknown()
		.superRefine((value, ctx) => {
			if (value === undefined || value === null || value === "") {
				ctx.addIssue({ code: "custom", message: AMOUNT_REQUIRED })
				return
			}
			const amount = typeof value === "number" ? value : typeof value === "string" ? Number(value) : Number.NaN
			if (!Number.isSafeInteger(amount) || amount < MIN_AMOUNT) ctx.addIssue({ code: "custom", message: AMOUNT_MIN })
		})
		.transform((value) => Number(value)),
})

export class EwalletAmountDto extends createZodDto(EwalletAmountSchema) {}

/**
 * Legacy: `pin => 'required|numeric|digits:6'`. Laravel skips `numeric` and `digits` on an empty
 * value, and reports both when a non-numeric value fails them, so `"12ab"` shows two lines.
 */
export const EwalletPinSchema = z.object({
	pin: z.unknown().superRefine((value, ctx) => {
		const text = typeof value === "number" ? String(value) : typeof value === "string" ? value : ""
		if (text === "") {
			ctx.addIssue({ code: "custom", message: "Kolom pin tidak boleh kosong." })
			return
		}
		if (!/^\d+(\.\d+)?$/.test(text)) ctx.addIssue({ code: "custom", message: "Kolom pin harus berupa angka." })
		if (!/^\d{6}$/.test(text)) ctx.addIssue({ code: "custom", message: "Kolom pin harus 6 digit." })
	}).transform((value) => String(value)),
})

export class EwalletPinDto extends createZodDto(EwalletPinSchema) {}

export class EwalletMoneyResultDto extends createZodDto(
	z.object({ message: z.string(), redirect: z.string().optional() }),
) {}
