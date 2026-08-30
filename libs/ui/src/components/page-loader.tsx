import type { JSX } from "react"
import { cn } from "@roja/utils"

type PageLoaderProps = {
	className?: string
}

const PageLoader = ({ className }: PageLoaderProps): JSX.Element => {
	return (
		<div
			className={cn(
				"fixed inset-0 flex items-center justify-center z-50",
				className,
			)}
			style={{ backgroundColor: "var(--bg-primary)" }}
		>
			<div className="flex flex-col items-center gap-3">
				<div
					className="h-10 w-10 animate-spin rounded-full border-4"
					style={{
						borderColor: "var(--bg-form-border)",
						borderTopColor: "var(--primary)",
					}}
					role="status"
					aria-label="Loading"
				/>
				<span
					className="text-xs font-medium tracking-widest"
					style={{ color: "var(--muted-txt-color)" }}
				>
					Loading...
				</span>
			</div>
		</div>
	)
}

export default PageLoader
