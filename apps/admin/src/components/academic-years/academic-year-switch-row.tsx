import type { JSX } from "react"

import LegacySwitch from "@/components/legacy/legacy-switch"

type AcademicYearSwitchRowProps = { label: string; checked: boolean; onChange: (value: boolean) => void; htmlFor: string }

const AcademicYearSwitchRow = ({ label, checked, onChange, htmlFor }: AcademicYearSwitchRowProps): JSX.Element => (
	<div className="mx-[-15px] mb-0 flex flex-wrap items-center">
		<div className="max-w-[66.666667%] flex-[0_0_66.666667%] px-[15px]">
			<label htmlFor={htmlFor} className="mb-0 block leading-[22.2px] italic">
				{label}
			</label>
		</div>
		<div className="max-w-[33.333333%] flex-[0_0_33.333333%] px-[15px]">
			<LegacySwitch checked={checked} onChange={onChange} name={htmlFor} size="lg" />
		</div>
	</div>
)

export default AcademicYearSwitchRow
