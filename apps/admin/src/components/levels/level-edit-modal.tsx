import { useEffect, useState, type JSX } from "react"

import type { LevelPayload } from "@roja/types"

import LegacyButton from "@/components/legacy/legacy-button"
import LegacyInput from "@/components/legacy/legacy-input"
import LegacyModal from "@/components/legacy/legacy-modal"
import LegacyRadioGroup from "@/components/legacy/legacy-radio-group"
import { useLegacySubmit } from "@/hooks/use-legacy-submit"
import { useLevel, useUpdateLevel } from "@/hooks/use-levels"

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

	useEffect(() => {
		setName(data?.name ?? "")
		setStatus(data?.status ?? "")
	}, [data])

	const submit = useLegacySubmit({
		mutationFn: (payload: LevelPayload) => update.mutateAsync(payload),
		errorTitle: "Gagal!",
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
				<div className="mb-[24px]">
					<label htmlFor="name_edit" className="m-0 flex leading-[20px] min-[992px]:text-right">
						Nama Jenjang
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
