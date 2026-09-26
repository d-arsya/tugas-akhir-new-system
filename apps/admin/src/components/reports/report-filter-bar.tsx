import type { JSX } from "react"

import type { ReportArrearFilterParams, ReportExportKind, ReportOptions } from "@roja/types"
import { cn } from "@roja/utils"

import LegacyButton, { legacyButtonClass } from "@/components/legacy/legacy-button"
import LegacyDateRange from "@/components/legacy/legacy-date-range"
import LegacySelect from "@/components/legacy/legacy-select"
import type { ReportFilters } from "@/hooks/use-report-filters"
import { useDownloadReport } from "@/hooks/use-reports"

type SelectKey = "accountancy" | "academicYear" | "grade" | "subGrade"

type ReportFilterBarProps = {
	options: ReportOptions | undefined
	selects: SelectKey[]
	draft: ReportFilters
	onDraftChange: (patch: Partial<ReportFilters>) => void
	onFilter: () => void
	exportKind: ReportExportKind
	exportParams: ReportArrearFilterParams
	blockExport?: boolean
}

const selectOptions = (key: SelectKey, options: ReportOptions | undefined): { value: string; label: string }[] => {
	switch (key) {
		case "accountancy":
			return [{ value: "", label: "Nama Biaya" }, ...(options?.accountancies ?? []).map((name) => ({ value: name, label: name }))]
		case "academicYear":
			return [{ value: "", label: "Tahun Ajaran" }, ...(options?.academicYears ?? []).map((year) => ({ value: year, label: year }))]
		case "grade":
			return [{ value: "", label: "Kelas" }, ...(options?.grades ?? []).map((grade) => ({ value: String(grade), label: String(grade) }))]
		case "subGrade":
			return [
				{ value: "", label: "Subkelas" },
				{ value: "undefined", label: "Undefined" },
				...(options?.subGrades ?? []).map((label) => ({ value: label, label })),
			]
	}
}

const ExportIcon = (): JSX.Element => (
	<svg className="mr-[8px]" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
		<rect width="24" height="24" fill="none" />
		<path
			d="M17,8a1,1,0,0,1,0-2h1a4,4,0,0,1,4,4v8a4,4,0,0,1-4,4H6a4,4,0,0,1-4-4V9.993a4,4,0,0,1,4-4H7a1,1,0,0,1,0,2H6a2,2,0,0,0-2,2V18a2,2,0,0,0,2,2H18a2,2,0,0,0,2-2V10a2,2,0,0,0-2-2Z"
			fill="#fff"
			opacity="0.3"
		/>
		<rect width="2" height="12" rx="1" transform="translate(13 14) rotate(180)" fill="#fff" opacity="0.3" />
		<path
			d="M12-2.586,14.293-.293a1,1,0,0,0,1.414,0,1,1,0,0,0,0-1.414l-3-3a1,1,0,0,0-1.414,0l-3,3a1,1,0,0,0,0,1.414,1,1,0,0,0,1.414,0Z"
			transform="translate(0 5)"
			fill="#fff"
		/>
	</svg>
)

const INPUT_COL = "mb-[10px] w-full px-[10px] min-[481px]:w-[155px]"

const ReportFilterBar = ({
	options,
	selects,
	draft,
	onDraftChange,
	onFilter,
	exportKind,
	exportParams,
	blockExport = false,
}: ReportFilterBarProps): JSX.Element => {
	const download = useDownloadReport()

	return (
		<div className="mb-[10px] flex flex-col flex-wrap min-[481px]:flex-row">
			<div className="mb-[10px] w-full px-[10px] min-[481px]:w-[275px]">
				<LegacyDateRange from={draft.from} to={draft.to} onChange={(from, to) => onDraftChange({ from, to })} />
			</div>
			{selects.map((key) => (
				<div key={key} className={INPUT_COL}>
					<LegacySelect
						value={draft[key]}
						options={selectOptions(key, options)}
						mutedText={draft[key] === ""}
						onChange={(value) => onDraftChange({ [key]: value })}
					/>
				</div>
			))}
			<div className="mb-[10px] w-full px-[10px] min-[481px]:w-auto">
				<LegacyButton variant="light-primary" className="w-full" onClick={onFilter}>
					Filter
				</LegacyButton>
			</div>
			<div className="mb-[10px] w-full px-[10px] min-[481px]:w-[120px] min-[1351px]:ml-auto">
				<a
					href="#"
					onClick={(event) => {
						event.preventDefault()
						if (!download.isPending) download.mutate({ kind: exportKind, params: exportParams })
					}}
					aria-disabled={download.isPending}
					className={legacyButtonClass(
						"success",
						cn(
							"w-full px-[10px] aria-disabled:cursor-progress aria-disabled:opacity-65",
							blockExport ? "block [&>svg]:inline-block [&>svg]:align-middle" : "flex",
						),
					)}
				>
					<ExportIcon />
					Export
				</a>
			</div>
		</div>
	)
}

export default ReportFilterBar
