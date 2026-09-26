import { DP_MONTHS } from "./legacy-date"

const withDots = (value: number): string => String(Math.trunc(value)).replace(/\B(?=(\d{3})+(?!\d))/g, ".")

export const rupiahDots = (value: number): string => (value < 0 ? `-${withDots(-value)}` : withDots(value))

export const rupiahLabel = (value: number): string => `Rp ${rupiahDots(value)}`

export const formatIndoDate = (local: string | null, withTime = false): string => {
	if (!local) return ""
	const date = `${local.slice(8, 10)} ${DP_MONTHS[Number(local.slice(5, 7)) - 1] ?? ""} ${local.slice(0, 4)}`
	return withTime ? `${date}, ${local.slice(11, 16)}` : date
}

export const todayDmy = (): string => {
	const now = new Date()
	return `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()}`
}
