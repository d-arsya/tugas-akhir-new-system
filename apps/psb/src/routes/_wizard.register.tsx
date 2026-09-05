import type { JSX } from "react"
import useWizardStore from "@/stores/wizard.store"
import WizardStepper from "@/components/wizard-stepper"
import { createFileRoute, redirect } from "@tanstack/react-router"
import PersonalStepContent from "@/components/wizard-steps/personal-step"
import IdentityStepContent from "@/components/wizard-steps/identity-step"
import FamilyStepContent from "@/components/wizard-steps/family-step"
import GuardianStepContent from "@/components/wizard-steps/guardian-step"
import AttachmentStepContent from "@/components/wizard-steps/attachment-step"

const RegisterDataPage = (): JSX.Element => {
	const subStep = useWizardStore((s) => s.subStep)
	const setSubStep = useWizardStore((s) => s.setSubStep)

	const nextStep = (): void => setSubStep(Math.min(subStep + 1, 5))
	const prevStep = (): void => setSubStep(Math.max(subStep - 1, 1))

	return (
		<div>
			<WizardStepper mainStep={2} subStep={subStep} onStepClick={(step) => setSubStep(step)} />
			<div className="tbr_wizard_content mt-8">
				{subStep === 1 && <PersonalStepContent onNext={nextStep} />}
				{subStep === 2 && <IdentityStepContent onNext={nextStep} onPrev={prevStep} />}
				{subStep === 3 && <FamilyStepContent onNext={nextStep} onPrev={prevStep} />}
				{subStep === 4 && <GuardianStepContent onNext={nextStep} onPrev={prevStep} />}
				{subStep === 5 && <AttachmentStepContent onPrev={prevStep} />}
			</div>
		</div>
	)
}

export const Route = createFileRoute("/_wizard/register")({
	beforeLoad: () => {
		const wizard = useWizardStore.getState()
		if (!wizard.sessionId) {
			throw redirect({ to: "/" })
		}
	},
	component: RegisterDataPage,
})

export default RegisterDataPage
