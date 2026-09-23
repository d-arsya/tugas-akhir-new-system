// Port of the autoNumeric options legacy applies to every `.number-separator` input
// (`assets/js/student-cost/general.js`):
//   allowDecimalPadding: false, minimumValue: 0, decimalCharacter: ",",
//   digitGroupSeparator: ".", defaultValueOverride: "", modifyValueOnWheel: false
//
// Only the integer part matters in practice: the server parses with PHP's
// `intval(str_replace(".", "", $amount))`, which strips the thousands dots and then truncates
// at the first non-digit — so a decimal comma is discarded. `unmaskRupiah` reproduces exactly
// that, rather than `Number()`, which would return NaN for "1.500.000,50" and silently zero a fee.

/** Groups the integer part with dots: 1500000 → "1.500.000". */
export const maskRupiah = (raw: string): string => {
	const digits = raw.replace(/\D/g, "").replace(/^0+(?=\d)/, "")
	if (digits === "") return ""
	return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
}

/** "1.500.000" → 1500000. Mirrors `intval(str_replace(".", "", $amount))`. */
export const unmaskRupiah = (masked: string): number => {
	const withoutDots = masked.replace(/\./g, "")
	const leading = /^\s*-?\d+/.exec(withoutDots)
	return leading ? Number.parseInt(leading[0], 10) : 0
}

/**
 * Re-masks a value while keeping the caret where the user expects it.
 *
 * Returns the masked string and the caret offset to restore, measured by counting the digits
 * before the caret — the only stable anchor when separators are being inserted and removed.
 */
export const maskWithCaret = (raw: string, caret: number): { value: string; caret: number } => {
	const digitsBefore = raw.slice(0, caret).replace(/\D/g, "").length
	const value = maskRupiah(raw)
	if (digitsBefore === 0) return { value, caret: 0 }

	let seen = 0
	for (let i = 0; i < value.length; i += 1) {
		if (/\d/.test(value[i] ?? "")) {
			seen += 1
			if (seen === digitsBefore) return { value, caret: i + 1 }
		}
	}
	return { value, caret: value.length }
}
