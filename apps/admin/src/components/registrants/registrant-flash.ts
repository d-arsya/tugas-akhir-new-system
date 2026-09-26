const created = new Set<number>()

export const flashRegistrantCreated = (registrantId: number): void => {
	created.add(registrantId)
}

export const takeRegistrantCreated = (registrantId: number): boolean => created.delete(registrantId)
