import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

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
 * Persisted in sessionStorage so PIN authentication survives browser refresh (F5).
 */
export const useEwalletStore = create<EwalletState & EwalletActions>()(
	persist(
		(set) => ({
			isPinAuthenticated: false,
			hasEwallet: true,
			isActive: true,
			setPinAuthenticated: (val: boolean) => set({ isPinAuthenticated: val }),
			setHasEwallet: (val: boolean) => set({ hasEwallet: val }),
			setIsActive: (val: boolean) => set({ isActive: val }),
			clearPinSession: () => set({ isPinAuthenticated: false }),
		}),
		{
			name: "roja-santri-ewallet-pin",
			storage: createJSONStorage(() => sessionStorage),
		},
	),
)

export default useEwalletStore
