import type { JSX, ReactNode } from "react"
import RojaCard from "./roja-card"
import { cn } from "@roja/utils"

export interface PageLayoutProps {
	children: ReactNode
	header?: ReactNode
	topBanner?: ReactNode
	maxWidth?: string
	useCardWrapper?: boolean
	showFooter?: boolean
	footerText?: string
	version?: string
	showBlobs?: boolean
	className?: string
	mainClassName?: string
}

export const PageLayout = ({
	children,
	header,
	topBanner,
	maxWidth = "max-w-[1140px]",
	useCardWrapper = false,
	showFooter = false,
	footerText = "© Copyright 2026 TMQ (TARBIYYATU MUHAFFIZHATIL QUR'AN) PONDOK ROJA. All Rights Reserved.",
	version = "Version 1.1.2",
	showBlobs = true,
	className,
	mainClassName,
}: PageLayoutProps): JSX.Element => {
	return (
		<div
			className={cn(
				"roja_wizard_container min-h-screen flex flex-col relative overflow-hidden bg-[var(--bg-primary)]",
				header ? "pt-[70px]" : "",
				className,
			)}
		>
			{/* Shared / Custom Header */}
			{header}

			{/* Background decorative blob shapes */}
			{showBlobs && <div className="roja_bg_blobs" />}

			{/* Full Width Top Banner Strip */}
			{topBanner && <div className="w-full relative z-10">{topBanner}</div>}

			{/* Main Content Area */}
			<main
				className={cn(
					"flex-1 relative z-10 px-4 sm:px-6 py-6 md:py-8 w-full mx-auto flex flex-col items-stretch justify-start",
					maxWidth,
					mainClassName,
				)}
			>
				{useCardWrapper ? (
					<RojaCard className="w-full">{children}</RojaCard>
				) : (
					<div className="w-full">{children}</div>
				)}
			</main>

			{/* Optional Footer */}
			{showFooter && (
				<footer className="w-full bg-white dark:bg-[#17283c] border-t border-[var(--bg-form-border)] py-4 px-8 text-center md:flex md:justify-between text-[10px] text-[#abb4be] font-medium mt-auto relative z-10">
					<span>{footerText}</span>
					<span className="mt-1 md:mt-0 block">{version}</span>
				</footer>
			)}
		</div>
	)
}

export default PageLayout
