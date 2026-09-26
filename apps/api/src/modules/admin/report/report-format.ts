import { MONTHS_ID } from "@admin/common/date-format"

// Local timestamp string from SQL (`yyyy-mm-ddThh:mm:ss` or `yyyy-mm-dd`) → parts
const parts = (local: string): { y: string; m: number; d: string; time: string } => ({
	y: local.slice(0, 4),
	m: Number(local.slice(5, 7)),
	d: local.slice(8, 10),
	time: local.slice(11, 16),
})

// Carbon translatedFormat('d F Y') / ('d F Y, H:i') in the `id` locale
export const formatIndoDate = (local: string | null, withTime = false): string | null => {
	if (!local) return null
	const p = parts(local)
	const date = `${p.d} ${MONTHS_ID[p.m - 1] ?? ""} ${p.y}`
	return withTime ? `${date}, ${p.time}` : date
}

// formatDate($date, 'd/m/Y')
export const formatDmy = (local: string | null): string => {
	if (!local) return ""
	const p = parts(local)
	return `${p.d}/${String(p.m).padStart(2, "0")}/${p.y}`
}
