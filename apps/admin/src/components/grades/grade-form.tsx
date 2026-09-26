import { useState, type JSX } from "react"

import type { GradePayload } from "@roja/types"

import LegacyIconButton from "@/components/legacy/legacy-icon-button"
import { SaveIcon } from "@/components/legacy/legacy-icons"
import LegacyInput from "@/components/legacy/legacy-input"
import LegacySelect from "@/components/legacy/legacy-select"
import { levelSelectOptions, numberOrBlank } from "@/components/academic/academic-inputs"
import { useCreateGrade } from "@/hooks/use-grades"
import { useLegacySubmit } from "@/hooks/use-legacy-submit"
import { useLevelOptions } from "@/hooks/use-level-options"
import { digitsOnly } from "@/lib/digits-only"

const CELL_CLASS =
	"w-full min-w-0 px-[15px] max-w-full flex-[0_0_100%] min-[576px]:max-w-[50%] min-[576px]:flex-[0_0_50%] min-[992px]:max-w-full min-[992px]:flex-[0_0_100%] min-[1200px]:max-w-[50%] min-[1200px]:flex-[0_0_50%]"

const GradeForm = (): JSX.Element => {
	const { data: levels } = useLevelOptions("id-desc")
	const [levelId, setLevelId] = useState("")
	const [label, setLabel] = useState("")
	const createGrade = useCreateGrade()

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
			<div className="flex items-center justify-start">
				<div>
					<div className="mx-[-15px] flex flex-wrap">
						<div className={CELL_CLASS}>
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
									onKeyDown={digitsOnly}
									onChange={(event) => setLabel(event.target.value)}
								/>
							</div>
						</div>
					</div>
				</div>

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
