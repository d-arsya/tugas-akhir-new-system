import type { JSX } from "react"

import LegacyInput from "@/components/legacy/legacy-input"
import LegacySelect from "@/components/legacy/legacy-select"
import { useProvinces, useRegencies } from "@/hooks/use-school-setting"
import type { TableState } from "@/lib/legacy-table"

// OWNER: AK-A. `alumni/partials/listing-alumni/datatable-tools.blade.php` + `alumni/datatable-tools.js` +
// `alumni/province.js`: Show, Provinsi, Kabupaten and Search, each in a `.col-md-3 > .form-group.mb-2`.
// Picking a province filters the Provinsi column by its name and reloads the Kabupaten options (valued by
// name); the empty "Provinsi" option clears both column searches (the regency URL 404s in legacy).

const ENTRIES = ["10", "25", "50", "100"].map((value) => ({ value, label: value }))

export type AlumniColumnFilter = { provinceId: string; province: string; regency: string }

export const NO_COLUMN_FILTER: AlumniColumnFilter = { provinceId: "", province: "", regency: "" }

type AlumniYearToolsProps = {
	state: TableState
	onStateChange: (state: TableState) => void
	filter: AlumniColumnFilter
	onFilterChange: (filter: AlumniColumnFilter) => void
}

const AlumniYearTools = ({ state, onStateChange, filter, onFilterChange }: AlumniYearToolsProps): JSX.Element => {
	const provinces = useProvinces()
	const regencies = useRegencies(filter.provinceId === "" ? null : Number(filter.provinceId))

	const provinceOptions = [{ value: "", label: "Provinsi" }, ...(provinces.data ?? []).map((row) => ({ value: String(row.id), label: row.name }))]
	const regencyOptions = [{ value: "", label: "Kabupaten" }, ...(regencies.data ?? []).map((row) => ({ value: row.name, label: row.name }))]

	const cell = "w-full px-[15px] min-[768px]:w-1/4"

	return (
		// `.row.justify-content-center.mb-1`
		<div className="mx-[-15px] mb-[4px] flex flex-wrap justify-center">
			<div className={cell}>
				{/* `.tbr_results_per_page` — 75px wide, centred below md */}
				<div className="mx-auto mb-[8px] w-[75px] min-w-[75px] min-[768px]:ml-0">
					<LegacySelect
						value={String(state.length)}
						options={ENTRIES}
						searchable={false}
						onChange={(value) => onStateChange({ ...state, length: Number(value), page: 1 })}
					/>
				</div>
			</div>
			<div className={cell}>
				<div className="mb-[8px]">
					<LegacySelect
						value={filter.provinceId}
						options={provinceOptions}
						mutedText={filter.provinceId === ""}
						onChange={(value) => {
							const name = provinces.data?.find((row) => String(row.id) === value)?.name ?? ""
							onFilterChange({ provinceId: value, province: name, regency: "" })
							onStateChange({ ...state, page: 1 })
						}}
					/>
				</div>
			</div>
			<div className={cell}>
				<div className="mb-[8px]">
					<LegacySelect
						value={filter.regency}
						options={regencyOptions}
						mutedText={filter.regency === ""}
						onChange={(value) => {
							onFilterChange({ ...filter, regency: value })
							onStateChange({ ...state, page: 1 })
						}}
					/>
				</div>
			</div>
			<div className={cell}>
				{/* `.tbr_search_term` — DataTables `search()` on every keyup */}
				<div className="mb-[8px]">
					<LegacyInput
						type="text"
						name="search"
						id="search"
						placeholder="Search"
						spellCheck={false}
						value={state.search}
						onChange={(event) => onStateChange({ ...state, search: event.target.value, page: 1 })}
					/>
				</div>
			</div>
		</div>
	)
}

export default AlumniYearTools
