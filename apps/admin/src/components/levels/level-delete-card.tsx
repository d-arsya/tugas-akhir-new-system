import { useEffect, useMemo, useState, type JSX } from "react"
import { useNavigate } from "@tanstack/react-router"

import type { LevelDelegatePayload } from "@roja/types"

import LegacyDeletePage from "@/components/legacy/legacy-delete-page"
import LegacySelect from "@/components/legacy/legacy-select"
import { useLevelDeleteStep, type LevelDelegateStep } from "@/hooks/use-levels"
import type { LegacyDeletePageSubmit } from "@/hooks/use-legacy-delete-page"

/**
 * The body all five `level/delete/*.blade.php` pages share. The plain confirm has no picker;
 * the four delegate pages each carry a `<select name="level_id" data-plugin-selectTwo>` of every
 * *other* level, the two-copy grey helper text, and the same warning paragraph.
 */
type LevelDeleteCardProps =
	| { levelId: number; step: "delete"; submit: LegacyDeletePageSubmit<void> }
	| {
			levelId: number
			step: LevelDelegateStep
			/** Verbatim, including the space before the colon. */
			heading: string
			/** "jurusan", "kelas", "PSB", "santri" — the noun in the second helper line. */
			noun: string
			submit: LegacyDeletePageSubmit<LevelDelegatePayload>
	  }

const BACK_TO = "/levels"
const PLACEHOLDER = { value: "", label: "Select" }

const LevelDeleteCard = (props: LevelDeleteCardProps): JSX.Element | null => {
	const navigate = useNavigate()
	const { data } = useLevelDeleteStep(props.levelId, props.step)
	const [destination, setDestination] = useState("")

	// The destroy icon picked this page when the list rendered; if the children moved since, the
	// server names the step that does apply and we walk there instead of showing a stale form.
	useEffect(() => {
		if (data?.redirect) void navigate({ to: data.redirect, replace: true })
	}, [data?.redirect, navigate])

	const options = useMemo(
		() => [PLACEHOLDER, ...(data?.levels ?? []).map((level) => ({ value: String(level.id), label: level.name ?? "" }))],
		[data?.levels],
	)

	if (!data || data.redirect) return null

	const name = data.name ?? ""

	if (props.step === "delete") {
		return (
			<LegacyDeletePage
				backTo={BACK_TO}
				// B-3: legacy printed `$level->year`, which Level does not have, so the red span was blank
				heading={
					<>
						Yakinkah menghapus jenjang <span className="text-[var(--danger)]">{name}</span>?
					</>
				}
				description="Data akan dihapus dari database secara permanen. Anda tidak akan bisa mengembalikannya lagi."
				loading={props.submit.submitting}
				onConfirm={() => props.submit.submit()}
			/>
		)
	}

	return (
		<LegacyDeletePage
			backTo={BACK_TO}
			heading={props.heading}
			helperLines={["Tidak tersedia? Buat jenjang terlebih dahulu.", `Atau hapus data ${props.noun} ke menu terkait.`]}
			description={
				<>
					Jenjang <span className="font-bold text-[var(--danger)]">{name}</span> akan dihapus secara permanen.
					Anda tidak akan bisa mengembalikannya lagi.
				</>
			}
			loading={props.submit.submitting}
			// Legacy submits with nothing selected and lets the validator answer
			// "Kolom jenjang wajib untuk dipilih."; `Number("")` is 0, which no level has.
			onConfirm={() => props.submit.submit({ levelId: Number(destination) })}
		>
			<LegacySelect
				value={destination}
				options={options}
				onChange={setDestination}
				mutedText={destination === ""}
			/>
		</LegacyDeletePage>
	)
}

export default LevelDeleteCard
