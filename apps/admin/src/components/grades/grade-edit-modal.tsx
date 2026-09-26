import { useEffect, useState, type JSX } from "react"

import type { GradePayload } from "@roja/types"

import LegacyInput from "@/components/legacy/legacy-input"
import LegacySelect from "@/components/legacy/legacy-select"
import AcademicEditModal from "@/components/academic/academic-edit-modal"
import AcademicField from "@/components/academic/academic-field"
import { levelSelectOptions, numberOrBlank } from "@/components/academic/academic-inputs"
import { useGrade, useUpdateGrade } from "@/hooks/use-grades"
import { useLegacySubmit } from "@/hooks/use-legacy-submit"
import { useLevelOptions } from "@/hooks/use-level-options"
import { digitsOnly } from "@/lib/digits-only"

type GradeEditModalProps = { gradeId: number | null; onClose: () => void }

type GradeFormState = { id: number; levelId: string; label: string }

const GradeEditModal = ({ gradeId, onClose }: GradeEditModalProps): JSX.Element => {
	const detail = useGrade(gradeId)
	const { data: levels } = useLevelOptions("id-desc")
	const [form, setForm] = useState<GradeFormState | null>(null)
	const updateGrade = useUpdateGrade()

	const save = useLegacySubmit({
		mutationFn: (payload: { id: number; payload: GradePayload }) => updateGrade.mutateAsync(payload),
		onDone: onClose,
	})

	useEffect(() => {
		if (gradeId !== null) setForm(null)
	}, [gradeId])

	useEffect(() => {
		const data = detail.data
		if (!data) return
		setForm({ id: data.id, levelId: String(data.levelId ?? ""), label: data.label === null ? "" : String(data.label) })
	}, [detail.data])

	const loading = gradeId !== null && form?.id !== gradeId
	const set = <K extends keyof GradeFormState>(key: K, value: GradeFormState[K]): void =>
		setForm((current) => (current === null ? current : { ...current, [key]: value }))

	return (
		<AcademicEditModal
			open={gradeId !== null}
			loading={loading}
			title="Edit kelas"
			submitting={save.submitting}
			onCancel={onClose}
			onSubmit={() => {
				if (!form) return
				save.submit({
					id: form.id,
					payload: { levelId: numberOrBlank(form.levelId), label: numberOrBlank(form.label) },
				})
			}}
		>
			<AcademicField label="Jenjang" htmlFor="edit-level-id" hint="required">
				<LegacySelect
					value={form?.levelId ?? ""}
					options={levelSelectOptions(levels, "Select")}
					mutedText={(form?.levelId ?? "") === ""}
					onChange={(value) => set("levelId", value)}
				/>
			</AcademicField>

			<AcademicField label="Label Kelas" htmlFor="edit-label" hint="required" className="mb-[4px]">
				<LegacyInput
					id="edit-label"
					name="label"
					type="number"
					autoComplete="off"
					spellCheck={false}
					value={form?.label ?? ""}
					onKeyDown={digitsOnly}
					onChange={(event) => set("label", event.target.value)}
				/>
			</AcademicField>
		</AcademicEditModal>
	)
}

export default GradeEditModal
