// Legacy `session()->flash('success', true)` after the wizard's final save: the edit page shows
// "Anda berhasil menambahkan pendaftar baru…" once. Kept in memory for the next page visit.

const created = new Set<number>()

export const flashRegistrantCreated = (registrantId: number): void => {
	created.add(registrantId)
}

/** Read once, like a flashed session value. */
export const takeRegistrantCreated = (registrantId: number): boolean => created.delete(registrantId)
