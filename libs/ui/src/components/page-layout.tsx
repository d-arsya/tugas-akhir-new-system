import type { JSX, ReactNode } from "react"
import RojaCard from "./roja-card"
import { cn } from "@roja/utils"

export type PageLayoutVariant = "top" | "center"

export interface PageLayoutProps {
	children: ReactNode
	header?: ReactNode
	topBanner?: ReactNode
	variant?: PageLayoutVariant
	maxWidth?: string
	useCardWrapper?: boolean
	showFooter?: boolean
	footerText?: string
	version?: string
	showVersion?: boolean
	showBlobs?: boolean
	className?: string
	mainClassName?: string
}

export const PageLayout = ({
	children,
	header,
	topBanner,
	variant = "top",
	maxWidth = "max-w-[1140px]",
	useCardWrapper = false,
	showFooter = true,
	footerText = "© Copyright 2026",
	version = "1.1.2",
	showVersion = false,
	showBlobs = true,
	className,
	mainClassName,
}: PageLayoutProps): JSX.Element => {
	const isCenter = variant === "center"

	return (
		<div
			className={cn(
				"roja_wizard_container min-h-screen flex flex-col relative overflow-x-hidden bg-[var(--bg-primary)]",
				header ? "pt-[90px] sm:pt-[100px]" : "",
				className,
			)}
		>
			{/* Shared / Custom Header */}
			{header}

			{/* Background decorative blob shapes */}
			{showBlobs && <div className="roja_bg_blobs" />}

			{/* Full Width Top Banner Strip */}
			{topBanner && <div className="w-full relative z-10 -mt-5">{topBanner}</div>}

			{/* Main Content Area: Supports "top" (flow from top) or "center" (vertically centered) */}
			<main
				className={cn(
					"flex-1 relative z-10 px-4 sm:px-6 w-full mx-auto flex flex-col",
					isCenter
						? "items-center justify-center my-auto py-8 sm:py-12"
						: "items-stretch justify-start",
					topBanner ? "pt-4 sm:pt-6 pb-12" : isCenter ? "pt-6 pb-12" : "pt-4 sm:pt-6 pb-14",
					maxWidth,
					mainClassName,
				)}
			>
				{useCardWrapper ? (
					<RojaCard className="w-full">{children}</RojaCard>
				) : (
					<div className={cn("w-full", isCenter && "flex flex-col items-center justify-center my-auto")}>
						{children}
					</div>
				)}
			</main>

			{/* Redesigned Modern Centered Footer */}
			{showFooter && (
				<footer className="w-full bg-white/70 backdrop-blur-md border-t border-[var(--bg-form-border)] py-2 mt-auto relative z-10 shadow-[0_-1px_3px_rgba(0,0,0,0.02)]">
					<div className="w-full max-w-[1140px] mx-auto px-4 sm:px-6 flex flex-col items-center justify-center gap-2 text-center">
						<div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
							<span className="w-2 h-2 rounded-full bg-[#e4007e]" />
							<span>TMQ PONDOK ROJA</span>
						</div>
						<p className="text-[11px] text-[#abb4be] font-medium leading-relaxed m-0 max-w-2xl">
							{footerText}
						</p>
						{showVersion && (
							<div className="text-[10px] text-[#abb4be] font-medium pt-1">
								Version{" "}
								<a
									href="/changelog"
									className="text-[#e4007e] font-semibold hover:underline"
								>
									{version.replace(/^Version\s*/i, "")}
								</a>
							</div>
						)}
					</div>
				</footer>
			)}
		</div>
	)
}

export default PageLayout
