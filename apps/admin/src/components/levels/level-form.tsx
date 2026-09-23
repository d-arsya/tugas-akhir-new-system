import { useState, type JSX } from "react"
import { Link } from "@tanstack/react-router"

import type { LevelPayload } from "@roja/types"

import LegacyButton, { legacyButtonClass } from "@/components/legacy/legacy-button"
import LegacyCard, { LegacyCardText, LegacyCardTitle } from "@/components/legacy/legacy-card"
import { InfoCircleIcon } from "@/components/legacy/legacy-icons"
import LegacyInput from "@/components/legacy/legacy-input"
import LegacyRadioGroup from "@/components/legacy/legacy-radio-group"
import LegacyTooltip from "@/components/legacy/legacy-tooltip"
import { useLegacySubmit } from "@/hooks/use-legacy-submit"
import { useCreateLevel } from "@/hooks/use-levels"

// `level/index.blade.php` left card + `default-ajax2.js` (`specificForm`), which reloads the
// page 1000 ms after the success notice — here: the list refetches and the form clears.
const OPTIONS = [
	{ value: "show", label: "Ditampilkan", id: "show" },
	{ value: "hide", label: "Tidak ditampilkan", id: "hide" },
]

const LevelForm = (): JSX.Element => {
	const [name, setName] = useState("")
	const [status, setStatus] = useState("")
	const create = useCreateLevel()

	const submit = useLegacySubmit({
		mutationFn: (payload: LevelPayload) => create.mutateAsync(payload),
		// `default-ajax2.js` titles the failure notice "<strong>Gagal!</strong>"
		errorTitle: "Gagal!",
		onDone: () => {
			setName("")
			setStatus("")
		},
	})

	return (
		<LegacyCard className="mb-[16px] min-[992px]:mb-0">
			<LegacyCardTitle>Tambah jenjang</LegacyCardTitle>
			<LegacyCardText>Silakan tambahkan jenjang baru pada form di bawah ini.</LegacyCardText>

			<form
				onSubmit={(event) => {
					event.preventDefault()
					// Legacy posts the form as it stands; the validator answers the blank fields
					submit.submit({ name, status: status as LevelPayload["status"] })
				}}
			>
				{/* `.form-group.mb-3` — no label, the placeholder is the only cue */}
				<div className="mb-[16px]">
					<LegacyInput
						id="name"
						name="name"
						placeholder="Nama Jenjang"
						autoComplete="off"
						spellCheck={false}
						value={name}
						onChange={(event) => setName(event.target.value)}
					/>
				</div>

				<div className="mb-[16px]">
					<label className="mb-[16px] block font-semibold">
						<span className="flex flex-wrap items-center">
							<span className="mr-[8px]">PSB (Pendaftaran Santri Baru)</span>
							<LegacyTooltip content="Silakan pilih ingin ditampilkan pada halaman PSB atau tidak.">
								<InfoCircleIcon />
							</LegacyTooltip>
						</span>
					</label>
					{/* Stacked here; the edit modal renders the same two radios inline */}
					<LegacyRadioGroup name="status" value={status} options={OPTIONS} onChange={setStatus} />
				</div>

				{/* `.text-right.pt-3` */}
				<div className="pt-[16px] text-right">
					<Link to="/levels" className={legacyButtonClass("light", "mr-[8px]")}>
						Kembali
					</Link>{" "}
					<LegacyButton type="submit" variant="primary" loading={submit.submitting}>
						Simpan
					</LegacyButton>
				</div>
			</form>
		</LegacyCard>
	)
}

export default LevelForm
