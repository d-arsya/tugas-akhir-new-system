import type { JSX } from "react"
import { User, ClipboardList, Users, UserCheck, Paperclip } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { psbApi } from "@/lib/api"
import { WizardStepper as BaseWizardStepper, type WizardSubStep } from "@roja/ui"

export interface WizardStepperProps {
	mainStep?: number
	subStep?: number
	onStepClick?: (step: number) => void
	academicYearName?: string
	registrationTrack?: string
}

const subSteps: WizardSubStep[] = [
	{ id: 1, label: "Data Diri", icon: User },
	{ id: 2, label: "Identitas", icon: ClipboardList },
	{ id: 3, label: "Data Keluarga", icon: Users },
	{ id: 4, label: "Data Wali", icon: UserCheck },
	{ id: 5, label: "Lampiran", icon: Paperclip },
]

export const WizardStepper = ({
	mainStep = 1,
	subStep = 1,
	onStepClick,
	academicYearName,
	registrationTrack,
}: WizardStepperProps): JSX.Element => {
	const { data: landingData } = useQuery({
		queryKey: ["landingInfo"],
		queryFn: () => psbApi.getLanding(),
		staleTime: 1000 * 60 * 10,
	})

	const activeAcademicYear = academicYearName || landingData?.academicYear?.name || ""
	const activeTrack = registrationTrack || landingData?.academicYear?.type || "reguler"
	const titleYearText = activeAcademicYear ? `Tahun Ajaran ${activeAcademicYear}` : ""

	return (
		<BaseWizardStepper
			mainStep={mainStep}
			totalMainSteps={3}
			subStep={subStep}
			subSteps={subSteps}
			onStepClick={onStepClick}
			title={`Formulir Pendaftaran Santri Baru ${titleYearText}`}
			subtitle={`Jalur Pendaftaran : ${activeTrack}`}
		/>
	)
}

export default WizardStepper
