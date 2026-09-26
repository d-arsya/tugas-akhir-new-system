import { useEffect, useState, type JSX } from "react"

import type { AccountancyGroup, AccountancyPayload } from "@roja/types"

import LegacyButton from "@/components/legacy/legacy-button"
import LegacyInput from "@/components/legacy/legacy-input"
import LegacyModal from "@/components/legacy/legacy-modal"
import LegacyTextarea from "@/components/legacy/legacy-textarea"
import { useLegacySubmit } from "@/hooks/use-legacy-submit"
import { useAccountancy, useAccountancyOptions, useUpdateAccountancy } from "@/hooks/use-accountancy"

import AccountancyChildFields from "./accountancy-child-fields"
import AccountancyFieldLabel from "./accountancy-field-label"

type AccountancyEditModalProps = {
	accountancyId: number | null
	onClose: () => void
}

const AccountancyEditModal = ({ accountancyId, onClose }: AccountancyEditModalProps): JSX.Element => {
	const id = accountancyId ?? 0
	const { data } = useAccountancy(accountancyId === null ? Number.NaN : id)
	const { data: options } = useAccountancyOptions()
	const update = useUpdateAccountancy(id)

	const [name, setName] = useState("")
	const [parentId, setParentId] = useState("")
	const [group, setGroup] = useState<AccountancyGroup | "">("")
	const [isStudentCost, setIsStudentCost] = useState(false)
	const [note, setNote] = useState("")

	useEffect(() => {
		setName(data?.name ?? "")
		setParentId(data?.parentId === undefined || data.parentId === null ? "" : String(data.parentId))
		setGroup(data?.group ?? "")
		setIsStudentCost(data?.isStudentCost ?? false)
		setNote(data?.note ?? "")
	}, [data])

	const submit = useLegacySubmit({
		mutationFn: (payload: AccountancyPayload) => update.mutateAsync(payload),
		errorTitle: "Gagal!",
		onDone: onClose,
	})

	const child = data?.parentId !== null && data?.parentId !== undefined

	const save = (): void => {
		if (!data) return
		submit.submit({
			name,
			isParent: data.isParent,
			parentId: child && parentId !== "" ? Number(parentId) : null,
			group: child && group !== "" ? group : null,
			isStudentCost: child ? isStudentCost : data.isStudentCost,
			note,
		})
	}

	return (
		<LegacyModal
			open={accountancyId !== null}
			onClose={onClose}
			size="sm"
			title="Edit akun"
			icon={<span>{data?.isParent ? "Induk akun" : "Anak akun"}</span>}
			footer={
				<div className="text-right">
					<LegacyButton variant="light" className="mr-[8px]" onClick={onClose}>
						Batal
					</LegacyButton>{" "}
					<LegacyButton variant="primary" loading={submit.submitting} onClick={save}>
						Simpan
					</LegacyButton>
				</div>
			}
		>
			<form
				onSubmit={(event) => {
					event.preventDefault()
					save()
				}}
			>
				<div className="mb-[16px]">
					<AccountancyFieldLabel htmlFor="edit_name" badge="required" tight>
						Nama
					</AccountancyFieldLabel>
					<LegacyInput
						id="edit_name"
						name="name"
						autoComplete="off"
						spellCheck={false}
						value={name}
						onChange={(event) => setName(event.target.value)}
					/>
				</div>

				{child ? (
					<AccountancyChildFields
						options={options ?? []}
						parentId={parentId}
						onParentIdChange={setParentId}
						group={group}
						onGroupChange={setGroup}
						isStudentCost={isStudentCost}
						onIsStudentCostChange={setIsStudentCost}
						idSuffix="_edit"
						tightLabels
						innerPadding="p-[8px]"
					/>
				) : null}

				<div>
					<AccountancyFieldLabel htmlFor="edit_note" badge="optional" tight>
						Keterangan
					</AccountancyFieldLabel>
					<LegacyTextarea
						id="edit_note"
						name="note"
						autoComplete="off"
						spellCheck={false}
						value={note}
						onChange={(event) => setNote(event.target.value)}
					/>
				</div>
			</form>
		</LegacyModal>
	)
}

export default AccountancyEditModal
