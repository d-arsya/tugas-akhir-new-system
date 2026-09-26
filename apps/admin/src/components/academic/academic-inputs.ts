import type { LevelOption } from "@roja/types"

// NaN serialises to null, so a blank box fails `required` instead of posting 0.
export const numberOrBlank = (value: string): number => (value === "" ? Number.NaN : Number(value))

export const levelSelectOptions = (
	levels: LevelOption[] | undefined,
	placeholder: string,
): { value: string; label: string }[] => [
	{ value: "", label: placeholder },
	...(levels ?? []).map((level) => ({ value: String(level.id), label: level.name ?? "" })),
]
