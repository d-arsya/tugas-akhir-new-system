import { useState, type JSX } from "react"

import type { MajorPayload } from "@roja/types"

import LegacyButton, { legacyButtonClass } from "@/components/legacy/legacy-button"
import LegacyCard, { LegacyCardText, LegacyCardTitle } from "@/components/legacy/legacy-card"
import LegacyInput from "@/components/legacy/legacy-input"
import LegacySelect from "@/components/legacy/legacy-select"
import LegacyTextarea from "@/components/legacy/legacy-textarea"
import AcademicField from "@/components/academic/academic-field"
import { levelSelectOptions, numberOrBlank } from "@/components/academic/academic-inputs"
import { useLegacySubmit } from "@/hooks/use-legacy-submit"
import { useCreateMajor } from "@/hooks/use-majors"
import { useLevelOptions } from "@/hooks/use-level-options"

// Left card of `major/index.blade.php` (`col-xl-4 col-lg-4 col-md-12 col-sm-12 col-12`)
const MajorForm = (): JSX.Element => {
	// `MajorController@index` → `Level::get()`, i.e. insertion order
	const { data: levels } = useLevelOptions("id-asc")
	const [name, setName] = useState("")
	const [levelId, setLevelId] = useState("")
	const [desc, setDesc] = useState("")
	const createMajor = useCreateMajor()

	// `default-ajax.js` on `#main-form`: PNotify, then `window.location.reload()` 1000 ms later
	const save = useLegacySubmit({
		mutationFn: (payload: MajorPayload) => createMajor.mutateAsync(payload),
		onDone: () => {
			setName("")
			setLevelId("")
			setDesc("")
		},
	})

	return (
		// `.card.tbr_card.mb-3.mb-lg-0 > .card-body.p-4`
		<LegacyCard className="mb-[16px] min-[992px]:mb-0">
			<LegacyCardTitle>Tambah jurusan baru</LegacyCardTitle>
			<LegacyCardText>Silakan tambahkan jurusan baru pada form di bawah ini.</LegacyCardText>

			<form
				id="main-form"
				noValidate
				onSubmit={(event) => {
					event.preventDefault()
					save.submit({ name, levelId: numberOrBlank(levelId), desc })
				}}
			>
				<AcademicField label="Nama" htmlFor="name" hint="required">
					<LegacyInput
						id="name"
						name="name"
						type="text"
						autoComplete="off"
						spellCheck={false}
						value={name}
						onChange={(event) => setName(event.target.value)}
					/>
				</AcademicField>

				<AcademicField label="Jenjang" htmlFor="level" hint="required">
					<LegacySelect
						value={levelId}
						options={levelSelectOptions(levels, "Pilih Jenjang")}
						mutedText={levelId === ""}
						onChange={setLevelId}
					/>
				</AcademicField>

				<AcademicField label="Keterangan" htmlFor="desc" hint="optional">
					<LegacyTextarea
						id="desc"
						name="desc"
						rows={3}
						noResize
						spellCheck={false}
						value={desc}
						onChange={(event) => setDesc(event.target.value)}
					/>
				</AcademicField>

				<div className="pt-[16px] text-right">
					{/* Legacy's `<a href="">` reloads the current page rather than going anywhere */}
					<button
						type="button"
						onClick={() => window.location.reload()}
						className={legacyButtonClass("light", "mr-[8px]")}
					>
						Kembali
					</button>{" "}
					<LegacyButton type="submit" variant="primary" loading={save.submitting}>
						Simpan
					</LegacyButton>
				</div>
			</form>
		</LegacyCard>
	)
}

export default MajorForm
