import type { JSX } from "react"

import { cn } from "@roja/utils"

import { legacyButtonClass } from "./legacy-button"
import LegacyCurrencyInput from "./legacy-currency-input"

type LegacyAmountListProps = {
	values: string[]
	onChange: (values: string[]) => void
	max?: number
	addLabel?: string
	prefix?: string
	disabled?: boolean
}

const RemoveIcon = (): JSX.Element => (
	<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
		<g opacity="0.7">
			<rect width="24" height="24" transform="translate(24 24) rotate(180)" fill="currentColor" opacity="0" />
			<path
				d="M13.41,12l4.3-4.29a1,1,0,1,0-1.42-1.42L12,10.59,7.71,6.29A1,1,0,0,0,6.29,7.71L10.59,12l-4.3,4.29a1,1,0,1,0,1.42,1.42L12,13.41l4.29,4.3a1,1,0,1,0,1.42-1.42Z"
				fill="currentColor"
			/>
		</g>
	</svg>
)

const LegacyAmountList = ({
	values,
	onChange,
	max = 20,
	addLabel = "Tambah Item",
	prefix = "Rp",
	disabled = false,
}: LegacyAmountListProps): JSX.Element => {
	const rows = values.length > 0 ? values : [""]

	const setAt = (index: number, next: string): void => {
		onChange(rows.map((entry, i) => (i === index ? next : entry)))
	}

	const add = (): void => {
		if (disabled || rows.length >= max) return
		onChange([...rows, ""])
	}

	return (
		<>
			{rows.map((entry, index) => (
				<div key={index} className="flex flex-wrap">
					<div className="mb-[4px] w-[calc(90%-20px)] max-w-[calc(90%-20px)] min-w-[calc(90%-20px)] flex-[calc(90%-20px)] pr-[20px] max-[480px]:w-[calc(100%-40px)] max-[480px]:max-w-[calc(100%-40px)] max-[480px]:min-w-[calc(100%-40px)] max-[480px]:flex-[calc(100%-40px)]">
						<div className="relative flex w-full flex-wrap items-stretch">
							<div className="mr-[-2px] flex h-[40px] w-[42px] shrink-0 items-center justify-center rounded-l-[6px] border-2 border-[var(--bg-form-border)]! bg-[var(--bg-form)] px-[12px] py-[4px] text-[var(--grey)]">
								{prefix}
							</div>
							<LegacyCurrencyInput
								value={entry}
								onChange={(next) => setAt(index, next)}
								disabled={disabled}
								className="relative w-[1%] min-w-0 flex-auto rounded-l-none focus:z-[3]"
							/>
						</div>
					</div>

					<button
						type="button"
						aria-label={`Hapus biaya ke ${index + 1}`}
						aria-disabled={disabled || index === 0}
						onClick={() => {
							if (disabled || index === 0) return
							onChange(rows.filter((_, i) => i !== index))
						}}
						className={legacyButtonClass(
							"light-danger",
							cn(
								"h-[40px] w-[40px] max-w-[40px] min-w-[40px] flex-[40px] p-0",
								(disabled || index === 0) && "pointer-events-none cursor-default opacity-50",
							),
						)}
					>
						<RemoveIcon />
					</button>
				</div>
			))}

			<div className="pt-[8px] text-center">
				<a
					role="button"
					tabIndex={0}
					onClick={add}
					onKeyDown={(event) => {
						if (event.key !== "Enter" && event.key !== " ") return
						event.preventDefault()
						add()
					}}
					className="cursor-pointer text-[12px] text-[var(--primary)]"
				>
					{addLabel}
				</a>
			</div>
		</>
	)
}

export default LegacyAmountList
