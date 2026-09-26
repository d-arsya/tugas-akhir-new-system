import type { JSX } from "react"

import { cn } from "@roja/utils"

import LegacyInput from "@/components/legacy/legacy-input"
import LegacyRadioGroup from "@/components/legacy/legacy-radio-group"
import LegacyTextarea from "@/components/legacy/legacy-textarea"
import { digitsOnly } from "@/lib/digits-only"

import AcademicYearField from "./academic-year-field"
import type { AcademicYearFormValues } from "./academic-year-form-values"
import AcademicYearKbmInput from "./academic-year-kbm-input"
import AcademicYearSwitchRow from "./academic-year-switch-row"

type AcademicYearPsbPaneProps = {
	values: AcademicYearFormValues
	onChange: (patch: Partial<AcademicYearFormValues>) => void
}

const TYPE_OPTIONS = [
	{ value: "reguler", label: "Jalur Reguler", id: "reguler" },
	{ value: "indent", label: "Jalur Indent", id: "indent" },
]

const AcademicYearPsbPane = ({ values, onChange }: AcademicYearPsbPaneProps): JSX.Element => (
	<>
		<AcademicYearField label="Tanggal mulai aktif KBM" htmlFor="active_kbm" hint="required">
			<AcademicYearKbmInput value={values.activeKbm} onChange={(activeKbm) => onChange({ activeKbm })} />
		</AcademicYearField>

		<AcademicYearField
			label="Catatan"
			htmlFor="note"
			hint="optional"
			help="Dapat berupa informasi singkat seperti tanggal mulai dan akhir PSB"
		>
			<LegacyTextarea
				id="note"
				name="note"
				rows={3}
				noResize
				spellCheck={false}
				value={values.note}
				onChange={(event) => onChange({ note: event.target.value })}
			/>
		</AcademicYearField>

		<AcademicYearField
			label="Nomor Urut"
			htmlFor="serial_number"
			hint="required"
			help="Tentukan nomor urut mulai untuk para pendaftar misalnya 01, 001, 0001, dll."
		>
			<LegacyInput
				id="serial_number"
				name="serial_number"
				type="text"
				spellCheck={false}
				value={values.serialNumber}
				onKeyPress={digitsOnly}
				onChange={(event) => onChange({ serialNumber: event.target.value })}
			/>
		</AcademicYearField>

		<div className="mb-[24px]">
			<AcademicYearSwitchRow
				htmlFor="status"
				label="Klik menjadi hijau maka status PSB akan dibuka."
				checked={values.status}
				onChange={(status) => onChange({ status })}
			/>
			<div
				className={cn(
					"grid transition-[grid-template-rows] duration-[400ms]",
					values.status ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
				)}
			>
				<div className="overflow-hidden">
					<div className="mt-[14px] mb-[16px] rounded-[10px] bg-[var(--bg-quaternary)] text-left min-[576px]:text-center">
						<div className="p-[8px] [&>div]:block [&>div>div]:m-[8px]!">
							<LegacyRadioGroup
								name="type"
								value={values.type}
								options={TYPE_OPTIONS}
								onChange={(type) => onChange({ type: type as "reguler" | "indent" })}
								inline
								itemClassName="m-[8px]"
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	</>
)

export default AcademicYearPsbPane
