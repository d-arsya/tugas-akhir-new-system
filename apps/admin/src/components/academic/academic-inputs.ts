import type { LevelOption } from "@roja/types"

/**
 * An empty control posts an empty string, which Laravel's `required` rejects. `Number("")` is
 * 0 — a value the rule would happily accept — so an empty box becomes NaN instead: axios
 * serialises NaN as JSON `null`, and the DTO answers the same "wajib" message legacy does.
 * A `0` the user actually typed still goes through, exactly as legacy allows.
 */
export const numberOrBlank = (value: string): number => (value === "" ? Number.NaN : Number(value))

/** `<option value="" title="Select" selected>…</option>` followed by every level. */
export const levelSelectOptions = (
	levels: LevelOption[] | undefined,
	placeholder: string,
): { value: string; label: string }[] => [
	{ value: "", label: placeholder },
	...(levels ?? []).map((level) => ({ value: String(level.id), label: level.name ?? "" })),
]

/**
 * `onkeypress="return isNumberKey(event)"` (`input-number-strict.js`): only the digits 0-9
 * reach the box, so `type="number"` cannot be fed "-", "." or "e" either.
 */
export const blockNonDigits = (event: {
	key: string
	ctrlKey: boolean
	metaKey: boolean
	preventDefault: () => void
}): void => {
	if (event.key.length !== 1 || event.ctrlKey || event.metaKey) return
	if (!/[0-9]/.test(event.key)) event.preventDefault()
}
