import { useState, type JSX } from "react"

import type { SubGradePayload } from "@roja/types"

import LegacyIconButton from "@/components/legacy/legacy-icon-button"
import { SaveIcon } from "@/components/legacy/legacy-icons"
import LegacyInput from "@/components/legacy/legacy-input"
import { useLegacySubmit } from "@/hooks/use-legacy-submit"
import { useCreateSubGrade } from "@/hooks/use-sub-grades"

// `.col-xl-6.col-lg-9.col-md-6.col-sm-6.col-8`
const INPUT_CELL_CLASS =
	"w-full min-w-0 px-[15px] max-w-[66.666667%] flex-[0_0_66.666667%] min-[576px]:max-w-[50%] min-[576px]:flex-[0_0_50%] min-[992px]:max-w-[75%] min-[992px]:flex-[0_0_75%] min-[1200px]:max-w-[50%] min-[1200px]:flex-[0_0_50%]"

// `.col-xl-6.col-lg-3.col-md-6.col-sm-6.col-4`
const BUTTON_CELL_CLASS =
	"w-full min-w-0 px-[15px] max-w-[33.333333%] flex-[0_0_33.333333%] min-[576px]:max-w-[50%] min-[576px]:flex-[0_0_50%] min-[992px]:max-w-[25%] min-[992px]:flex-[0_0_25%] min-[1200px]:max-w-[50%] min-[1200px]:flex-[0_0_50%]"

/** `grade/partials/subgrade.blade.php` — one unlabelled text box and the icon-only save button. */
const SubGradeForm = (): JSX.Element => {
	const [label, setLabel] = useState("")
	const createSubGrade = useCreateSubGrade()

	// `specificForm()` on `.tbr-sub-grade-form`: PNotify, then a full reload 1000 ms later
	const save = useLegacySubmit({
		mutationFn: (payload: SubGradePayload) => createSubGrade.mutateAsync(payload),
		onDone: () => setLabel(""),
	})

	return (
		<form
			noValidate
			onSubmit={(event) => {
				event.preventDefault()
				save.submit({ label })
			}}
		>
			<div className="mx-[-15px] flex flex-wrap">
				<div className={INPUT_CELL_CLASS}>
					{/* `.form-group.mb-2` */}
					<div className="mb-[8px]">
						<LegacyInput
							id="label"
							name="label"
							type="text"
							placeholder="Label"
							autoComplete="off"
							spellCheck={false}
							value={label}
							onChange={(event) => setLabel(event.target.value)}
						/>
					</div>
				</div>
				<div className={BUTTON_CELL_CLASS}>
					{/* `.btn.tbr_btn.tbr_btn-light-primary.d-inline-flex.p-2.mb-2` — icon only, no text */}
					<LegacyIconButton
						type="submit"
						variant="light-primary"
						ariaLabel="Simpan subkelas"
						icon={<SaveIcon />}
						loading={save.submitting}
						className="mb-[8px]"
					/>
				</div>
			</div>
		</form>
	)
}

export default SubGradeForm
