import type { JSX } from "react"
import { useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import WizardStepper from "@/components/wizard-stepper"
import { InvalidPersonalStepContent } from "@/components/invalid-steps/invalid-personal-step"
import { InvalidIdentityStepContent } from "@/components/invalid-steps/invalid-identity-step"
import { InvalidFamilyStepContent } from "@/components/invalid-steps/invalid-family-step"
import { InvalidGuardianStepContent } from "@/components/invalid-steps/invalid-guardian-step"
import { InvalidAttachmentStepContent } from "@/components/invalid-steps/invalid-attachment-step"

// Single-page Tabbed Invalid Data Component for /invalid
const InvalidDataPage = (): JSX.Element => {
	const [subStep, setSubStep] = useState<number>(1)

	const nextStep = (): void => setSubStep((prev) => Math.min(prev + 1, 5))
	const prevStep = (): void => setSubStep((prev) => Math.max(prev - 1, 1))

	return (
		<div>
			<WizardStepper mainStep={2} subStep={subStep} onStepClick={(step) => setSubStep(step)} />
			<div className="tbr_wizard_content mt-8">
				{subStep === 1 && <InvalidPersonalStepContent onNext={nextStep} />}
				{subStep === 2 && <InvalidIdentityStepContent onNext={nextStep} onPrev={prevStep} />}
				{subStep === 3 && <InvalidFamilyStepContent onNext={nextStep} onPrev={prevStep} />}
				{subStep === 4 && <InvalidGuardianStepContent onNext={nextStep} onPrev={prevStep} />}
				{subStep === 5 && <InvalidAttachmentStepContent onPrev={prevStep} />}
			</div>
		</div>
	)
}

export const Route = createFileRoute("/_member/invalid")({
	component: InvalidDataPage,
})

export default InvalidDataPage
