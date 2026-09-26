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

const StudentCostApplyButton = ({
	academicYearId,
	gradeId,
	ids,
}: StudentCostApplyButtonProps): JSX.Element => {
	const mutation = useApplyStudentCostItems(academicYearId, gradeId)
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
