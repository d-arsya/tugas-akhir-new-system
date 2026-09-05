import type { JSX } from "react"
import { Link } from "@tanstack/react-router"
import { Home } from "lucide-react"

interface PageTitleProps {
	title: string
	breadcrumbs?: Array<{ label: string; to?: string }>
}

export const PageTitle = ({ title, breadcrumbs = [] }: PageTitleProps): JSX.Element => {
	return (
		<div className="bg-white dark:bg-[#142335] border-b border-slate-200/80 dark:border-slate-800/80 py-4 shadow-xs transition-colors duration-300">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
				<h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
					{title}
				</h2>

				<nav className="flex items-center text-xs text-[var(--body-txt-inverse)]">
					<ol className="inline-flex items-center gap-2">
						<li className="inline-flex items-center">
							<Link
								to="/dashboard"
								className="text-[var(--primary)] hover:opacity-80 transition-opacity flex items-center gap-1"
							>
								<Home className="w-4 h-4 fill-[var(--primary)]/10 text-[var(--primary)]" />
							</Link>
						</li>
						{breadcrumbs.map((crumb, idx) => (
							<li key={idx} className="inline-flex items-center gap-2">
								<span className="w-1.5 h-1.5 rounded-full bg-[var(--secondary)]" />
								{crumb.to ? (
									<Link
										to={crumb.to as any}
										className="text-slate-600 dark:text-slate-300 hover:text-[var(--primary)] font-medium transition-colors"
									>
										{crumb.label}
									</Link>
								) : (
									<span className="text-slate-400 dark:text-slate-500 font-normal">
										{crumb.label}
									</span>
								)}
							</li>
						))}
					</ol>
				</nav>
			</div>
		</div>
	)
}

export default PageTitle
