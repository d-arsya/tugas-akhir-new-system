import type { JSX } from "react"

import { cn } from "@roja/utils"

import { legacyButtonClass } from "@/components/legacy/legacy-button"
import { useApplyStudentCostItems } from "@/hooks/use-student-costs"
import { useLegacySubmit } from "@/hooks/use-legacy-submit"

type StudentCostApplyButtonProps = {
	academicYearId: number
	gradeId: number
	ids: number[]
}

/**
 * `#tbr_applied_item` — "Terapkan item yang di checklist" (`student-cost/bulk-action.js`).
 *
 * The blade renders it with `tbr_disabled`, which is **CSS only** — `opacity: .5` and
 * `pointer-events: none`, no `disabled` attribute (app.css 468). Kept as legacy, per the decision
 * register; unlike legacy, the server re-checks the selection, and an empty one now answers a
 * validation error instead of a swallowed 500.
 */
const StudentCostApplyButton = ({
	academicYearId,
	gradeId,
	ids,
}: StudentCostApplyButtonProps): JSX.Element => {
	const mutation = useApplyStudentCostItems(academicYearId, gradeId)
	// Legacy reloads the page 1000 ms after the toast; the hook's refetch lands in the same window
	const { submit, submitting } = useLegacySubmit({
		mutationFn: () => mutation.mutateAsync({ ids }),
	})

	return (
		<button
			type="button"
			id="tbr_applied_item"
			onClick={() => submit(undefined)}
			className={cn(
				legacyButtonClass("secondary", "mb-[8px]"),
				ids.length === 0 && "pointer-events-none opacity-50",
			)}
		>
			<span className={submitting ? "invisible" : undefined}>Terapkan item yang di checklist</span>
			{submitting ? (
				<span
					role="status"
					className="absolute h-[20px] w-[20px] animate-spin rounded-full border-2 border-white border-r-transparent [animation-duration:0.75s]"
				/>
			) : null}
		</button>
	)
}

export default StudentCostApplyButton
