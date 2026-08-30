export const parseRupiah = (formatted: string): number => {
	return Number(formatted.replace(/[^0-9]/g, ""))
}

export const clampNumber = (value: number, min: number, max: number): number => {
	return Math.min(Math.max(value, min), max)
}

export const debounce = <T extends (...args: unknown[]) => void>(
	fn: T,
	delayMs: number,
): ((...args: Parameters<T>) => void) => {
	let timer: ReturnType<typeof setTimeout>
	return (...args: Parameters<T>) => {
		clearTimeout(timer)
		timer = setTimeout(() => fn(...args), delayMs)
	}
}
