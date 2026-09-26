import type { JSX } from "react"

import type { AcademicYearFormValues } from "./academic-year-form-values"
import AcademicYearSwitchRow from "./academic-year-switch-row"

type AcademicYearAkademikPaneProps = {
	locked: boolean
	values: AcademicYearFormValues
	onChange: (patch: Partial<AcademicYearFormValues>) => void
}

const AcademicYearAkademikPane = ({ locked, values, onChange }: AcademicYearAkademikPaneProps): JSX.Element => (
	<>
		<div className="mb-[24px]">
			<AcademicYearSwitchRow
				htmlFor="is_current"
				label={`Klik menjadi hijau maka status Akademik ${locked ? "menjadi" : "akan"} berjalan.`}
				checked={values.isCurrent}
				onChange={(isCurrent) => onChange({ isCurrent })}
			/>
		</div>
		<span className="mt-[5px] mb-[10px] block text-[12px] text-[#737373]">
			Ketika memberikan status <span className="font-bold">berjalan</span> pada tahun ajaran ini maka secara otomatis
			tahun ajaran yang lain (berlalu) statusnya berubah menjadi <span className="font-bold">berakhir</span>.
		</span>
	</>
)

export default AcademicYearAkademikPane
