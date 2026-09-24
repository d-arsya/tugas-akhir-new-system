import type { JSX } from "react"

import { cn } from "@roja/utils"

import LegacyButton from "@/components/legacy/legacy-button"
import LegacySelect from "@/components/legacy/legacy-select"
import type { TableState } from "@/lib/legacy-table"

import { HelpButton } from "./capability-chrome"
import { CAPABILITY_FILTER_OPTIONS, type CapabilityFilter } from "./capability-student-filters"

const LENGTH_OPTIONS = ["10", "25", "50", "100"].map((value) => ({ value, label: value }))

// The DataTables search input's own skin, reused for the external `#search_filter` box
const SEARCH_CLASS =
	"h-[40px] w-full rounded-[6px] border-2 border-[var(--bg-form-border)]! bg-[var(--bg-form)] px-[16px] py-[6px] text-[12px] leading-[22.2px] text-[var(--body-txt-inverse)] outline-none placeholder:text-[var(--grey)] focus:border-[var(--secondary)]!"

type CapabilityStudentToolbarProps = {
	filter: CapabilityFilter
	onFilterChange: (filter: CapabilityFilter) => void
	subGrade: string
	subGradeOptions: { value: string; label: string }[]
	onSubGradeChange: (subGrade: string) => void
	state: TableState
	onStateChange: (state: TableState) => void
	canSubmit: boolean
	submitting: boolean
	onSubmit: () => void
	onHelp: () => void
}

/**
 * `capability.blade.php:14-78` — the two control rows above the santri table. Legacy hides
 * DataTables' own length and search (`sDom: '<"d-none"lf>'`) and drives them from `#show_entry`
 * and `#search_filter` here instead (`capability-filter.js:1-17`).
 */
const CapabilityStudentToolbar = ({
	filter,
	onFilterChange,
	subGrade,
	subGradeOptions,
	onSubGradeChange,
	state,
	onStateChange,
	canSubmit,
	submitting,
	onSubmit,
	onHelp,
}: CapabilityStudentToolbarProps): JSX.Element => (
	<>
		{/* `.row.justify-content-between.mb-2` */}
		<div className="mx-[-15px] mb-[8px] flex flex-wrap justify-between">
			<div className="w-full px-[15px] min-[992px]:w-1/3">
				<div className="mb-[24px] flex min-[992px]:mb-0">
					<HelpButton onClick={onHelp} />
					{/*
					 * `a#tbr_btn_create_capability.btn.tbr_btn.tbr_btn-danger.btn-block.ml-3.tbr_w_228px`
					 * — `.tbr_disabled` (opacity .5, no pointer events) until something is ticked
					 */}
					<LegacyButton
						variant="danger"
						loading={submitting}
						onClick={onSubmit}
						className={cn("ml-[16px] w-[228px]!", !canSubmit && "pointer-events-none opacity-50")}
					>
						Buat atau ubah kesanggupan
					</LegacyButton>
				</div>
			</div>
			<div className="w-full px-[15px] min-[992px]:w-1/3">
				<div className="w-[280px]! min-[992px]:ml-auto">
					<LegacySelect
						value={filter}
						options={CAPABILITY_FILTER_OPTIONS}
						onChange={(value) => onFilterChange(value as CapabilityFilter)}
					/>
				</div>
			</div>
		</div>

		{/* `hr.tbr_divider_solid` (app.css 486-490) over porto's 22px `hr` margins */}
		<hr className="my-[22px] h-[2px] border-0 bg-[var(--bg-primary)]" />

		<div className="mx-[-15px] mb-[8px] flex flex-wrap">
			<div className="w-full px-[15px] min-[768px]:w-1/6">
				<div className="mb-[8px] min-[768px]:w-3/4">
					<LegacySelect
						value={String(state.length)}
						options={LENGTH_OPTIONS}
						searchable={false}
						onChange={(value) => onStateChange({ ...state, length: Number(value), page: 1 })}
					/>
				</div>
			</div>
			<div className="w-full px-[15px] min-[768px]:w-7/12">
				<div className="mx-[-15px] flex flex-wrap justify-end">
					<div className="w-full px-[15px] min-[768px]:w-5/12">
						<div className="mb-[8px]">
							<LegacySelect value={subGrade} options={subGradeOptions} onChange={onSubGradeChange} />
						</div>
					</div>
				</div>
			</div>
			<div className="w-full px-[15px] min-[768px]:w-1/4">
				<input
					type="text"
					value={state.search}
					placeholder="Search"
					onChange={(event) => onStateChange({ ...state, search: event.target.value, page: 1 })}
					className={SEARCH_CLASS}
				/>
			</div>
		</div>
	</>
)

export default CapabilityStudentToolbar
