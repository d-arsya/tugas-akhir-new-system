import { create } from "zustand"
import { persist } from "zustand/middleware"

type WizardState = {
	sessionId: string | null
	email: string | null
	levelId: number | null
}

type WizardActions = {
	setSession: (sessionId: string, email: string, levelId: number) => void
	clearSession: () => void
}

const useWizardStore = create<WizardState & WizardActions>()(
	persist(
		(set) => ({
			sessionId: null,
			email: null,
			levelId: null,

			setSession: (sessionId, email, levelId) => set({ sessionId, email, levelId }),
			clearSession: () => set({ sessionId: null, email: null, levelId: null }),
		}),
		{
			name: "psb-wizard-storage",
		},
	),
)

export default useWizardStore
