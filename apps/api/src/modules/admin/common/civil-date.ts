export type CivilDate = { year: number; month: number; day: number }

export const daysFromCivil = ({ year, month, day }: CivilDate): number => {
	const y = year - (month <= 2 ? 1 : 0)
	const era = Math.floor(y / 400)
	const yoe = y - era * 400
	const doy = Math.floor((153 * (month + (month > 2 ? -3 : 9)) + 2) / 5) + day - 1
	const doe = yoe * 365 + Math.floor(yoe / 4) - Math.floor(yoe / 100) + doy
	return era * 146097 + doe - 719468
}

export const civilFromDays = (days: number): CivilDate => {
	const z = days + 719468
	const era = Math.floor(z / 146097)
	const doe = z - era * 146097
	const yoe = Math.floor((doe - Math.floor(doe / 1460) + Math.floor(doe / 36524) - Math.floor(doe / 146096)) / 365)
	const y = yoe + era * 400
	const doy = doe - (365 * yoe + Math.floor(yoe / 4) - Math.floor(yoe / 100))
	const mp = Math.floor((5 * doy + 2) / 153)
	const day = doy - Math.floor((153 * mp + 2) / 5) + 1
	const month = mp + (mp < 10 ? 3 : -9)
	return { year: y + (month <= 2 ? 1 : 0), month, day }
}

const pad2 = (value: number): string => String(value).padStart(2, "0")

export const parseIsoDate = (value: string | null | undefined): CivilDate | null => {
	const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value ?? "")
	if (!match) return null
	return { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) }
}

export const parseDmyDate = (value: string | null | undefined): CivilDate | null => {
	const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value ?? "")
	if (!match) return null
	return { year: Number(match[3]), month: Number(match[2]), day: Number(match[1]) }
}

export const formatDmyDate = (date: CivilDate): string => `${pad2(date.day)}/${pad2(date.month)}/${date.year}`

export const formatIsoDate = (date: CivilDate): string =>
	`${String(date.year).padStart(4, "0")}-${pad2(date.month)}-${pad2(date.day)}`

export const addDays = (start: CivilDate, days: number): CivilDate => civilFromDays(daysFromCivil(start) + days)
