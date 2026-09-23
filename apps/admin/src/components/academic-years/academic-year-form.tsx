import { useState, type JSX, type KeyboardEvent } from "react"

import { cn } from "@roja/utils"

import LegacyButton from "@/components/legacy/legacy-button"
import LegacyCard, { LegacyCardTitle } from "@/components/legacy/legacy-card"
import LegacyDateRange from "@/components/legacy/legacy-date-range"
import LegacyInput, { legacyControlClass, legacyControlLockedClass } from "@/components/legacy/legacy-input"
import LegacyRadioGroup from "@/components/legacy/legacy-radio-group"
import LegacySwitch from "@/components/legacy/legacy-switch"
import LegacyTabs from "@/components/legacy/legacy-tabs"
import LegacyTextarea from "@/components/legacy/legacy-textarea"

import AcademicYearField from "./academic-year-field"
import AcademicYearKbmInput from "./academic-year-kbm-input"

export type AcademicYearFormValues = {
	startYear: string
	endYear: string
	costDateStart: string
	costDateEnd: string
	activeKbm: string
	note: string
	serialNumber: string
	status: boolean
	type: "reguler" | "indent"
	isCurrent: boolean
}

// `create.blade.php` defaults: both switches off and `#reguler` pre-checked
export const EMPTY_ACADEMIC_YEAR_FORM: AcademicYearFormValues = {
	startYear: "",
	endYear: "",
	costDateStart: "",
	costDateEnd: "",
	activeKbm: "",
	note: "",
	serialNumber: "",
	status: false,
	type: "reguler",
	isCurrent: false,
}

type AcademicYearFormProps = {
	mode: "create" | "edit"
	values: AcademicYearFormValues
	onChange: (patch: Partial<AcademicYearFormValues>) => void
	/** Bumped when an edit of the readonly end date has to be discarded, remounting the range */
	periodNonce: number
	onPeriodChange: (from: string) => void
	onSimpan: () => void
	submitting: boolean
}

const TYPE_OPTIONS = [
	{ value: "reguler", label: "Jalur Reguler", id: "reguler" },
	{ value: "indent", label: "Jalur Indent", id: "indent" },
]

/**
 * `.tbr_tab_content.academic_year` and `.tab-pane.academic_year` (app.css 1659-1682) re-skin the
 * shared tab styles: the active tab and the pane both sit on `--bg-form-disabled`, the pane loses
 * its radius and shadow, and the whole block bleeds through the card's 24px padding.
 */
const ACADEMIC_YEAR_TABS = cn(
	"[&>div:last-child]:mx-[-24px] [&>div:last-child]:mb-0",
	"[&>div:last-child>div]:rounded-none [&>div:last-child>div]:bg-[var(--bg-form-disabled)] [&>div:last-child>div]:shadow-none",
	"[&_a[aria-selected=true]]:bg-[var(--bg-form-disabled)]",
)

// `isNumberKey(event)` on the year and Nomor Urut inputs
const onlyDigits = (event: KeyboardEvent<HTMLInputElement>): void => {
	if (event.key.length === 1 && !/[0-9]/.test(event.key)) event.preventDefault()
}

const SwitchRow = ({ label, checked, onChange, htmlFor }: { label: string; checked: boolean; onChange: (value: boolean) => void; htmlFor: string }): JSX.Element => (
	// `.form-group.row.align-items-center.mb-0 > .col-8 + .col-4`
	<div className="mx-[-15px] mb-0 flex flex-wrap items-center">
		<div className="max-w-[66.666667%] flex-[0_0_66.666667%] px-[15px]">
			{/* `label.tbr_weight-italic.mb-0` — Porto renders form labels as blocks on the body's 1.85 line-height */}
			<label htmlFor={htmlFor} className="mb-0 block leading-[22.2px] italic">
				{label}
			</label>
		</div>
		<div className="max-w-[33.333333%] flex-[0_0_33.333333%] px-[15px]">
			{/* `.switch.switch-lg` — 75×45 with a white 41px handle, not the form-builder size */}
			<LegacySwitch checked={checked} onChange={onChange} name={htmlFor} size="lg" />
		</div>
	</div>
)

// Left card of `academic-year/create.blade.php` and `edit.blade.php` — the same markup, with the
// deltas the edit blade introduces (disabled year pair, one reworded label, prefilled values)
const AcademicYearForm = ({ mode, values, onChange, periodNonce, onPeriodChange, onSimpan, submitting }: AcademicYearFormProps): JSX.Element => {
	const [tab, setTab] = useState<"psb" | "akademik">("psb")
	const locked = mode === "edit"

	const psbPane = (
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
					onKeyPress={onlyDigits}
					onChange={(event) => onChange({ serialNumber: event.target.value })}
				/>
			</AcademicYearField>

			{/* `.tbr_switch_block.mb-4` */}
			<div className="mb-[24px]">
				<SwitchRow
					htmlFor="status"
					label="Klik menjadi hijau maka status PSB akan dibuka."
					checked={values.status}
					onChange={(status) => onChange({ status })}
				/>
				{/* `#academic-year-type` slides in and out with `hide-type-checkbox.js` */}
				<div
					className={cn(
						"grid transition-[grid-template-rows] duration-[400ms]",
						values.status ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
					)}
				>
					<div className="overflow-hidden">
						{/* `.tbr_radio_block.text-left.text-sm-center.form-group` (app.css 2467-2471) */}
						<div className="mt-[14px] mb-[16px] rounded-[10px] bg-[var(--bg-quaternary)] text-left min-[576px]:text-center">
							{/* `.custom-control-inline` is inline-flex, so `text-sm-center` is what centres the
							    pair; the kit's group is a flex row, which would ignore it */}
							<div className="p-[8px] [&>div]:block [&>div>div]:m-[8px]!">
								<LegacyRadioGroup
									name="type"
									value={values.type}
									options={TYPE_OPTIONS}
									onChange={(type) => onChange({ type: type as "reguler" | "indent" })}
									inline
									// `.custom-control-inline.m-2` — bootstrap's `.m-2` is `margin: .5rem !important`,
									// so it is 8px on all four sides, not the 16px right the kit defaults to
									itemClassName="m-[8px]"
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	)

	const akademikPane = (
		<>
			<div className="mb-[24px]">
				<SwitchRow
					htmlFor="is_current"
					// The edit blade says "menjadi berjalan" where create says "akan berjalan"
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
					{/* `.tbr_input_acy` (app.css 2857-2880): two 100px inputs around a 40px separator.
					    `justify-self: center` shrink-wraps and centres the block, which Chrome honours
					    for a block-level box in normal flow */}
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
							onKeyPress={onlyDigits}
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
							onKeyPress={onlyDigits}
							onChange={() => undefined}
							className={cn(legacyControlClass, legacyControlLockedClass, "mr-[10px] w-[100px] max-w-[100px]")}
						/>
					</div>
				</AcademicYearField>

				{/* `.tbr_date_range.mb-4` */}
				<div className="mb-[24px]">
					<label htmlFor="cost_date_start" className="m-0 flex leading-[20px] font-medium">
						Atur periode (dalam 1 tahun)
						<span className="m-0 mb-[4px] ml-[8px] p-0 text-[11px] leading-[20px] font-normal text-[var(--grey)] opacity-80">
							required
						</span>
					</label>
					{/* `#cost_date_end` is `readonly`: `.form-control[readonly]` greys it and nothing binds a
					    datepicker to it. The kit's range has no readOnly prop, so the second input is
					    locked here instead */}
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

				{/* `ul.nav.nav-tabs.tbr_tabs#myTab` — `#psb-tab` is `active` by default */}
				<LegacyTabs
					className={ACADEMIC_YEAR_TABS}
					active={tab}
					onChange={setTab}
					tabs={[
						{ key: "psb", label: <span className="font-bold">PSB</span>, content: psbPane },
						{ key: "akademik", label: <span className="font-bold">Akademik</span>, content: akademikPane },
					]}
				/>

				{/* `.text-right.mt-4` */}
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
