import { useEffect, useState, type JSX } from "react"

import type { LevelPayload } from "@roja/types"

import LegacyButton from "@/components/legacy/legacy-button"
import LegacyInput from "@/components/legacy/legacy-input"
import LegacyModal from "@/components/legacy/legacy-modal"
import LegacyRadioGroup from "@/components/legacy/legacy-radio-group"
import { useLegacySubmit } from "@/hooks/use-legacy-submit"
import { useLevel, useUpdateLevel } from "@/hooks/use-levels"

/**
 * `level/edit-level.blade.php`, fetched per row by `edit-data-default.js` and opened with
 * magnific-popup. Title is "Edit keterangan", the radios are inline (they are stacked on the
 * create form) and the helper sentence is a `<p>` inside the label rather than a tooltip.
 */
type LevelEditModalProps = {
	levelId: number | null
	onClose: () => void
}

const OPTIONS = [
	{ value: "show", label: "Ditampilkan", id: "show_edit" },
	{ value: "hide", label: "Tidak ditampilkan", id: "hide_edit" },
]

const LevelEditModal = ({ levelId, onClose }: LevelEditModalProps): JSX.Element => {
	const id = levelId ?? 0
	const { data } = useLevel(levelId === null ? Number.NaN : id)
	const [name, setName] = useState("")
	const [status, setStatus] = useState("")
	const update = useUpdateLevel(id)

	// Legacy renders the partial server-side with the row's values already in it
	useEffect(() => {
		setName(data?.name ?? "")
		setStatus(data?.status ?? "")
	}, [data])

	const submit = useLegacySubmit({
		mutationFn: (payload: LevelPayload) => update.mutateAsync(payload),
		errorTitle: "Gagal!",
		// `default-ajax2.js` reloads the page 1000 ms later; here the list refetches and we close
		onDone: onClose,
	})

	const save = (): void => submit.submit({ name, status: status as LevelPayload["status"] })

	return (
		<LegacyModal
			open={levelId !== null}
			onClose={onClose}
			size="sm"
			title="Edit keterangan"
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
				{/* `.form-group.mb-4` — label and its grey "required" help block on one line */}
				<div className="mb-[24px]">
					<label htmlFor="name_edit" className="m-0 flex leading-[20px] min-[992px]:text-right">
						Nama Jenjang
						{/* `margin: 0 0 4px 0` (form.css 14) is load-bearing: the label is `d-flex`, so the
					    badge's margin box sets the row height — 24px, not 20px. Without it every
					    control below sits 4px high. */}
					<span className="mb-[4px] ml-[8px] text-[11px] leading-[20px] font-normal text-[var(--grey)] opacity-80">
							required
						</span>
					</label>
					<LegacyInput
						id="name_edit"
						name="name"
						autoComplete="off"
						spellCheck={false}
						value={name}
						onChange={(event) => setName(event.target.value)}
					/>
				</div>

				<div className="mb-[4px]">
					<label>
						<span className="font-semibold">PSB (Pendaftaran Santri Baru)</span>
						<p className="mt-0 mb-[8px] leading-[24px] text-[var(--grey)]">
							Silakan pilih ingin ditampilkan pada halaman PSB atau tidak.
						</p>
					</label>
					{/* `level/edit-level.blade.php` 34,45: bare `.custom-control-inline` siblings in a block
					    container — margin-top 0, and the newline between them renders as 3.73px */}
					<LegacyRadioGroup
						name="status_edit"
						value={status}
						options={OPTIONS}
						onChange={setStatus}
						inline
						className="block"
						itemClassName="mt-0"
					/>
				</div>
			</form>
		</LegacyModal>
	)
}

export default LevelEditModal
