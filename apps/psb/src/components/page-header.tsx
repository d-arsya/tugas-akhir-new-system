import type { JSX, ReactNode } from "react"

export interface PageHeaderProps {
	title: string
	subtitle?: string | undefined
	action?: ReactNode | undefined
	className?: string | undefined
}

export const PageHeader = ({ title, subtitle, action, className = "" }: PageHeaderProps): JSX.Element => {
	return (
		<div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--bg-form-border)] pb-6 ${className}`}>
			<div>
				<div className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100 m-0">{title}</div>
				{subtitle && <p className="mt-1.5 text-xs text-[var(--body-txt-inverse)] m-0">{subtitle}</p>}
			</div>
			{action && <div className="shrink-0">{action}</div>}
		</div>
	)
}

export default PageHeader
