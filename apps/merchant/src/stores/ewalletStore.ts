import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

type EwalletState = {
	isPinAuthenticated: boolean
}

type EwalletActions = {
	setPinAuthenticated: (val: boolean) => void
	clearPin: () => void
}

export const useEwalletStore = create<EwalletState & EwalletActions>()(
	persist(
		(set) => ({
			isPinAuthenticated: false,
			setPinAuthenticated: (val) => set({ isPinAuthenticated: val }),
			clearPin: () => set({ isPinAuthenticated: false }),
		}),
		{
			name: "roja-merchant-ewallet-pin",
			storage: createJSONStorage(() => sessionStorage),
		},
	),
)

export default useEwalletStore
