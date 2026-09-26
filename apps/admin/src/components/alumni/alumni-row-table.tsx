import { useMemo, type JSX } from "react"
import { Link } from "@tanstack/react-router"

import type { AdminAlumniList, AdminAlumniRow } from "@roja/types"

import LegacyDataTable, { type LegacyColumn } from "@/components/legacy/legacy-data-table"
import { clientTable, type TableState } from "@/lib/legacy-table"

export type NumberedAlumni = AdminAlumniRow & { no: number }

export const strLimit = (value: string, limit = 20): string =>
	Array.from(value).length <= limit ? value : `${Array.from(value).slice(0, limit).join("").trimEnd()}...`

const plain = (html: string | null): string => (html ?? "").replace(/<[^>]*>/g, "")

const cellText = (row: NumberedAlumni, key: string): string => {
	switch (key) {
		case "no":
			return String(row.no)
		case "fullname":
			return row.fullname ?? ""
		case "phone":
			return row.alumniPhone ?? ""
		case "province":
			return row.provinceName
		case "regency":
			return row.regencyName
		case "talent":
			return plain(row.alumniTalent)
		default:
			return ""
	}
}

const SEARCH_KEYS = ["no", "fullname", "phone", "province", "regency", "talent"]

const smartMatch = (cell: string, term: string): boolean => {
	const words = term.trim().toLowerCase().split(/\s+/).filter((word) => word !== "")
	const text = cell.toLowerCase()
	return words.every((word) => text.includes(word))
}

const PhotoCell = ({ url }: { url: string | null }): JSX.Element => (
	<div
		className="relative h-[50px] w-[40px] overflow-hidden rounded-[5px] bg-[var(--primary)] bg-cover bg-center bg-no-repeat"
		style={{ backgroundImage: `url(${url ?? "/assets/svg/etc/No-Photo.svg"})` }}
	/>
)

type AlumniRowTableProps = {
	list: AdminAlumniList | undefined
	state: TableState
	onStateChange: (state: TableState) => void
	processing: boolean
	loaded: boolean
	onDelete: (row: NumberedAlumni) => void
	toolbar: boolean
	hideNameWhenOff: boolean
	columnSearch?: { province: string; regency: string }
}

const AlumniRowTable = ({
	list,
	state,
	onStateChange,
	processing,
	loaded,
	onDelete,
	toolbar,
	hideNameWhenOff,
	columnSearch,
}: AlumniRowTableProps): JSX.Element => {
	const numbered = useMemo<NumberedAlumni[]>(() => (list?.rows ?? []).map((row, index) => ({ ...row, no: index + 1 })), [list])
	const filtered = useMemo(
		() =>
			columnSearch
				? numbered.filter((row) => smartMatch(row.provinceName, columnSearch.province) && smartMatch(row.regencyName, columnSearch.regency))
				: numbered,
		[numbered, columnSearch],
	)
	const page = useMemo(() => clientTable(filtered, state, cellText, SEARCH_KEYS), [filtered, state])

	const showName = !(hideNameWhenOff && list !== undefined && !list.nameVisible)
	const columns: LegacyColumn<NumberedAlumni>[] = [
		{ key: "no", header: "No", width: "6%", sortable: true, cell: (row) => row.no },
		{ key: "photo", header: "Foto", width: "8%", sortable: false, cell: (row) => <PhotoCell url={row.photoUrl} /> },
		...(showName
			? [{ key: "fullname", header: strLimit(list?.nameLabel ?? ""), width: "20%", sortable: true, cell: (row: NumberedAlumni) => row.fullname }]
			: []),
		{ key: "phone", header: "Telepon", width: "10%", sortable: true, cell: (row) => row.alumniPhone },
		{ key: "province", header: "Provinsi", width: "12%", sortable: true, cell: (row) => row.provinceName },
		{ key: "regency", header: "Kabupaten", width: "12%", sortable: true, cell: (row) => row.regencyName },
		{
			key: "talent",
			header: "Minat Bakat",
			width: "23%",
			sortable: true,
			cell: (row) => (row.alumniTalent ? <div dangerouslySetInnerHTML={{ __html: row.alumniTalent }} /> : null),
		},
		{
			key: "actions",
			header: "Actions",
			width: "9%",
			sortable: false,
			cell: (row) => (
				<div className="align-middle">
					<Link
						to="/alumni/detail/$alumniId"
						params={{ alumniId: String(row.id) }}
						className="mr-[5px] inline-block align-middle"
					>
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
		<LegacyDataTable
			columns={columns}
			rows={page.rows}
			rowKey={(row) => row.id}
			total={page.total}
			state={state}
			onStateChange={onStateChange}
			processing={processing}
			loaded={loaded}
			initialSort={{ key: "no", dir: "asc" }}
			minWidth="1100px"
			toolbar={toolbar}
		/>
	)
}

export default AlumniRowTable
