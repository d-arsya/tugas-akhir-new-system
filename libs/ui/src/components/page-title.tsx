import type { JSX } from "react"
import { Link } from "@tanstack/react-router"

export interface PageBreadcrumbItem {
	label: string
	to?: string
}

export interface PageTitleProps {
	title: string
	breadcrumbs?: PageBreadcrumbItem[]
	homeTo?: string
	maxWidth?: string
	className?: string
}

export const PageTitle = ({
	title,
	breadcrumbs = [],
	homeTo = "/dashboard",
	maxWidth = "max-w-[1140px]",
	className = "",
}: PageTitleProps): JSX.Element => {
	return (
		<div className={`w-full bg-white/80 border-b border-slate-200/80 py-3.5 backdrop-blur-md shadow-xs ${className}`}>
			<div className={`${maxWidth} mx-auto px-4 sm:px-6 flex items-center justify-between`}>
				<h2
					className="!text-[15px] !text-[#e4007e] !font-bold tracking-tight m-0 p-0"
					style={{ fontSize: "15px", color: "#e4007e", fontWeight: 700 }}
				>
					{title}
				</h2>

				<nav className="flex items-center text-xs text-[var(--body-txt-inverse)]">
					<ol className="inline-flex items-center gap-2">
						<li className="inline-flex items-center">
							<Link
								to={homeTo as any}
								className="text-[#e4007e] hover:opacity-80 transition-opacity flex items-center"
							>
								<svg xmlns="http://www.w3.org/2000/svg" width="16" height="15.4" viewBox="0 0 18 17.328">
									<path d="M3.957,8.415l7.521-4.6a1,1,0,0,1,1.043,0l7.521,4.6A2,2,0,0,1,21,10.122V19a2,2,0,0,1-2,2H5a2,2,0,0,1-2-2V10.122A2,2,0,0,1,3.957,8.415ZM10,13a1,1,0,0,0-1,1v3a1,1,0,0,0,1,1h4a1,1,0,0,0,1-1V14a1,1,0,0,0-1-1Z" transform="translate(-3 -3.672)" fill="#e4007e" fillRule="evenodd" />
								</svg>
							</Link>
						</li>
						<li className="w-1.5 h-1.5 rounded-full bg-[#e4007e]" />
						{breadcrumbs.length > 0 ? (
							breadcrumbs.map((crumb, idx) => (
								<li key={idx} className="inline-flex items-center gap-2">
									{crumb.to ? (
										<Link
											to={crumb.to as any}
											className="text-slate-600 hover:text-[var(--primary)] font-medium transition-colors"
										>
											{crumb.label}
										</Link>
									) : (
										<span className="text-slate-500 font-normal">
											{crumb.label}
										</span>
									)}
									{idx < breadcrumbs.length - 1 && (
										<span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />
									)}
								</li>
							))
						) : (
							<li className="text-slate-500 font-normal">{title}</li>
						)}
					</ol>
				</nav>
			</div>
		</div>
	)
}

export default PageTitle
