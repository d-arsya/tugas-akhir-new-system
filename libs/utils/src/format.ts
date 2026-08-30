import { format, formatDistanceToNow, parseISO } from "date-fns"
import { id } from "date-fns/locale"

export const formatRupiah = (amount: number): string => {
	return new Intl.NumberFormat("id-ID", {
		style: "currency",
		currency: "IDR",
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(amount)
}

export const formatDate = (date: string | Date, pattern = "dd MMMM yyyy"): string => {
	const parsed = typeof date === "string" ? parseISO(date) : date
	return format(parsed, pattern, { locale: id })
}

export const formatDateTime = (date: string | Date): string => {
	return formatDate(date, "dd MMM yyyy, HH:mm")
}

export const formatRelativeTime = (date: string | Date): string => {
	const parsed = typeof date === "string" ? parseISO(date) : date
	return formatDistanceToNow(parsed, { addSuffix: true, locale: id })
}
