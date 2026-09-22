import type { JSX } from "react"

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@roja/ui"

// Port of ReportController::detailList `description` editColumn + the `.tbr_income_desc` Bootstrap tooltip:
// more than two items show the first two (sorted) with " ...", and hovering lists them all
const IncomeDescriptionCell = ({ description }: { description: string }): JSX.Element => {
	const items = description.split(", ").sort()
	if (items.length <= 2) return <>{description}</>

	return (
		// Legacy triggers the tooltip manually on mouseenter, without delay
		<TooltipProvider delayDuration={0}>
			<Tooltip>
				<TooltipTrigger asChild>
					<span>{items.slice(0, 2).join(", ")} ...</span>
				</TooltipTrigger>
				<TooltipContent
					side="top"
					sideOffset={6.4}
					// Bootstrap `.tooltip` (system font, .9 opacity) with the legacy white `.tooltip-inner`
					className="z-[1000] max-w-[240px] animate-none overflow-visible rounded-[10px] border-0! bg-white px-[20px] py-[16px] text-center [font-family:-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,'Helvetica_Neue',Arial,sans-serif] text-[14px] leading-[21px] tracking-normal text-[var(--body-txt-color)] opacity-90 shadow-none after:absolute after:bottom-[-6px] after:left-1/2 after:ml-[-6px] after:border-x-[6px] after:border-t-[6px] after:border-x-transparent! after:border-t-white! after:content-[''] data-[state=closed]:animate-none"
				>
					<ul className="m-0 mb-[16px] max-h-[200px] list-disc overflow-y-auto pl-[24px] marker:text-[var(--warning)]">
						{items.map((item, index) => (
							<li key={`${item}-${index}`} className="text-left">
								{item}
							</li>
						))}
					</ul>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	)
}

export default IncomeDescriptionCell
