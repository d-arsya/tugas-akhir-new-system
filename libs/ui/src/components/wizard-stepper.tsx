import type { JSX, ComponentType } from "react"
import { ChevronRight } from "lucide-react"

export interface WizardSubStep {
	id: number
	label: string
	icon?: ComponentType<{ className?: string }>
}

export interface WizardStepperProps {
	mainStep?: number
	totalMainSteps?: number
	subStep?: number
	subSteps?: WizardSubStep[]
	onStepClick?: (step: number) => void
	title?: string
	subtitle?: string
	className?: string
}

export const WizardStepper = ({
	mainStep = 1,
	totalMainSteps = 3,
	subStep = 1,
	subSteps = [],
	onStepClick,
	title,
	subtitle,
	className = "",
}: WizardStepperProps): JSX.Element => {
	const stepNumbers = Array.from({ length: totalMainSteps }, (_, i) => i + 1)

	return (
		<div className={`w-full flex flex-col items-center ${className}`}>
			{/* Main Steps Stepper Header */}
			<div className="flex items-center justify-center gap-3 md:gap-4">
				{stepNumbers.map((step, idx) => {
					const isActiveOrCompleted = step <= mainStep
					return (
						<div key={step} className="flex items-center gap-3 md:gap-4">
							<div
								className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${
									isActiveOrCompleted
										? "bg-[var(--secondary)] text-white shadow-md shadow-[var(--secondary)]/20"
										: "bg-slate-100 text-slate-400"
								}`}
							>
								{step}
							</div>
							{idx < totalMainSteps - 1 && (
								<ChevronRight
									className={`w-4 h-4 ${
										isActiveOrCompleted ? "text-[var(--secondary)]" : "text-slate-300"
									}`}
								/>
							)}
						</div>
					)
				})}
			</div>

			{/* Centered title & subtitle */}
			{(title || subtitle) && (
				<div className="text-center mt-6">
					{title && (
						<div className="text-xs md:text-sm font-bold text-[var(--primary)] tracking-wide m-0">
							{title}
						</div>
					)}
					{subtitle && (
						<p className="text-xs text-[var(--grey)] italic m-0 mt-1">
							{subtitle}
						</p>
					)}
				</div>
			)}

			{/* Sub-Wizard Tab Bar (Visible when mainStep >= 2 and subSteps present) */}
			{mainStep >= 2 && subSteps.length > 0 && (
				<div className="w-full flex items-center justify-center gap-2 md:gap-6 mt-8 border-b border-slate-200 dark:border-slate-800 pb-4 overflow-x-auto">
					{subSteps.map((tab) => {
						const Icon = tab.icon
						const isActive = tab.id === subStep
						return (
							<button
								key={tab.id}
								type="button"
								onClick={() => onStepClick?.(tab.id)}
								className={`flex items-center gap-2 text-xs md:text-sm font-medium transition-colors py-1.5 px-3 rounded-lg border-b-2 -mb-[17px] cursor-pointer select-none bg-transparent ${
									isActive
										? "text-[var(--warning)] border-[var(--warning)] font-bold bg-amber-50/50 dark:bg-amber-950/20"
										: "text-slate-400 border-transparent hover:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800"
								}`}
							>
								{Icon && (
									<Icon className={`w-4 h-4 ${isActive ? "text-[var(--warning)]" : "text-slate-400"}`} />
								)}
								<span>{tab.label}</span>
							</button>
						)
					})}
				</div>
			)}
		</div>
	)
}

export default WizardStepper
