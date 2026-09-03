import { create } from "zustand"
import { persist } from "zustand/middleware"

type WizardState = {
	sessionId: string | null
	email: string | null
	levelId: number | null
	subStep: number
}

type WizardActions = {
	setSession: (sessionId: string, email: string, levelId: number) => void
	setSubStep: (subStep: number) => void
	clearSession: () => void
}

const useWizardStore = create<WizardState & WizardActions>()(
	persist(
		(set) => ({
			sessionId: null,
			email: null,
			levelId: null,
			subStep: 1,

			setSession: (sessionId, email, levelId) => set({ sessionId, email, levelId, subStep: 1 }),
			setSubStep: (subStep) => set({ subStep }),
			clearSession: () => set({ sessionId: null, email: null, levelId: null, subStep: 1 }),
		}),
		{
			name: "psb-wizard-storage",
		},
	),
)

export default useWizardStore
