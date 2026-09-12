import { create } from "zustand"

type EwalletState = {
	isPinAuthenticated: boolean
}

type EwalletActions = {
	setPinAuthenticated: (val: boolean) => void
	clearPin: () => void
}

export const useEwalletStore = create<EwalletState & EwalletActions>((set) => ({
	isPinAuthenticated: false,
	setPinAuthenticated: (val) => set({ isPinAuthenticated: val }),
	clearPin: () => set({ isPinAuthenticated: false }),
}))

export default useEwalletStore
