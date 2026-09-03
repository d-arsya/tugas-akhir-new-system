import type { JSX } from "react"
import { ChevronRight, User, ClipboardList, Users, UserCheck, Paperclip } from "lucide-react"

type WizardStepperProps = {
	mainStep?: number // 1: Email check, 2: Data wizard, 3: Success
	subStep?: number // 1: Personal, 2: Identity, 3: Family, 4: Guardian, 5: Attachment
	onStepClick?: (step: number) => void
}

const subSteps = [
	{ id: 1, label: "Data Diri", icon: User },
	{ id: 2, label: "Identitas", icon: ClipboardList },
	{ id: 3, label: "Data Keluarga", icon: Users },
	{ id: 4, label: "Data Wali", icon: UserCheck },
	{ id: 5, label: "Lampiran", icon: Paperclip },
]

const WizardStepper = ({ mainStep = 1, subStep = 1, onStepClick }: WizardStepperProps): JSX.Element => {
	return (
		<div className="w-full flex flex-col items-center">
			{/* 3 Main Steps Stepper Header */}
			<div className="flex items-center justify-center gap-3 md:gap-4">
				{[1, 2, 3].map((step, idx) => {
					const isActiveOrCompleted = step <= mainStep
					return (
						<div key={step} className="flex items-center gap-3 md:gap-4">
							<div
								className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-xs transition-all duration-300 ${
									isActiveOrCompleted
										? "bg-[#8dc31e] text-white shadow-md shadow-[#8dc31e]/20"
										: "bg-[#F4F7F0] text-[var(--grey)]"
								}`}
								style={{ fontFamily: "Montserrat Semi Bold, sans-serif" }}
							>
								{step}
							</div>
							{idx < 2 && (
								<ChevronRight
									className={`w-4 h-4 ${
										isActiveOrCompleted ? "text-[#8dc31e]" : "text-[#E2E8F0]"
									}`}
								/>
							)}
						</div>
					)
				})}
			</div>

			{/* Centered title & track subtitle */}
			<div className="text-center mt-6">
				<h2 
					className="text-sm md:text-base font-bold text-[#e91e63] m-0 leading-snug tracking-wide"
					style={{ fontFamily: "Montserrat Bold, sans-serif" }}
				>
					Formulir Pendaftaran Santri Baru Tahun Ajaran 2027/2028
				</h2>
				<p className="text-xs text-[var(--grey)] italic m-0 mt-1">
					Jalur Pendaftaran : reguler
				</p>
			</div>

			{/* 5 Sub-Wizard Tab Bar (Visible when mainStep >= 2) */}
			{mainStep >= 2 && (
				<div className="w-full flex items-center justify-center gap-4 md:gap-8 mt-8 border-b border-[#F0F0F0] pb-4 overflow-x-auto">
					{subSteps.map((tab) => {
						const Icon = tab.icon
						const isActive = tab.id === subStep
						return (
							<button
								key={tab.id}
								type="button"
								onClick={() => onStepClick?.(tab.id)}
								className={`flex items-center gap-2 text-xs md:text-sm font-medium transition-colors py-1 px-2 border-b-2 -mb-[17px] cursor-pointer select-none bg-transparent ${
									isActive
										? "text-[#ffa800] border-[#ffa800] font-semibold"
										: "text-[#abb4be] border-transparent hover:text-slate-600"
								}`}
							>
								<Icon className={`w-4 h-4 ${isActive ? "text-[#ffa800]" : "text-[#abb4be]"}`} />
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
