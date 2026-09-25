/**
 * `tbr_ewallets.pin` is a plaintext **integer**, shared with the santri and merchant portals
 * (they store `Number(newPin)` and compare it back the same way). An integer column drops
 * leading zeros, so a PIN typed as `012345` is stored as `12345`.
 *
 * Legacy compared with a loose `==` against the typed string, which papered over that. This
 * pads the stored value back to six digits and compares strings, so `012345` and `12345`
 * (which is what the column holds) both accept the same six-digit entry — and `123450` never
 * accepts `12345`. The PIN is never sent to the browser.
 *
 * Migrating the column to a hash is a follow-up that has to move all three apps together.
 */
export const PIN_LENGTH = 6

const padPin = (value: string | number): string => String(value).padStart(PIN_LENGTH, "0")

/** Whether a typed six-digit PIN matches the stored integer. A wallet with no PIN never matches. */
export const pinMatches = (stored: string | number | null | undefined, typed: string): boolean => {
	if (stored === null || stored === undefined) return false
	if (!/^\d{6}$/.test(typed)) return false
	return padPin(stored) === typed
}

/** What to store for a new PIN: an integer, as the portals expect. */
export const pinToStored = (typed: string): number => Number(typed)
