import type { JSX } from "react"
import { ChevronRight } from "lucide-react"

type WizardStepperProps = {
	currentStep: number
}

const steps = [1, 2, 3, 4, 5]

const WizardStepper = ({ currentStep }: WizardStepperProps): JSX.Element => {
	return (
		<div className="w-full flex flex-col items-center">
			{/* Centered Circular Stepper */}
			<div className="flex items-center justify-center gap-3 md:gap-4">
				{steps.map((step, idx) => {
					const isActive = step === currentStep
					const isCompleted = step < currentStep
					return (
						<div key={step} className="flex items-center gap-3 md:gap-4">
							<div
								className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-xs transition-all duration-300 ${
									isActive || isCompleted
										? "bg-[var(--secondary)] text-white shadow-md shadow-[#8dc31e]/20"
										: "bg-[#F4F7F0] text-[var(--grey)]"
								}`}
								style={{ fontFamily: "Montserrat Semi Bold, sans-serif" }}
							>
								{step}
							</div>
							{idx < steps.length - 1 && (
								<ChevronRight
									className={`w-4 h-4 ${
										isCompleted ? "text-[var(--secondary)]" : "text-[#E2E8F0]"
									}`}
								/>
							)}
						</div>
					)
				})}
			</div>

			{/* Centered elegant title and subtitle (removed uppercase) */}
			<div className="text-center mt-6">
				<div 
					className="text-xs md:text-sm font-bold text-[var(--primary)] m-0 leading-snug tracking-wide"
					style={{ fontFamily: "Montserrat Bold, sans-serif" }}
				>
					Formulir Pendaftaran Santri Baru Tahun Ajaran 2027/2028
				</div>
				<p className="text-[10px] text-[var(--grey)] italic m-0 mt-0.5">
					Jalur Pendaftaran : reguler
				</p>
			</div>
		</div>
	)
}

export default WizardStepper
