import { useState, type JSX } from "react"

import { cn } from "@roja/utils"

import LegacyButton from "@/components/legacy/legacy-button"
import LegacyCard, { LegacyCardTitle } from "@/components/legacy/legacy-card"
import LegacyDateRange from "@/components/legacy/legacy-date-range"
import { legacyControlClass, legacyControlLockedClass } from "@/components/legacy/legacy-input"
import LegacyTabs from "@/components/legacy/legacy-tabs"
import { digitsOnly } from "@/lib/digits-only"

import AcademicYearAkademikPane from "./academic-year-akademik-pane"
import AcademicYearField from "./academic-year-field"
import type { AcademicYearFormValues } from "./academic-year-form-values"
import AcademicYearPsbPane from "./academic-year-psb-pane"

type AcademicYearFormProps = {
	mode: "create" | "edit"
	values: AcademicYearFormValues
	onChange: (patch: Partial<AcademicYearFormValues>) => void
	periodNonce: number
	onPeriodChange: (from: string) => void
	onSimpan: () => void
	submitting: boolean
}

const ACADEMIC_YEAR_TABS = cn(
	"[&>div:last-child]:mx-[-24px] [&>div:last-child]:mb-0",
	"[&>div:last-child>div]:rounded-none [&>div:last-child>div]:bg-[var(--bg-form-disabled)] [&>div:last-child>div]:shadow-none",
	"[&_a[aria-selected=true]]:bg-[var(--bg-form-disabled)]",
)

const AcademicYearForm = ({ mode, values, onChange, periodNonce, onPeriodChange, onSimpan, submitting }: AcademicYearFormProps): JSX.Element => {
	const [tab, setTab] = useState<"psb" | "akademik">("psb")
	const locked = mode === "edit"
	const psbPane = <AcademicYearPsbPane values={values} onChange={onChange} />
	const akademikPane = <AcademicYearAkademikPane locked={locked} values={values} onChange={onChange} />

	return (
		<LegacyCard className="mb-[16px] min-[992px]:mb-0">
			<LegacyCardTitle className="mb-[16px]!">Data tahun ajaran</LegacyCardTitle>

			<form
				id="main-form"
				noValidate
				onSubmit={(event) => {
					event.preventDefault()
					onSimpan()
				}}
			>
				<AcademicYearField
					label="Tahun Ajaran"
					htmlFor="start_year"
					hint="required"
					help="Tahun ajaran harus urut dari tahun ajaran terkecil ke tahun ajaran terbesar."
				>
					<div className="flex items-center justify-self-center">
						<input
							type="number"
							min={1}
							max={9999}
							id="start_year"
							name="start_year"
							placeholder={locked ? "Tahun mulai" : "0000"}
							disabled={locked}
							value={values.startYear}
							onKeyPress={digitsOnly}
							onChange={(event) => onChange({ startYear: event.target.value })}
							className={cn(legacyControlClass, locked && legacyControlLockedClass, "mr-[10px] w-[100px] max-w-[100px]")}
						/>
						<div className="mr-[10px] flex h-[40px] w-[40px] items-center justify-center rounded-[6px] border-2 border-[var(--bg-form-border)]! bg-[var(--bg-form-disabled)] text-[var(--grey)]">
							/
						</div>
						<input
							type="number"
							min={1}
							max={9999}
							id="end_year"
							name="end_year"
							placeholder={locked ? "Tahun selesai" : "0000"}
							disabled={locked}
							readOnly={!locked}
							value={values.endYear}
							onKeyPress={digitsOnly}
							onChange={() => undefined}
							className={cn(legacyControlClass, legacyControlLockedClass, "mr-[10px] w-[100px] max-w-[100px]")}
						/>
					</div>
				</AcademicYearField>

				<div className="mb-[24px]">
					<label htmlFor="cost_date_start" className="m-0 flex leading-[20px] font-medium">
						Atur periode (dalam 1 tahun)
						<span className="m-0 mb-[4px] ml-[8px] p-0 text-[11px] leading-[20px] font-normal text-[var(--grey)] opacity-80">
							required
						</span>
					</label>
					<div className="[&_input:last-of-type]:pointer-events-none [&_input:last-of-type]:bg-[var(--bg-form-disabled)]! [&_input:last-of-type]:text-[var(--grey)]!">
						<LegacyDateRange
							key={periodNonce}
							from={values.costDateStart}
							to={values.costDateEnd}
							onChange={(from) => onPeriodChange(from)}
							middleLabel="Sampai"
						/>
					</div>
				</div>

				<LegacyTabs
					className={ACADEMIC_YEAR_TABS}
					active={tab}
					onChange={setTab}
					tabs={[
						{ key: "psb", label: <span className="font-bold">PSB</span>, content: psbPane },
						{ key: "akademik", label: <span className="font-bold">Akademik</span>, content: akademikPane },
					]}
				/>

				<div className="mt-[24px] text-right">
					<LegacyButton type="submit" variant="primary" loading={submitting}>
						Simpan
					</LegacyButton>
				</div>
			</form>
		</LegacyCard>
	)
}

export default AcademicYearForm
