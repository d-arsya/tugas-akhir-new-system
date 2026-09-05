import type { JSX } from "react"
import { ChevronRight, User, ClipboardList, Users, UserCheck, Paperclip } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { psbApi } from "@/lib/api"

type WizardStepperProps = {
	mainStep?: number // 1: Email check, 2: Data wizard, 3: Success
	subStep?: number // 1: Personal, 2: Identity, 3: Family, 4: Guardian, 5: Attachment
	onStepClick?: (step: number) => void
	academicYearName?: string
	registrationTrack?: string
}

const subSteps = [
	{ id: 1, label: "Data Diri", icon: User },
	{ id: 2, label: "Identitas", icon: ClipboardList },
	{ id: 3, label: "Data Keluarga", icon: Users },
	{ id: 4, label: "Data Wali", icon: UserCheck },
	{ id: 5, label: "Lampiran", icon: Paperclip },
]

const WizardStepper = ({ mainStep = 1, subStep = 1, onStepClick, academicYearName, registrationTrack }: WizardStepperProps): JSX.Element => {
	const { data: landingData } = useQuery({
		queryKey: ["landingInfo"],
		queryFn: () => psbApi.getLanding(),
		staleTime: 1000 * 60 * 10,
	})

	const activeAcademicYear = academicYearName || landingData?.academicYear?.name || ""
	const activeTrack = registrationTrack || landingData?.academicYear?.type || "reguler"
	const titleYearText = activeAcademicYear ? `Tahun Ajaran ${activeAcademicYear}` : ""

	return (
		<div className="w-full flex flex-col items-center">
			{/* 3 Main Steps Stepper Header */}
			<div className="flex items-center justify-center gap-3 md:gap-4">
				{[1, 2, 3].map((step, idx) => {
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
							{idx < 2 && (
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

			{/* Centered title & track subtitle */}
			<div className="text-center mt-6">
				<div className="text-xs md:text-sm font-bold text-[var(--primary)] tracking-wide m-0">
					Formulir Pendaftaran Santri Baru {titleYearText}
				</div>
				<p className="text-xs text-[var(--grey)] italic m-0 mt-1">
					Jalur Pendaftaran : {activeTrack}
				</p>
			</div>

			{/* 5 Sub-Wizard Tab Bar (Visible when mainStep >= 2) */}
			{mainStep >= 2 && (
				<div className="w-full flex items-center justify-center gap-2 md:gap-6 mt-8 border-b border-slate-200 pb-4 overflow-x-auto">
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
										? "text-[var(--warning)] border-[var(--warning)] font-bold bg-amber-50/50"
										: "text-slate-400 border-transparent hover:text-slate-600 hover:bg-slate-50"
								}`}
							>
								<Icon className={`w-4 h-4 ${isActive ? "text-[var(--warning)]" : "text-slate-400"}`} />
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
