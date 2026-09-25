import { MONTHS_ID, MONTHS_SHORT_ID, indoDate, indoDateShort } from "@admin/academic/academic-format"
import { parseDmy } from "@admin/payments/transaction-sql"

// Formatting shared by the transaction detail, Riwayat and its export. `local` is the
// Jakarta-local `YYYY-MM-DDTHH:MM:SS` string that `LOCAL_TIMESTAMP` produces.

/** `translatedFormat('d F Y, H:i')` — the Riwayat list, its detail and the export's date column. */
export const dateTimeLong = (local: string | null): string => {
	if (!local) return ""
	const month = MONTHS_ID[Number(local.slice(5, 7)) - 1] ?? ""
	return `${local.slice(8, 10)} ${month} ${local.slice(0, 4)}, ${local.slice(11, 16)}`
}

/** `formatFromTo(…, 'd M Y \j\a\m H:i')` — the transaction detail's dates (short month, "jam"). */
export const dateTimeJam = (local: string | null): string | null => {
	if (!local) return null
	const month = MONTHS_SHORT_ID[Number(local.slice(5, 7)) - 1] ?? ""
	return `${local.slice(8, 10)} ${month} ${local.slice(0, 4)} jam ${local.slice(11, 16)}`
}

/** `EwalletTransaction::getTransactionStatusAttribute`. */
export const statusText = (status: string | null): string => {
	switch (status) {
		case "waiting":
			return "Menunggu"
		case "valid":
			return "Berhasil"
		case "invalid":
			return "Gagal"
		case "process":
			return "Diproses"
		default:
			return ""
	}
}

/** `export()`'s `$typeSuffix` (the file name and header line). */
export const typeSuffix = (type: string | undefined): string => {
	switch (type) {
		case undefined:
			return "Semua Jenis Transaksi"
		case "income":
			return "Isi Saldo"
		case "expense":
			return "Tarik Saldo"
		case "purchase":
			return "Jual Beli"
		default:
			return "Tidak diketahui"
	}
}

/** `export()`'s `$statusSuffix`. */
export const statusSuffix = (status: string | undefined): string => {
	if (status === undefined) return "Semua Status"
	return statusText(status) || "Tidak diketahui"
}

/**
 * `export()`'s `$dateSuffix`: one day is `d F Y` (legacy wrote `d f Y`, which printed a literal
 * "f"), a range is `d M Y s.d d M Y`, nothing is "Semua Tanggal". A half-filled range filters
 * nothing (see `historyWhere`), so it reads "Semua Tanggal" too.
 */
export const dateSuffix = (raw: string | undefined): string => {
	if (!raw) return "Semua Tanggal"
	const parts = raw.split(" - ")
	if (parts.length === 1) {
		const day = parseDmy(parts[0]?.trim())
		return day ? indoDate(day) : "Semua Tanggal"
	}
	const from = parseDmy(parts[0]?.trim())
	const to = parseDmy(parts[1]?.trim())
	return from && to ? `${indoDateShort(from)} s.d ${indoDateShort(to)}` : "Semua Tanggal"
}

/** `rupiah()` — `Rp 1.500.000`. */
export const rupiah = (amount: number): string => `Rp ${String(Math.trunc(amount)).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`
