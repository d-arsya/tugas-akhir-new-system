import type { JSX, ReactNode } from "react"
import Header from "@/components/header"
import { RojaCard } from "@roja/ui"
import { cn } from "@roja/utils"

export interface PageLayoutProps {
	children: ReactNode
	topBanner?: ReactNode
	maxWidth?: string
	useCardWrapper?: boolean
	showFooter?: boolean
	className?: string
}

export const PageLayout = ({
	children,
	topBanner,
	maxWidth = "max-w-[1140px]",
	useCardWrapper = false,
	showFooter = false,
	className,
}: PageLayoutProps): JSX.Element => {
	return (
		<div className="roja_wizard_container min-h-screen flex flex-col relative overflow-hidden bg-[var(--bg-primary)] pt-[70px]">
			{/* Shared Header (100% full width across window) */}
			<Header />

			{/* Background decorative blob shapes */}
			<div className="roja_bg_blobs" />

			{/* Full Width Top Banner Strip */}
			{topBanner && (
				<div className="w-full relative z-10">
					{topBanner}
				</div>
			)}

			{/* Main Content Area (matching legacy container 1140px width and padding) */}
			<main
				className={cn(
					"flex-1 relative z-10 px-4 sm:px-6 py-6 md:py-8 w-full mx-auto flex flex-col items-stretch justify-start",
					maxWidth,
					className,
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
					<span>© Copyright 2026 TMQ (TARBIYYATU MUHAFFIZHATIL QUR'AN) PONDOK ROJA. All Rights Reserved.</span>
					<span className="mt-1 md:mt-0 block">Version 1.1.2</span>
				</footer>
			)}
		</div>
	)
}

export default PageLayout
