export const maskRupiah = (raw: string): string => {
	const digits = raw.replace(/\D/g, "").replace(/^0+(?=\d)/, "")
	if (digits === "") return ""
	return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
}

export const unmaskRupiah = (masked: string): number => {
	const withoutDots = masked.replace(/\./g, "")
	const leading = /^\s*-?\d+/.exec(withoutDots)
	return leading ? Number.parseInt(leading[0], 10) : 0
}

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
