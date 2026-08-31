import type { JSX } from "react"
import { createFileRoute, redirect, Outlet, useLocation } from "@tanstack/react-router"
import useWizardStore from "@/stores/wizard.store"
import WizardStepper from "@/components/wizard-stepper"
import Header from "@/components/header"

export const Route = createFileRoute("/_wizard")({
	beforeLoad: () => {
		// Temporary disabled for visual inspection
		/*
		const wizard = useWizardStore.getState()
		if (!wizard.sessionId) {
			throw redirect({ to: "/" })
		}
		*/
	},
	component: (): JSX.Element => {
		const location = useLocation()
		const getStepNumber = (): number => {
			const path = location.pathname
			if (path.includes("/register/personal")) return 1
			if (path.includes("/register/identity")) return 2
			if (path.includes("/register/family")) return 3
			if (path.includes("/register/guardian")) return 4
			if (path.includes("/register/attachment")) return 5
			return 1
		}

		return (
			<div className="roja_wizard_container min-h-screen flex flex-col relative overflow-hidden bg-[var(--bg-primary)] pt-[70px]">
				<Header />
				
				{/* Background decorative blob shapes */}
				<div className="roja_bg_blobs" />

				<main className="flex-1 relative z-10 px-4 py-8 w-full max-w-5xl mx-auto flex items-center justify-center">
					<div className="roja_card_wizard w-full relative overflow-hidden p-8 md:p-12">
						{/* Corner gradient glows inside card */}
						<div className="absolute -top-12 -left-12 w-48 h-48 bg-[var(--primary)] rounded-full blur-[50px] opacity-[0.12] pointer-events-none z-0" />
						<div className="absolute -top-12 -right-12 w-48 h-48 bg-[var(--secondary)] rounded-full blur-[50px] opacity-[0.12] pointer-events-none z-0" />

						<div className="relative z-10">
							<WizardStepper currentStep={getStepNumber()} />
							<div className="tbr_wizard_content mt-8">
								<Outlet />
							</div>
						</div>
					</div>
				</main>
			</div>
		)
	},
})
