import { useMemo, useState, type JSX } from "react"
import { Link } from "@tanstack/react-router"

import type { AdminRegistrantListTab, AdminRegistrantOption, AdminRegistrantProgress, AdminRegistrantRow } from "@roja/types"

import LegacyDataTable, { type LegacyColumn } from "@/components/legacy/legacy-data-table"
import LegacyDateRange from "@/components/legacy/legacy-date-range"
import LegacyLabel from "@/components/legacy/legacy-label"
import LegacySelect from "@/components/legacy/legacy-select"
import { useRegistrantRows } from "@/hooks/use-registrants"
import { clientTable, INITIAL_TABLE_STATE, type TableState } from "@/lib/legacy-table"

import { EMPTY_FILTERS, applyRegistrantFilters, dateCellText, type RegistrantFilters } from "./registrant-list-filters"

// `registrant/partials/{new,accepted,rejected}-data-datatable.blade.php` + `registrant-datatable.js`
// (`initCustomDatatable(url, [8], …)`) + `filter.js`; the name / school columns follow settings 1 / 19
// (`columnVisible()`), and the name header is `Str::limit(getInputLabel(1), 20, ' ...')`.

// `RegistrantService::progressLabel()`
const PROGRESS: Record<AdminRegistrantProgress, { variant: "info" | "warning" | "danger" | "success"; text: string }> = {
	validation: { variant: "info", text: "Validasi Data" },
	indent: { variant: "warning", text: "Test Indent" },
	regular: { variant: "danger", text: "Test Regular" },
	announcement: { variant: "success", text: "Pengumuman" },
}

type NumberedRow = AdminRegistrantRow & { no: number }

const cellText = (row: NumberedRow, key: string): string => {
	switch (key) {
		case "no":
			return String(row.no)
		case "registrantId":
			return row.registrantId ?? ""
		case "fullname":
			return row.fullname ?? ""
		case "nis":
			return row.nis ?? ""
		case "schoolName":
			return row.schoolName ?? ""
		case "levelName":
			return row.levelName ?? ""
		case "createdAt":
			return dateCellText(row.createdTs, row.createdAt)
		case "registrationPath":
			return row.registrationPath
		case "progress":
			return PROGRESS[row.progress].text
		case "updatedAt":
			return dateCellText(row.updatedTs, row.updatedAt)
		default:
			return ""
	}
}

const SEARCH_KEYS = ["no", "registrantId", "fullname", "nis", "schoolName", "levelName", "createdAt", "registrationPath", "progress", "updatedAt"]

const PATH_OPTIONS = [
	{ value: "", label: "Semua Jalur" },
	{ value: "reguler", label: "Regular" },
	{ value: "indent", label: "Indent" },
]

/** `Str::limit($value, 20, ' ...')` */
const limit = (value: string): string => (value.length > 20 ? `${value.slice(0, 20).trimEnd()} ...` : value)

type RegistrantListTableProps = {
	academicYearId: number
	tab: AdminRegistrantListTab
	levels: AdminRegistrantOption[]
	/** `getInputLabel($setting_forms, 1)` / `(…, 19)`, or null when the setting is off (column hidden) */
	nameLabel: string | null
	schoolLabel: string | null
	onDelete: (row: AdminRegistrantRow) => void
}

const RegistrantListTable = ({ academicYearId, tab, levels, nameLabel, schoolLabel, onDelete }: RegistrantListTableProps): JSX.Element => {
	const { data, isFetching, isSuccess } = useRegistrantRows(academicYearId, tab)
	const [state, setState] = useState<TableState>(INITIAL_TABLE_STATE)
	const [filters, setFilters] = useState<RegistrantFilters>(EMPTY_FILTERS)

	const numbered = useMemo<NumberedRow[]>(() => (data ?? []).map((row, index) => ({ ...row, no: index + 1 })), [data])
	const filtered = useMemo(() => applyRegistrantFilters(numbered, tab, filters) as NumberedRow[], [numbered, tab, filters])
	const page = useMemo(() => clientTable(filtered, state, cellText, SEARCH_KEYS), [filtered, state])

	const setFilter = (next: Partial<RegistrantFilters>): void => {
		setFilters((current) => ({ ...current, ...next }))
		setState((current) => ({ ...current, page: 1 }))
	}

	const text = (key: string, header: string, value: (row: NumberedRow) => string | null): LegacyColumn<NumberedRow> => ({
		key,
		header,
		sortable: true,
		cell: (row) => value(row),
	})
	const date = (key: "createdAt" | "updatedAt", header: string): LegacyColumn<NumberedRow> => ({
		key,
		header,
		sortable: true,
		// `datatableDate()`: `<div><span class="d-none">{timestamp}</span> {d-m-Y, H:i}</div>`
		cell: (row) => <div>{key === "createdAt" ? row.createdAt : row.updatedAt}</div>,
	})

	const columns: LegacyColumn<NumberedRow>[] = [
		text("no", "No", (row) => String(row.no)),
		text("registrantId", "No. Pendaftar", (row) => row.registrantId),
		...(nameLabel === null ? [] : [text("fullname", limit(nameLabel), (row) => row.fullname)]),
		...(tab === "approved" ? [text("nis", "NISP", (row) => row.nis)] : []),
		...(schoolLabel === null ? [] : [text("schoolName", schoolLabel, (row) => row.schoolName)]),
		text("levelName", "Jenjang", (row) => row.levelName),
		date("createdAt", "Tanggal Daftar"),
		text("registrationPath", "Jalur", (row) => row.registrationPath),
		...(tab === "new"
			? [
					{
						key: "progress",
						header: "Progress",
						sortable: true,
						cell: (row: NumberedRow) => <LegacyLabel variant={PROGRESS[row.progress].variant}>{PROGRESS[row.progress].text}</LegacyLabel>,
					},
				]
			: []),
		...(tab === "rejected" ? [date("updatedAt", "Diubah Pada")] : []),
		{
			key: "actions",
			header: "Actions",
			sortable: false,
			// `RegistrantService::getAction()` — detail link + `deleteData(event, id, url, tab)`
			cell: (row) => (
				<div className="align-middle">
					<Link to="/registrants/$registrantId" params={{ registrantId: String(row.id) }} className="mr-[5px] inline-block align-middle">
						<img src="/assets/svg/icons/data_detail.svg" alt="Detail" width={24} height={24} className="inline-block" />
					</Link>{" "}
					<button type="button" onClick={() => onDelete(row)} className="inline-block cursor-pointer align-middle">
						<img src="/assets/svg/icons/data_destroy.svg" alt="Destroy" width={24} height={24} className="inline-block" />
					</button>
				</div>
			),
		},
	]

	return (
		<>
			{/* `div.row.justify-content-end.mb-3` */}
			<div className="mx-[-15px] mb-[16px] flex flex-wrap justify-end">
				<div className="w-full px-[15px] min-[992px]:w-1/2 min-[1200px]:w-5/12">
					<div className="mb-[8px]">
						<LegacyDateRange from={filters.from} to={filters.to} middleLabel="Sampai" onChange={(from, to) => setFilter({ from, to })} />
					</div>
				</div>
				<div className="w-full px-[15px] min-[768px]:w-1/4">
					<div className="mb-[8px]">
						<LegacySelect
							value={filters.level}
							options={[{ value: "", label: "Semua Jenjang" }, ...levels.map((level) => ({ value: level.name.toLowerCase(), label: level.name }))]}
							mutedText={filters.level === ""}
							onChange={(level) => setFilter({ level })}
						/>
					</div>
				</div>
				<div className="w-full px-[15px] min-[768px]:w-1/4">
					<div className="mb-[8px]">
						<LegacySelect value={filters.path} options={PATH_OPTIONS} mutedText={filters.path === ""} onChange={(path) => setFilter({ path })} />
					</div>
				</div>
			</div>

			<LegacyDataTable
				columns={columns}
				rows={page.rows}
				rowKey={(row) => row.id}
				total={page.total}
				state={state}
				onStateChange={setState}
				processing={isFetching}
				loaded={isSuccess}
				initialSort={{ key: "no", dir: "asc" }}
				minWidth="1300px"
			/>
		</>
	)
}

export default RegistrantListTable
