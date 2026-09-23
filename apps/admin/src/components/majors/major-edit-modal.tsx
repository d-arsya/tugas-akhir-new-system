import { useEffect, useState, type JSX } from "react"

import type { MajorPayload } from "@roja/types"

import LegacyInput from "@/components/legacy/legacy-input"
import LegacySelect from "@/components/legacy/legacy-select"
import LegacyTextarea from "@/components/legacy/legacy-textarea"
import AcademicEditModal from "@/components/academic/academic-edit-modal"
import AcademicField from "@/components/academic/academic-field"
import { levelSelectOptions, numberOrBlank } from "@/components/academic/academic-inputs"
import { useLegacySubmit } from "@/hooks/use-legacy-submit"
import { useLevelOptions } from "@/hooks/use-level-options"
import { useMajor, useUpdateMajor } from "@/hooks/use-majors"

type MajorEditModalProps = { majorId: number | null; onClose: () => void }

type MajorFormState = { id: number; name: string; levelId: string; desc: string }

// `major/edit.blade.php`, fetched over AJAX by `editData(event, '#edit-modal-mojor', url, id)`
const MajorEditModal = ({ majorId, onClose }: MajorEditModalProps): JSX.Element => {
	const detail = useMajor(majorId)
	const { data: levels } = useLevelOptions("id-asc")
	const [form, setForm] = useState<MajorFormState | null>(null)
	const updateMajor = useUpdateMajor()

	// `specificForm()` on `.tbr-edit-form`: PNotify, then a full reload 1000 ms later
	const save = useLegacySubmit({
		mutationFn: (payload: { id: number; payload: MajorPayload }) => updateMajor.mutateAsync(payload),
		onDone: onClose,
	})

	// Every open starts from the placeholder card, exactly as `editData()` does
	useEffect(() => {
		if (majorId !== null) setForm(null)
	}, [majorId])

	useEffect(() => {
		const data = detail.data
		if (!data) return
		setForm({ id: data.id, name: data.name ?? "", levelId: String(data.levelId ?? ""), desc: data.desc ?? "" })
	}, [detail.data])

	const loading = majorId !== null && form?.id !== majorId
	const set = <K extends keyof MajorFormState>(key: K, value: MajorFormState[K]): void =>
		setForm((current) => (current === null ? current : { ...current, [key]: value }))

	return (
		<AcademicEditModal
			open={majorId !== null}
			loading={loading}
			title="Edit jurusan"
			submitting={save.submitting}
			onCancel={onClose}
			onSubmit={() => {
				if (!form) return
				save.submit({
					id: form.id,
					payload: { name: form.name, levelId: numberOrBlank(form.levelId), desc: form.desc },
				})
			}}
		>
			<AcademicField label="Nama" htmlFor="name" hint="required">
				<LegacyInput
					id="name"
					name="name"
					type="text"
					autoComplete="off"
					spellCheck={false}
					value={form?.name ?? ""}
					onChange={(event) => set("name", event.target.value)}
				/>
			</AcademicField>

			<AcademicField label="Jenjang" htmlFor="editLevel" hint="required">
				{/* The edit modal's placeholder reads "Select", not the form's "Pilih Jenjang" */}
				<LegacySelect
					value={form?.levelId ?? ""}
					options={levelSelectOptions(levels, "Select")}
					mutedText={(form?.levelId ?? "") === ""}
					onChange={(value) => set("levelId", value)}
				/>
			</AcademicField>

			{/* `.form-group.mb-1` — the last field tightens its bottom margin */}
			<AcademicField label="Keterangan" htmlFor="desc" hint="optional" className="mb-[4px]">
				<LegacyTextarea
					id="desc"
					name="desc"
					rows={3}
					noResize
					spellCheck={false}
					value={form?.desc ?? ""}
					onChange={(event) => set("desc", event.target.value)}
				/>
			</AcademicField>
		</AcademicEditModal>
	)
}

export default MajorEditModal
