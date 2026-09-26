import type { JSX } from "react"
import { Link } from "@tanstack/react-router"

import type { AdminStudentRosterRow, SettingFormItem } from "@roja/types"

import LegacyCheckbox from "@/components/legacy/legacy-checkbox"
import type { LegacyColumn } from "@/components/legacy/legacy-data-table"

import StudentKbmStatus, { kbmNoteText } from "./student-kbm-status"
import { ACTION_LINK_CLASS, DETAIL_ICON, DestroyAction, StudentLabel } from "./student-ui"

export type NumberedStudent = AdminStudentRosterRow & { no: number }

const dmy = (ymd: string | null): string => {
	if (!ymd) return ""
	const [year, month, day] = ymd.split("-")
	return `${day}-${month}-${year}`
}

const accountActive = (isBlocked: boolean | null): boolean => isBlocked !== true

export const rosterCellText = (row: NumberedStudent, key: string): string => {
	switch (key) {
		case "no":
			return String(row.no)
		case "nis":
			return row.nis ?? ""
		case "fullname":
			return row.fullname ?? ""
		case "dateOfBirth":
			return `${row.dateOfBirth ?? ""} ${dmy(row.dateOfBirth)}`
		case "parentName":
			return row.parentName ?? ""
		case "majorName":
			return row.majorName ?? ""
		case "subGrade":
			return row.subGrade ?? ""
		case "kbm":
			return row.gradeNote === "keluar" ? `Keluar ${row.fullname ?? ""} ${row.dropoutNote ?? ""}` : kbmNoteText(row.gradeNote)
		case "account":
			return accountActive(row.isBlocked) ? "Active" : "Deactive"
		default:
			return ""
	}
}

export const ROSTER_SEARCH_KEYS = ["no", "nis", "fullname", "dateOfBirth", "parentName", "majorName", "subGrade", "kbm", "account"]

const limit20 = (label: string): string => (label.length <= 20 ? label : `${label.slice(0, 20).trimEnd()} ...`)

type ColumnOptions = {
	settings: readonly SettingFormItem[]
	checked: ReadonlySet<number>
	allChecked: boolean
	onToggle: (id: number, checked: boolean) => void
	onToggleAll: (checked: boolean) => void
	onDelete: (row: NumberedStudent) => void
}

const Photo = ({ url }: { url: string | null }): JSX.Element => (
	<div
		className="relative h-[50px] w-[40px] overflow-hidden rounded-[5px] bg-[var(--primary)] bg-cover bg-center bg-no-repeat"
		style={{ backgroundImage: `url(${url ?? "/assets/svg/etc/No-Photo.svg"})` }}
	/>
)

export const rosterColumns = ({ settings, checked, allChecked, onToggle, onToggleAll, onDelete }: ColumnOptions): LegacyColumn<NumberedStudent>[] => {
	const setting = (id: number): SettingFormItem | undefined => settings.find((row) => row.id === id)
	const on = (id: number): boolean => setting(id)?.status === true
	const columns: Array<LegacyColumn<NumberedStudent> & { visible?: boolean }> = [
		{
			key: "check",
			width: "2%",
			header: <LegacyCheckbox id="tbr_check_all_header" checked={allChecked} onChange={onToggleAll} label="" />,
			sortable: false,
			cell: (row, index) => (
				<LegacyCheckbox id={`data_${index}`} name="checkbox-datatable" checked={checked.has(row.id)} onChange={(value) => onToggle(row.id, value)} label="" />
			),
		},
		{ key: "no", header: "No", width: "4%", sortable: true, cell: (row) => row.no },
		{ key: "photo", header: "Foto", width: "6%", sortable: true, cell: (row) => <Photo url={row.photoUrl} /> },
		{ key: "nis", header: "NISP", width: "8%", sortable: true, cell: (row) => row.nis },
		{ key: "fullname", header: limit20(setting(1)?.label ?? ""), width: "17%", sortable: true, visible: on(1), cell: (row) => row.fullname },
		{
			key: "dateOfBirth",
			header: setting(6)?.label ?? "",
			width: "9%",
			sortable: true,
			visible: on(6),
			cell: (row) => (row.dateOfBirth ? <div>{dmy(row.dateOfBirth)}</div> : null),
		},
		{ key: "parentName", header: "Orang Tua", width: "11%", sortable: true, visible: on(37) || on(44), cell: (row) => row.parentName },
		{ key: "majorName", header: "Jurusan", width: "8%", sortable: true, cell: (row) => row.majorName },
		{ key: "subGrade", header: "Subkelas", width: "8%", sortable: true, cell: (row) => (row.subGrade === "undefined" ? null : row.subGrade) },
		{
			key: "kbm",
			header: "Keterangan",
			width: "12.5%",
			sortable: true,
			cell: (row) => <StudentKbmStatus gradeStatus={row.gradeStatus} gradeNote={row.gradeNote} fullname={row.fullname} dropoutNote={row.dropoutNote} />,
		},
		{
			key: "account",
			header: "S. Account",
			width: "8.5%",
			sortable: true,
			cell: (row) =>
				accountActive(row.isBlocked) ? (
					<StudentLabel variant="success">Active</StudentLabel>
				) : (
					<StudentLabel variant="danger" className="truncate">
						Deactive
					</StudentLabel>
				),
		},
		{
			key: "action",
			header: "Actions",
			width: "6%",
			sortable: false,
			cell: (row) => (
				<div>
					<Link to="/students/$studentGradeId" params={{ studentGradeId: String(row.id) }} className={ACTION_LINK_CLASS}>
						{DETAIL_ICON}
					</Link>{" "}
					<DestroyAction onClick={() => onDelete(row)} />
				</div>
			),
		},
	]
	return columns.filter((column) => column.visible !== false)
}
