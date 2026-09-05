import { create } from "zustand"

type EwalletState = {
	isPinAuthenticated: boolean
}

type EwalletActions = {
	setPinAuthenticated: (val: boolean) => void
	clearPinSession: () => void
}

/**
 * Ewallet Store — controls session PIN gate authentication state.
 * IMPORTANT: Explicitly NOT persisted — clears on page refresh to match Laravel session behavior.
 */
export const useEwalletStore = create<EwalletState & EwalletActions>((set) => ({
	isPinAuthenticated: false,
	setPinAuthenticated: (val: boolean) => set({ isPinAuthenticated: val }),
	clearPinSession: () => set({ isPinAuthenticated: false }),
}))

export default useEwalletStore
