import { useMemo, useState, type JSX } from "react"
import { Link } from "@tanstack/react-router"

import type { StudentInvoiceListRow } from "@roja/types"

import LegacyDataTable, { type LegacyColumn } from "@/components/legacy/legacy-data-table"
import LegacyInput from "@/components/legacy/legacy-input"
import LegacySelect from "@/components/legacy/legacy-select"
import { ACTION_PILL_CLASS, StudentBillsIcon } from "@/components/student-invoices/invoice-icons"
import { useReportOptions } from "@/hooks/use-reports"
import { fetchStudentInvoiceRows, studentInvoiceKeys } from "@/hooks/use-student-invoices"
import { useServerTable } from "@/hooks/use-server-table"

const LENGTH_OPTIONS = ["10", "25", "50", "100"].map((value) => ({ value, label: value }))

const StudentPickerTable = (): JSX.Element => {
	const [grade, setGrade] = useState("")
	const [subGrade, setSubGrade] = useState("")
	const options = useReportOptions()

	const gradeOptions = useMemo(
		() => [{ value: "", label: "Kelas" }, ...(options.data?.grades ?? []).map((value) => ({ value: String(value), label: String(value) }))],
		[options.data],
	)
	const subGradeOptions = useMemo(
		() => [
			{ value: "", label: "Subkelas" },
			{ value: "undefined", label: "Undefined" },
			...(options.data?.subGrades ?? []).map((label) => ({ value: label, label })),
		],
		[options.data],
	)

	const table = useServerTable({
		queryKey: studentInvoiceKeys.students(),
		fetcher: fetchStudentInvoiceRows,
		extra: { ...(grade ? { grade } : {}), ...(subGrade ? { subGrade } : {}) },
	})

	const columns: LegacyColumn<StudentInvoiceListRow>[] = [
		{ key: "no", header: "No", width: "7px", cell: (_row, index) => index },
		{ key: "nis", header: "NISP", width: "15%", sortable: true, cell: (row) => row.nis },
		{ key: "fullName", header: "Nama Lengkap", sortable: true, cell: (row) => row.fullName },
		{ key: "parentOrGuardian", header: "Ortu atau Wali", width: "15%", sortable: true, cell: (row) => row.parentOrGuardian },
		{ key: "grade", header: "Kls", width: "7%", sortable: true, cell: (row) => row.grade },
		{ key: "subGrade", header: "SubKelas", width: "13%", sortable: true, cell: (row) => row.subGrade },
		{ key: "invoiceCount", header: "Tagihan", width: "10%", sortable: true, cell: (row) => row.invoiceCount },
		{ key: "unpaidCount", header: "Blm. Lunas", width: "13%", sortable: true, cell: (row) => row.unpaidCount },
		{
			key: "action",
			header: "",
			width: "5%",
			cell: (row) => (
				<div>
					<Link
						to="/student-invoices/$studentGradeId"
						params={{ studentGradeId: String(row.studentGradeId) }}
						aria-label={`Tagihan ${row.fullName ?? ""}`}
						className={ACTION_PILL_CLASS}
					>
						<StudentBillsIcon />
					</Link>
				</div>
			),
		},
	]

	return (
		<>
			<div className="mx-[-15px] mb-[8px] flex flex-wrap">
				<div className="w-full px-[15px] min-[768px]:w-1/4">
					<LegacyInput
						type="text"
						value={table.state.search}
						placeholder="Search"
						onChange={(event) => table.setState({ ...table.state, search: event.target.value, page: 1 })}
					/>
				</div>
				<div className="w-full px-[15px] min-[768px]:w-1/6">
					<div className="mb-[8px] min-[992px]:w-3/4">
						<LegacySelect
							value={String(table.state.length)}
							options={LENGTH_OPTIONS}
							searchable={false}
							onChange={(value) => table.setState({ ...table.state, length: Number(value), page: 1 })}
						/>
					</div>
				</div>
				<div className="w-full px-[15px] min-[768px]:w-7/12">
					<div className="mx-[-15px] flex flex-wrap justify-end">
						<div className="w-full px-[15px] min-[768px]:w-5/12">
							<div className="mb-[8px]">
								<LegacySelect
									value={grade}
									options={gradeOptions}
									mutedText
									onChange={(value) => {
										setGrade(value)
										table.setState({ ...table.state, page: 1 })
									}}
								/>
							</div>
						</div>
						<div className="w-full px-[15px] min-[768px]:w-5/12">
							<div className="mb-[8px]">
								<LegacySelect
									value={subGrade}
									options={subGradeOptions}
									mutedText
									onChange={(value) => {
										setSubGrade(value)
										table.setState({ ...table.state, page: 1 })
									}}
								/>
							</div>
						</div>
					</div>
				</div>
			</div>

			<LegacyDataTable
				columns={columns}
				rows={table.rows}
				rowKey={(row) => row.studentGradeId}
				total={table.total}
				state={table.state}
				onStateChange={table.setState}
				processing={table.processing}
				loaded={table.loaded}
				initialSort={{ key: "nis", dir: "desc" }}
				minWidth="950px"
				toolbar={false}
			/>
		</>
	)
}

export default StudentPickerTable
