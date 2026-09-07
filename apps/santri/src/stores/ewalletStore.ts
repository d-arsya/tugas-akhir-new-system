import { create } from "zustand"

type EwalletState = {
	isPinAuthenticated: boolean
	hasEwallet: boolean
	isActive: boolean
}

type EwalletActions = {
	setPinAuthenticated: (val: boolean) => void
	setHasEwallet: (val: boolean) => void
	setIsActive: (val: boolean) => void
	clearPinSession: () => void
}

/**
 * Ewallet Store — controls session PIN gate authentication, activation status, and wallet creation status.
 * IMPORTANT: Explicitly NOT persisted — clears on page refresh to match Laravel session behavior.
 */
export const useEwalletStore = create<EwalletState & EwalletActions>((set) => ({
	isPinAuthenticated: false,
	hasEwallet: true,
	isActive: true,
	setPinAuthenticated: (val: boolean) => set({ isPinAuthenticated: val }),
	setHasEwallet: (val: boolean) => set({ hasEwallet: val }),
	setIsActive: (val: boolean) => set({ isActive: val }),
	clearPinSession: () => set({ isPinAuthenticated: false }),
}))

export default useEwalletStore
