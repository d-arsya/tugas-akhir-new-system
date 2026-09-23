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

/**
 * `accountancy/edit.blade.php`, fetched per row by `assets/js/account/edit-data.js` and opened
 * with magnific-popup (`modal-block-sm`, so 400px).
 *
 * Two details from the blade:
 *  - the `#childData` block renders `@if ($accountancy->parent_id != NULL)`, i.e. it keys off the
 *    parent, while the header badge keys off `is_parent`. Both are reproduced as written.
 *  - the parent select here has **no** blank "Select" option, unlike the create form's.
 *
 * `is_parent` is never submitted from this modal; the port's payload type carries it, so the
 * account's own value is sent back unchanged.
 */
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

	// Legacy renders the partial server-side with the row's values already in it
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
		// `default-ajax2.js` reloads the page 1000 ms later; here the tree refetches and we close
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
			// `<header class="card-header">` carries the title and this badge side by side
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
				{/* `.form-group.mb-3` — the label carries `m-0` in this blade, unlike the create form */}
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
						// `.card-body.p-2` on the inner `is_student_cost` card here, `.p-3` on the create form
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
