import type { JSX, ReactNode } from "react"
import Header from "@/components/header"
import { RojaCard } from "@roja/ui"
import { cn } from "@roja/utils"


export interface PageLayoutProps {
	children: ReactNode
	maxWidth?: string
	useCardWrapper?: boolean
	showFooter?: boolean
	className?: string
}

export const PageLayout = ({
	children,
	maxWidth = "max-w-5xl",
	useCardWrapper = false,
	showFooter = false,
	className,
}: PageLayoutProps): JSX.Element => {
	return (
		<div className="roja_wizard_container min-h-screen flex flex-col relative overflow-hidden bg-[var(--bg-primary)] pt-[70px]">
			{/* Shared Header */}
			<Header />

			{/* Background decorative blob shapes */}
			<div className="roja_bg_blobs" />

			{/* Main Content Area */}
			<main
				className={cn(
					"flex-1 relative z-10 px-4 py-8 w-full mx-auto flex items-center justify-center",
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
