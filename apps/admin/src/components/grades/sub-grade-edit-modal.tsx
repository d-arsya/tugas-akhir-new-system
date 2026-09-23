import { useEffect, useState, type JSX } from "react"

import type { SubGradePayload } from "@roja/types"

import LegacyInput from "@/components/legacy/legacy-input"
import AcademicEditModal from "@/components/academic/academic-edit-modal"
import AcademicField from "@/components/academic/academic-field"
import { useLegacySubmit } from "@/hooks/use-legacy-submit"
import { useSubGrade, useUpdateSubGrade } from "@/hooks/use-sub-grades"

type SubGradeEditModalProps = { subGradeId: number | null; onClose: () => void }

type SubGradeFormState = { id: number; label: string }

/**
 * `grade/sub-grade-edit.blade.php`. Legacy never includes this blade in the page, so the
 * fetched markup lands in the *grade* modal container (`GradeService` hard-codes
 * `'#edit-modal-grade'` for sub-grades too); the port simply gives it its own modal.
 *
 * The title capitalises differently from the other two: "Edit Subkelas", label "Label Subkelas".
 */
const SubGradeEditModal = ({ subGradeId, onClose }: SubGradeEditModalProps): JSX.Element => {
	const detail = useSubGrade(subGradeId)
	const [form, setForm] = useState<SubGradeFormState | null>(null)
	const updateSubGrade = useUpdateSubGrade()

	const save = useLegacySubmit({
		mutationFn: (payload: { id: number; payload: SubGradePayload }) => updateSubGrade.mutateAsync(payload),
		onDone: onClose,
	})

	// Every open starts from the placeholder card, exactly as `editData()` does
	useEffect(() => {
		if (subGradeId !== null) setForm(null)
	}, [subGradeId])

	useEffect(() => {
		const data = detail.data
		if (!data) return
		setForm({ id: data.id, label: data.label ?? "" })
	}, [detail.data])

	const loading = subGradeId !== null && form?.id !== subGradeId

	return (
		<AcademicEditModal
			open={subGradeId !== null}
			loading={loading}
			title="Edit Subkelas"
			submitting={save.submitting}
			onCancel={onClose}
			onSubmit={() => {
				if (!form) return
				save.submit({ id: form.id, payload: { label: form.label } })
			}}
		>
			{/* `.form-group.mb-1` — the only field, with a tightened bottom margin */}
			<AcademicField label="Label Subkelas" htmlFor="sub-grade" hint="required" className="mb-[4px]">
				<LegacyInput
					id="label"
					name="label"
					type="text"
					autoComplete="off"
					spellCheck={false}
					value={form?.label ?? ""}
					onChange={(event) =>
						setForm((current) => (current === null ? current : { ...current, label: event.target.value }))
					}
				/>
			</AcademicField>
		</AcademicEditModal>
	)
}

export default SubGradeEditModal
