import { useState, type JSX } from "react"

import type { GradePayload } from "@roja/types"

import LegacyIconButton from "@/components/legacy/legacy-icon-button"
import { SaveIcon } from "@/components/legacy/legacy-icons"
import LegacyInput from "@/components/legacy/legacy-input"
import LegacySelect from "@/components/legacy/legacy-select"
import { blockNonDigits, levelSelectOptions, numberOrBlank } from "@/components/academic/academic-inputs"
import { useCreateGrade } from "@/hooks/use-grades"
import { useLegacySubmit } from "@/hooks/use-legacy-submit"
import { useLevelOptions } from "@/hooks/use-level-options"

// `.col-xl-6.col-lg-12.col-md-6.col-sm-6.col-12` — the two halves stack again at lg
const CELL_CLASS =
	"w-full min-w-0 px-[15px] max-w-full flex-[0_0_100%] min-[576px]:max-w-[50%] min-[576px]:flex-[0_0_50%] min-[992px]:max-w-full min-[992px]:flex-[0_0_100%] min-[1200px]:max-w-[50%] min-[1200px]:flex-[0_0_50%]"

/**
 * `grade/partials/grade.blade.php` — the add form of the Kelas card.
 *
 * Neither control carries a label: the select placeholder and the `0` placeholder are the only
 * hints, and the submit button holds nothing but a pink floppy SVG.
 */
const GradeForm = (): JSX.Element => {
	// `GradeController@index` → `Level::latest()->get()`, i.e. newest first
	const { data: levels } = useLevelOptions("id-desc")
	const [levelId, setLevelId] = useState("")
	const [label, setLabel] = useState("")
	const createGrade = useCreateGrade()

	// `specificForm()` on `.tbr-grade-form`: PNotify, then a full reload 1000 ms later
	const save = useLegacySubmit({
		mutationFn: (payload: GradePayload) => createGrade.mutateAsync(payload),
		onDone: () => {
			setLevelId("")
			setLabel("")
		},
	})

	return (
		<form
			noValidate
			onSubmit={(event) => {
				event.preventDefault()
				save.submit({ levelId: numberOrBlank(levelId), label: numberOrBlank(label) })
			}}
		>
			{/* `.d-flex.align-items-center.justify-content-start` */}
			<div className="flex items-center justify-start">
				{/*
				  `.tbr_form_wrap` carries no CSS at all: it is a plain block flex item, so it
				  shrinks to fit and the two 50% columns end up as wide as the number box's
				  intrinsic width — the save button sits right after it, not at the card's edge.
				*/}
				<div>
					<div className="mx-[-15px] flex flex-wrap">
						<div className={CELL_CLASS}>
							{/* `.form-group.mb-2` */}
							<div className="mb-[8px]">
								<LegacySelect
									value={levelId}
									options={levelSelectOptions(levels, "Pilih Jenjang")}
									mutedText={levelId === ""}
									onChange={setLevelId}
								/>
							</div>
						</div>
						<div className={CELL_CLASS}>
							<div className="mb-[8px]">
								<LegacyInput
									id="label"
									name="label"
									type="number"
									min={1}
									placeholder="0"
									autoComplete="off"
									spellCheck={false}
									value={label}
									onKeyDown={blockNonDigits}
									onChange={(event) => setLabel(event.target.value)}
								/>
							</div>
						</div>
					</div>
				</div>

				{/*
				  `.btn.tbr_btn.tbr_btn-light-primary.d-inline-flex.p-2.mb-2.tbr_btn_grade` — icon
				  only, no text. `.tbr_btn_grade` (app.css 2387-2392) pins it to 40px and pushes
				  it 30px clear of the form wrap.
				*/}
				<LegacyIconButton
					type="submit"
					variant="light-primary"
					ariaLabel="Simpan kelas"
					icon={<SaveIcon />}
					loading={save.submitting}
					className="mb-[8px] ml-[30px] w-[40px] max-w-[40px] min-w-[40px] shrink-0"
				/>
			</div>
		</form>
	)
}

export default GradeForm
