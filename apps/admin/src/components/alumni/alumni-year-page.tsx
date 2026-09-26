import { useState, type JSX } from "react"
import { Link } from "@tanstack/react-router"

import AdminPageTitle from "@/components/layout/admin-page-title"
import { legacyButtonClass } from "@/components/legacy/legacy-button"
import LegacyTooltip from "@/components/legacy/legacy-tooltip"
import { CapabilityCard, CARD_BACK_CLASS, Kembali } from "@/components/student-capabilities/capability-chrome"
import { useAlumniByYear, useDownloadAlumniExport } from "@/hooks/use-alumni"
import { INITIAL_TABLE_STATE, type TableState } from "@/lib/legacy-table"

import { BackArrowIcon, ExportIcon } from "./alumni-icons"
import AlumniRowTable from "./alumni-row-table"
import AlumniYearTools, { NO_COLUMN_FILTER, type AlumniColumnFilter } from "./alumni-year-tools"
import { useAlumniDelete } from "./use-alumni-delete"

const AlumniYearPage = ({ year }: { year: number }): JSX.Element => {
	const list = useAlumniByYear(year)
	const [state, setState] = useState<TableState>(INITIAL_TABLE_STATE)
	const [filter, setFilter] = useState<AlumniColumnFilter>(NO_COLUMN_FILTER)
	const download = useDownloadAlumniExport(year)
	const remove = useAlumniDelete()

	const back = (
		<>
			<Kembali>
				<Link to="/alumni" className={CARD_BACK_CLASS}>
					<BackArrowIcon />
				</Link>
			</Kembali>
			<LegacyTooltip content="Export" placement="top">
				<button
					type="button"
					aria-label="Export"
					aria-disabled={download.isPending}
					onClick={() => {
						if (!download.isPending) download.mutate()
					}}
					className={legacyButtonClass("success", "ml-[16px] inline-flex p-[8px] aria-disabled:cursor-progress aria-disabled:opacity-65")}
				>
					<ExportIcon />
				</button>
			</LegacyTooltip>
		</>
	)

	return (
		<>
			<AdminPageTitle
				title="Data Alumni"
				breadcrumbs={[
					{ label: "", dropdown: [{ label: "Akademik", to: "/alumni" }] },
					{ label: "Alumni", to: "/alumni" },
					{ label: "Data Alumni", to: "/alumni" },
					{ label: String(year) },
				]}
			/>

			<div className="mx-[-15px] flex min-h-[calc(100vh-216px)] flex-wrap">
				<div className="w-full min-w-0 flex-1 basis-0 px-[15px]">
					<CapabilityCard
						title="Tahun Kelulusan"
						highlight={`(${year})`}
						subtitle={<p className="m-0 leading-[24px] text-[var(--grey)]">Data semua alumni untuk tahun kelulusan {year}</p>}
						back={back}
					>
						<div className="overflow-hidden">
							<AlumniYearTools
								state={state}
								onStateChange={setState}
								filter={filter}
								onFilterChange={setFilter}
							/>
							<AlumniRowTable
								list={list.data}
								state={state}
								onStateChange={setState}
								processing={list.isFetching}
								loaded={list.isSuccess}
								onDelete={(row) => remove.ask({ kind: "alumni", id: row.id })}
								toolbar={false}
								hideNameWhenOff
								columnSearch={{ province: filter.province, regency: filter.regency }}
							/>
						</div>
					</CapabilityCard>
				</div>
			</div>

			{remove.modal}
		</>
	)
}

export default AlumniYearPage
