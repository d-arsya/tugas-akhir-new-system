import { useEffect, useState, type JSX } from "react"

import type { AcademicYearPayload, AcademicYearQuotaRow } from "@roja/types"

import AcademicYearConfirmModal from "./academic-year-confirm-modal"
import AcademicYearForm from "./academic-year-form"
import type { AcademicYearFormValues } from "./academic-year-form-values"
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

// Deliberately 365 days, not one calendar year.
const plus365 = (start: string): string => {
	const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(start.trim())
	if (!match) return ""
	const date = new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1]))
	date.setDate(date.getDate() + 365)
	return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`
}

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

	useEffect(() => {
		setQuotas(Object.fromEntries(quotaRows.map((row) => [row.levelId, row.quota === null ? "" : String(row.quota)])))
	}, [quotaRows])

	const change = (patch: Partial<AcademicYearFormValues>): void =>
		setValues((current) => {
			const next = { ...current, ...patch }
			if (patch.startYear !== undefined && mode === "create") {
				const parsed = Number.parseInt(patch.startYear, 10)
				next.endYear = Number.isNaN(parsed) ? "" : String(parsed + 1)
			}
			return next
		})

	const onPeriodChange = (from: string): void => {
		// An unchanged start means the derived end date was edited: remount the range to discard it.
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
			quotas: quotaRows.map((row) => ({ levelId: row.levelId, quota: quotas[row.levelId] ?? "" })),
		})
	}

	return (
		<>
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
