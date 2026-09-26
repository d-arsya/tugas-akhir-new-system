import type { JSX, ReactNode } from "react"

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@roja/ui"

const CONTENT_CLASS = [
	"z-[1000000] max-w-[240px] animate-none rounded-[10px] border-0! bg-[rgba(23,40,60,0.9)] px-[20px] py-[16px]",
	"[font-family:-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,'Helvetica_Neue',Arial,sans-serif]",
	"text-[14px] leading-[21px] font-normal tracking-[0.5px] text-white text-center opacity-90 shadow-[0px_8px_30px_0px_rgba(23,40,60,0.08)]",
	"after:absolute after:bottom-[-6px] after:left-1/2 after:ml-[-6px] after:border-x-[6px] after:border-t-[6px]",
	"after:border-x-transparent! after:border-t-[rgba(23,40,60,0.9)]! after:content-['']",
	"data-[state=closed]:animate-none",
].join(" ")

type FormPanelTooltipProps = { title: string; className?: string; children: ReactNode }

const FormPanelTooltip = ({ title, className, children }: FormPanelTooltipProps): JSX.Element => (
	<TooltipProvider delayDuration={0}>
		<Tooltip>
			<TooltipTrigger asChild>
				<span className={className}>{children}</span>
			</TooltipTrigger>
			<TooltipContent side="top" sideOffset={6.4} className={CONTENT_CLASS}>
				{title}
			</TooltipContent>
		</Tooltip>
	</TooltipProvider>
)

export default FormPanelTooltip
