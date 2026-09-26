import { useMemo, useState, type JSX } from "react"
import { Link } from "@tanstack/react-router"

import type { CapabilityGradeRow } from "@roja/types"

import LegacyDataTable, { type LegacyColumn } from "@/components/legacy/legacy-data-table"
import LegacyLabel from "@/components/legacy/legacy-label"
import CapabilityCostMissingModal from "@/components/student-capabilities/modals/capability-cost-missing-modal"
import { useCapabilityGrades } from "@/hooks/use-student-capabilities"
import { clientTable, INITIAL_TABLE_STATE, type TableState } from "@/lib/legacy-table"

import { ArrowActionIcon, CAPABILITY_ACTION_CLASS } from "./capability-icons"

type NumberedGrade = CapabilityGradeRow & { no: number }

const masterCostText = (row: CapabilityGradeRow): string => (row.masterCostDefined ? "Sudah ditentukan" : "Belum ditentukan")
const studentCountText = (row: CapabilityGradeRow): string => `${row.studentCount} Santri`

const cellText = (row: NumberedGrade, key: string): string => {
	switch (key) {
		case "no":
			return String(row.no)
		case "name":
			return row.name
		case "masterCost":
			return masterCostText(row)
		case "studentCount":
			return studentCountText(row)
		case "note":
			return row.note
		default:
			return ""
	}
}

const SEARCH_KEYS = ["no", "name", "masterCost", "studentCount", "note"]

type CapabilityGradeTableProps = { academicYearId: number; year: string | null }

const CapabilityGradeTable = ({ academicYearId, year }: CapabilityGradeTableProps): JSX.Element => {
	const { data, isFetching, isSuccess } = useCapabilityGrades(academicYearId)
	const [state, setState] = useState<TableState>(INITIAL_TABLE_STATE)
	const [missing, setMissing] = useState<CapabilityGradeRow | null>(null)

	const numbered = useMemo<NumberedGrade[]>(() => (data ?? []).map((row, index) => ({ ...row, no: index + 1 })), [data])
	const page = useMemo(() => clientTable(numbered, state, cellText, SEARCH_KEYS), [numbered, state])

	const columns: LegacyColumn<NumberedGrade>[] = [
		{ key: "no", header: "No", width: "5%", sortable: true, cell: (row) => row.no },
		{ key: "name", header: "Kelas", width: "20%", sortable: true, cell: (row) => row.name },
		{
			key: "masterCost",
			header: "Master Biaya",
			width: "20%",
			sortable: true,
			cell: (row) => (
				<LegacyLabel variant={row.masterCostDefined ? "success" : "danger"}>{masterCostText(row)}</LegacyLabel>
			),
		},
		{ key: "studentCount", header: "Total Santri", width: "20%", sortable: true, cell: studentCountText },
		{ key: "note", header: "Keterangan", width: "20%", sortable: true, cell: (row) => row.note },
		{
			key: "action",
			header: "Actions",
			width: "5%",
			sortable: false,
			cell: (row) => (
				<div>
					{row.canDrillDown ? (
						<Link
							to="/student-capabilities/academic-years/$academicYearId/grades/$gradeId"
							params={{ academicYearId: String(academicYearId), gradeId: String(row.id) }}
							className={CAPABILITY_ACTION_CLASS}
						>
							<ArrowActionIcon />
						</Link>
					) : (
						<button type="button" onClick={() => setMissing(row)} className={CAPABILITY_ACTION_CLASS}>
							<ArrowActionIcon />
						</button>
					)}
				</div>
			),
		},
	]

	return (
		<>
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
				minWidth="auto"
			/>
			<CapabilityCostMissingModal
				open={missing !== null}
				gradeLabel={`Kelas ${missing?.label ?? ""}`}
				academicYear={year}
				studentCostTo={`/student-costs/${academicYearId}/grades/${missing?.id ?? ""}`}
				onCancel={() => setMissing(null)}
			/>
		</>
	)
}

export default CapabilityGradeTable
