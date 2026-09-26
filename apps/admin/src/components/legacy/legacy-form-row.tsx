import type { JSX, ReactNode } from "react"

import { cn } from "@roja/utils"

export type LegacyCol = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12

type LegacyFormRowProps = {
	label: ReactNode
	htmlFor?: string
	hint?: "required" | "optional" | null
	example?: string
	labelCols?: 3 | 4
	fieldCols?: LegacyCol
	className?: string
	children: ReactNode
}

const COL: Record<LegacyCol, string> = {
	1: "min-[992px]:max-w-[8.333333%] min-[992px]:flex-[0_0_8.333333%]",
	2: "min-[992px]:max-w-[16.666667%] min-[992px]:flex-[0_0_16.666667%]",
	3: "min-[992px]:max-w-[25%] min-[992px]:flex-[0_0_25%]",
	4: "min-[992px]:max-w-[33.333333%] min-[992px]:flex-[0_0_33.333333%]",
	5: "min-[992px]:max-w-[41.666667%] min-[992px]:flex-[0_0_41.666667%]",
	6: "min-[992px]:max-w-[50%] min-[992px]:flex-[0_0_50%]",
	7: "min-[992px]:max-w-[58.333333%] min-[992px]:flex-[0_0_58.333333%]",
	8: "min-[992px]:max-w-[66.666667%] min-[992px]:flex-[0_0_66.666667%]",
	9: "min-[992px]:max-w-[75%] min-[992px]:flex-[0_0_75%]",
	10: "min-[992px]:max-w-[83.333333%] min-[992px]:flex-[0_0_83.333333%]",
	11: "min-[992px]:max-w-[91.666667%] min-[992px]:flex-[0_0_91.666667%]",
	12: "min-[992px]:max-w-full min-[992px]:flex-[0_0_100%]",
}

const LegacyFormRow = ({
	label,
	htmlFor,
	hint = null,
	example,
	labelCols = 4,
	fieldCols,
	className,
	children,
}: LegacyFormRowProps): JSX.Element => (
	<div className={cn("mx-[-15px] mb-[16px] flex flex-wrap", className)}>
		<label
			htmlFor={htmlFor}
			className={cn("relative m-0 w-full px-[15px] leading-[20px] min-[992px]:text-right", COL[labelCols])}
		>
			{label}
			{hint ? (
				<span className="m-0 mb-[4px] block p-0 text-[11px] leading-[20px] font-normal text-[var(--grey)] opacity-80">{hint}</span>
			) : null}
			{example ? <span className="mt-[8px] mb-[4px] block text-[var(--grey)] italic">{example}</span> : null}
		</label>
		<div className={cn("relative w-full px-[15px]", COL[fieldCols ?? ((12 - labelCols) as LegacyCol)])}>{children}</div>
	</div>
)

export default LegacyFormRow
