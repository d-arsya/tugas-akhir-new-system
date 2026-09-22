// Formatting ports of the legacy helpers (PHP `rupiah()` / `formatDate()`, report JS `rupiah()`)

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

const withDots = (value: number): string => String(Math.trunc(value)).replace(/\B(?=(\d{3})+(?!\d))/g, ".")

// assets/js/report/*-datatable.js `rupiah()`: thousands dots, no prefix (widget totals)
export const rupiahDots = (value: number): string => (value < 0 ? `-${withDots(-value)}` : withDots(value))

// PHP `rupiah()`: "Rp " + number_format($n, 0, ',', '.')
export const rupiahLabel = (value: number): string => `Rp ${rupiahDots(value)}`

// Carbon translatedFormat('d F Y') / ('d F Y, H:i') for local `yyyy-mm-dd[Thh:mm:ss]` strings
export const formatIndoDate = (local: string | null, withTime = false): string => {
	if (!local) return ""
	const date = `${local.slice(8, 10)} ${MONTHS_ID[Number(local.slice(5, 7)) - 1] ?? ""} ${local.slice(0, 4)}`
	return withTime ? `${date}, ${local.slice(11, 16)}` : date
}

// Luxon DateTime.now().toFormat("dd/LL/yyyy") — the legacy datepicker value format
export const todayDmy = (): string => {
	const now = new Date()
	return `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()}`
}
