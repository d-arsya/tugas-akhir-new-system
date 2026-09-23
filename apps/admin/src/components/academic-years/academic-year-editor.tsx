import { useEffect, useState, type JSX } from "react"

import type { AcademicYearPayload, AcademicYearQuotaRow } from "@roja/types"

import AcademicYearConfirmModal from "./academic-year-confirm-modal"
import AcademicYearForm, { type AcademicYearFormValues } from "./academic-year-form"
import AcademicYearQuotaCard from "./academic-year-quota-card"

type AcademicYearEditorProps = {
	mode: "create" | "edit"
	initial: AcademicYearFormValues
	quotaRows: AcademicYearQuotaRow[]
	quotaProcessing: boolean
	quotaLoaded: boolean
	onSubmit: (payload: AcademicYearPayload) => void
	submitting: boolean
}

const pad = (value: number): string => String(value).padStart(2, "0")

/**
 * `assets/js/student-cost/period.js` — `cost_date_end` is always `cost_date_start + 365 days`,
 * hard-coded and leap-year-unaware, and the input is readonly so it cannot be corrected.
 * Kept as legacy, deliberately.
 */
const plus365 = (start: string): string => {
	const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(start.trim())
	if (!match) return ""
	const date = new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1]))
	date.setDate(date.getDate() + 365)
	return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`
}

// The two-column body shared by `academic-year/create.blade.php` and `edit.blade.php`:
// the form on the left, the quota DataTable on the right, and the confirmation modal that
// intercepts Simpan before any network call happens
const AcademicYearEditor = ({
	mode,
	initial,
	quotaRows,
	quotaProcessing,
	quotaLoaded,
	onSubmit,
	submitting,
}: AcademicYearEditorProps): JSX.Element => {
	const [values, setValues] = useState<AcademicYearFormValues>(initial)
	const [quotas, setQuotas] = useState<Record<number, string>>({})
	const [confirming, setConfirming] = useState(false)
	const [periodNonce, setPeriodNonce] = useState(0)

	// The create page starts every Kuota cell empty; the edit page starts from the pivot value
	useEffect(() => {
		setQuotas(Object.fromEntries(quotaRows.map((row) => [row.levelId, row.quota === null ? "" : String(row.quota)])))
	}, [quotaRows])

	const change = (patch: Partial<AcademicYearFormValues>): void =>
		setValues((current) => {
			const next = { ...current, ...patch }
			// `input-academic-year-name.js` keeps the readonly end year one ahead; edit disables both
			if (patch.startYear !== undefined && mode === "create") {
				const parsed = Number.parseInt(patch.startYear, 10)
				next.endYear = Number.isNaN(parsed) ? "" : String(parsed + 1)
			}
			return next
		})

	// Only `#cost_date_start` has a change handler in legacy; the end input is readonly
	const onPeriodChange = (from: string): void => {
		if (from === values.costDateStart) {
			setPeriodNonce((nonce) => nonce + 1)
			return
		}
		setValues((current) => ({ ...current, costDateStart: from, costDateEnd: plus365(from) }))
	}

	const submit = (): void => {
		setConfirming(false)
		onSubmit({
			...(mode === "create" ? { startYear: values.startYear } : {}),
			activeKbm: values.activeKbm,
			note: values.note,
			serialNumber: values.serialNumber,
			type: values.type,
			status: values.status,
			isCurrent: values.isCurrent,
			costDateStart: values.costDateStart,
			costDateEnd: values.costDateEnd,
			// Legacy serialises every `quota[]` in the form, touched or not
			quotas: quotaRows.map((row) => ({ levelId: row.levelId, quota: quotas[row.levelId] ?? "" })),
		})
	}

	return (
		<>
			{/* `.row.justify-content-center > .col-xl-5 + .col-xl-7` (both `col-lg-*` too) */}
			<div className="mx-[-15px] flex flex-wrap justify-center">
				<div className="w-full min-w-0 px-[15px] min-[992px]:max-w-[41.666667%] min-[992px]:flex-[0_0_41.666667%]">
					<AcademicYearForm
						mode={mode}
						values={values}
						onChange={change}
						periodNonce={periodNonce}
						onPeriodChange={onPeriodChange}
						onSimpan={() => setConfirming(true)}
						submitting={submitting}
					/>
				</div>
				<div className="w-full min-w-0 px-[15px] min-[992px]:max-w-[58.333333%] min-[992px]:flex-[0_0_58.333333%]">
					<AcademicYearQuotaCard
						rows={quotaRows}
						quotas={quotas}
						onQuotaChange={(levelId, quota) => setQuotas((current) => ({ ...current, [levelId]: quota }))}
						// The create blade says "Silakan tambahakan … jenjang."; the edit blade rewords it
						intro={
							mode === "create"
								? "Silakan tambahakan kuota pada masing-masing jenjang."
								: "Silahkan tambahkan kuota pada masing-masing jenjang"
						}
						processing={quotaProcessing}
						loaded={quotaLoaded}
					/>
				</div>
			</div>

			<AcademicYearConfirmModal
				open={confirming}
				psbOpen={values.status}
				isCurrent={values.isCurrent}
				onCancel={() => setConfirming(false)}
				onConfirm={submit}
			/>
		</>
	)
}

export default AcademicYearEditor
