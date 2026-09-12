import * as React from "react"
import { cn } from "@roja/utils"

export interface RojaCardProps extends React.HTMLAttributes<HTMLDivElement> {
	showGlows?: boolean
}

export const RojaCard = React.forwardRef<HTMLDivElement, RojaCardProps>(
	({ className, children, showGlows = true, ...props }, ref) => {
		return (
			<div
				ref={ref}
				className={cn(
"roja_card_wizard relative bg-white/75 backdrop-blur-xl rounded-3xl border border-white/40 shadow-[0_8px_32px_rgba(31,38,135,0.05)] p-8 md:p-12 transition-all duration-300",
					className,
				)}
				{...props}
			>
				{showGlows && (
					<div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none z-0">
						<div className="absolute -top-12 -left-12 w-48 h-48 bg-[var(--primary)] rounded-full blur-[50px] opacity-[0.12] pointer-events-none" />
						<div className="absolute -top-12 -right-12 w-48 h-48 bg-[var(--secondary)] rounded-full blur-[50px] opacity-[0.12] pointer-events-none" />
					</div>
				)}
				<div className="relative z-10 w-full">{children}</div>
			</div>
		)
	},
)

RojaCard.displayName = "RojaCard"

export default RojaCard
