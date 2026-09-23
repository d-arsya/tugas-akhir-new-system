import { useMemo, useState, type JSX } from "react"

import type { AcademicYearQuotaRow } from "@roja/types"

import LegacyButton from "@/components/legacy/legacy-button"
import LegacyCard, { LegacyCardText, LegacyCardTitle } from "@/components/legacy/legacy-card"
import LegacyDataTable, { type LegacyColumn } from "@/components/legacy/legacy-data-table"
import { InfoCircleIcon } from "@/components/legacy/legacy-icons"
import LegacyInput from "@/components/legacy/legacy-input"
import LegacyLabel from "@/components/legacy/legacy-label"
import LegacyModal from "@/components/legacy/legacy-modal"
import { legacyNotify } from "@/components/legacy/legacy-notify"
import LegacyTooltip from "@/components/legacy/legacy-tooltip"
import { clientTable, INITIAL_TABLE_STATE, type TableState } from "@/lib/legacy-table"

import AcademicYearField from "./academic-year-field"

type NumberedQuota = AcademicYearQuotaRow & { no: number }

type AcademicYearQuotaCardProps = {
	rows: AcademicYearQuotaRow[]
	/** Level id → the raw string in that level's `quota[]` input, "" while it is untouched */
	quotas: Record<number, string>
	onQuotaChange: (levelId: number, quota: string) => void
	/** The create and edit blades word this paragraph differently, typos included */
	intro: string
	processing: boolean
	loaded: boolean
}

/**
 * `AcademicYearService::getRemainingQuota()` — note the `$quota != 0` guard: a zero-quota level
 * shows its (possibly negative) remainder instead of the "Penuh" badge. Live today for the
 * levels a year never funded.
 */
const remainingQuota = (row: AcademicYearQuotaRow, quota: string): JSX.Element | number | null => {
	// The create page's Kuota and Sisa cells start empty; legacy fills them only once the modal saves
	if (quota === "") return null
	const value = Number(quota) - (row.psb + row.tmq)
	if (value <= 0 && Number(quota) !== 0) return <LegacyLabel variant="danger">Penuh</LegacyLabel>
	return value
}

const cellText = (row: NumberedQuota, key: string, quotas: Record<number, string>): string => {
	switch (key) {
		case "no":
			return String(row.no)
		case "level":
			return row.levelName ?? ""
		case "quota":
			return quotas[row.levelId] ?? ""
		case "psb":
			return String(row.psb)
		case "tmq":
			return String(row.tmq)
		default:
			return ""
	}
}

const SEARCH_KEYS = ["no", "level", "quota", "psb", "tmq"]

// The right-hand card of `academic-year/create.blade.php` and `edit.blade.php`, plus the
// per-level `#add-quota-{id}` modal and `assets/js/add-quota.js` that drives it
const AcademicYearQuotaCard = ({
	rows,
	quotas,
	onQuotaChange,
	intro,
	processing,
	loaded,
}: AcademicYearQuotaCardProps): JSX.Element => {
	const [state, setState] = useState<TableState>(INITIAL_TABLE_STATE)
	const [editing, setEditing] = useState<AcademicYearQuotaRow | null>(null)
	const [draft, setDraft] = useState("")

	const numbered = useMemo<NumberedQuota[]>(() => rows.map((row, index) => ({ ...row, no: index + 1 })), [rows])
	const page = useMemo(
		() => clientTable(numbered, state, (row, key) => cellText(row, key, quotas), SEARCH_KEYS),
		[numbered, state, quotas],
	)

	const openModal = (row: AcademicYearQuotaRow): void => {
		setEditing(row)
		setDraft(quotas[row.levelId] ?? "")
	}

	// `$(".saveQuota").on("click", …)` — both messages verbatim
	const saveQuota = (): void => {
		if (editing === null) return
		if (draft === "") {
			legacyNotify.error("Kolom kuota wajib untuk diisi.")
			return
		}
		if (Number(draft) - (editing.psb + editing.tmq) < 0) {
			legacyNotify.error("Kuota terlalu sedikit.")
			return
		}
		onQuotaChange(editing.levelId, draft)
		setEditing(null)
	}

	const columns: LegacyColumn<NumberedQuota>[] = [
		{ key: "no", header: "No", sortable: true, cell: (row) => row.no },
		{ key: "level", header: "Jenjang", sortable: true, cell: (row) => row.levelName },
		{ key: "quota", header: "Kuota", sortable: true, cell: (row) => quotas[row.levelId] ?? "" },
		{ key: "psb", header: "PSB", sortable: true, cell: (row) => row.psb },
		{
			key: "tmq",
			header: (
				<span className="inline-flex items-center">
					TMQ
					{/* `<svg class="ml-1" data-toggle="tooltip" title="Dari kenaikan jenjang.">` */}
					<LegacyTooltip content="Dari kenaikan jenjang." className="ml-[4px]">
						<InfoCircleIcon />
					</LegacyTooltip>
				</span>
			),
			sortable: true,
			cell: (row) => row.tmq,
		},
		{ key: "sisa", header: "Sisa", sortable: true, cell: (row) => remainingQuota(row, quotas[row.levelId] ?? "") },
		{
			key: "actions",
			header: "Actions",
			// `initDatatable(url, [6])`
			sortable: false,
			// `AcademicYearService::addQuota()` — `<div class='pl-2 ml-1'>` around the pencil
			// The anchor and the image are inline, as they are in the rendered HTML, so the row
			// keeps legacy's 49px height instead of gaining an inline-block baseline gap
			cell: (row) => (
				<div className="ml-[4px] pl-[8px]">
					<button type="button" className="inline cursor-pointer align-middle" onClick={() => openModal(row)}>
						<img src="/assets/svg/icons/pencil.svg" alt="" width={24} height={24} className="inline align-middle" />
					</button>
				</div>
			),
		},
	]

	return (
		<LegacyCard>
			<LegacyCardTitle className="mb-[8px]!">Kuota jenjang</LegacyCardTitle>
			<LegacyCardText>{intro}</LegacyCardText>

			<LegacyDataTable
				columns={columns}
				rows={page.rows}
				rowKey={(row) => row.levelId}
				total={page.total}
				state={state}
				onStateChange={setState}
				processing={processing}
				loaded={loaded}
				initialSort={{ key: "no", dir: "asc" }}
				minWidth="580px"
			/>

			<LegacyModal
				open={editing !== null}
				onClose={() => setEditing(null)}
				size="sm"
				title="Tambah atau edit kuota"
				footer={
					<>
						<LegacyButton variant="light" className="mr-[8px]" onClick={() => setEditing(null)}>
							Batal
						</LegacyButton>{" "}
						<LegacyButton variant="primary" onClick={saveQuota}>
							Simpan
						</LegacyButton>
					</>
				}
			>
				<AcademicYearField label="Nama Jenjang" htmlFor="level_name" hint="required">
					<LegacyInput id="level_name" type="text" autoComplete="off" spellCheck={false} readOnly value={editing?.levelName ?? ""} />
				</AcademicYearField>
				{/* `.form-group.mb-1` */}
				<AcademicYearField label="Kuota Peserta" htmlFor="quota" hint="required" className="mb-[4px]">
					<LegacyInput
						id="quota"
						type="number"
						min={0}
						autoComplete="off"
						spellCheck={false}
						value={draft}
						onChange={(event) => setDraft(event.target.value)}
					/>
				</AcademicYearField>
			</LegacyModal>
		</LegacyCard>
	)
}

export default AcademicYearQuotaCard
