// Formatting helpers mirroring the legacy PHP helpers (`formatFromTo`, `formatDate`, `rupiah`)

// Legacy app timezone (config/app.php) — timestamps are compared and printed in this zone
export const REPORT_TIMEZONE = "Asia/Jakarta"

const MONTHS_ID = [
	"Januari",
	"Februari",
	"Maret",
	"April",
	"Mei",
	"Juni",
	"Juli",
	"Agustus",
	"September",
	"Oktober",
	"November",
	"Desember",
]

// `dd/mm/yyyy` → `yyyy-mm-dd`. Out-of-range parts roll over like Carbon (31/02 → 03/03)
export const parseDmy = (value: string | undefined): string | undefined => {
	const match = value ? /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value) : null
	if (!match) return undefined
	const date = new Date(Date.UTC(Number(match[3]), Number(match[2]) - 1, Number(match[1])))
	return date.toISOString().slice(0, 10)
}

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
