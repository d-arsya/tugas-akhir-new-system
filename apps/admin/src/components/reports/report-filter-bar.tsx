import { useState, type JSX } from "react"

import type { ReportExportKind, ReportOptions } from "@roja/types"
import { cn } from "@roja/utils"

import LegacyButton, { legacyButtonClass } from "@/components/legacy/legacy-button"
import LegacyDateRange from "@/components/legacy/legacy-date-range"
import { legacyNotify } from "@/components/legacy/legacy-notify"
import LegacySelect from "@/components/legacy/legacy-select"
import type { ReportFilters } from "@/hooks/use-report-filters"
import { adminApi } from "@/lib/api"
import { saveBlob } from "@/lib/download"

type SelectKey = "accountancy" | "academicYear" | "grade" | "subGrade"

type ReportFilterBarProps = {
	options: ReportOptions | undefined
	// Selects shown after the date range, in legacy order
	selects: SelectKey[]
	draft: ReportFilters
	onDraftChange: (patch: Partial<ReportFilters>) => void
	onFilter: () => void
	exportKind: ReportExportKind
	// Legacy exports the last loaded request (`res.responseJSON.input`), including the search box
	exportParams: Parameters<typeof adminApi.downloadReport>[1]
	// report/arrear.blade.php adds `d-block` to the Export link, which drops the flex centring
	blockExport?: boolean
}

// Legacy fallbacks when the header is missing (same names as the Laravel downloads)
const FILE_NAMES: Record<ReportExportKind, string> = {
	"income-detail": "Laporan Pembayaran Santri (Rincian).xlsx",
	"income-recap": "Laporan Pembayaran Santri (Rekapitulasi).xlsx",
	arrears: "Laporan Tunggakan Pembayaran Santri.xlsx",
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

// `.tbr_report_input` column (public/assets/css/app.css "REPORT FILTER CSS")
const INPUT_COL = "mb-[10px] w-full px-[10px] min-[481px]:w-[155px]"

// Port of the legacy `.tbr_report_filter` bar
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
	const [downloading, setDownloading] = useState(false)

	const download = async (): Promise<void> => {
		setDownloading(true)
		try {
			const { blob, fileName } = await adminApi.downloadReport(exportKind, exportParams)
			saveBlob(blob, fileName ?? FILE_NAMES[exportKind])
		} catch {
			legacyNotify.error("Terjadi kesalahan pada sistem. Silakan reload ulang halaman ini.")
		} finally {
			setDownloading(false)
		}
	}

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
						// The placeholder options carry a title, which select2 renders in grey
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
						if (!downloading) void download()
					}}
					aria-disabled={downloading}
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
