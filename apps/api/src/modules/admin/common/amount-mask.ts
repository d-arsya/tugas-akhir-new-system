export const unmaskAmount = (masked: string): number => {
	const leading = /^\s*-?\d+/.exec(masked.replace(/\./g, ""))
	return leading ? Number.parseInt(leading[0], 10) : 0
}

export const maskAmount = (amount: number): string => {
	if (!amount) return "0"
	return String(amount).replace(/\B(?=(\d{3})+(?!\d))/g, ".")
}
