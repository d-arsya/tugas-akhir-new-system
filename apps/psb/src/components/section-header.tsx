import type { JSX } from "react"

export interface SectionHeaderProps {
	title: string
	description?: string | undefined
	className?: string | undefined
}

export const SectionHeader = ({ title, description, className = "" }: SectionHeaderProps): JSX.Element => {
	return (
		<div className={`flex flex-col gap-1 ${className}`}>
			<h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 m-0">{title}</h3>
			{description && <p className="text-xs text-[var(--body-txt-inverse)] m-0">{description}</p>}
		</div>
	)
}

export default SectionHeader
