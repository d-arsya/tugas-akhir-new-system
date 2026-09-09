import type { JSX, ReactNode } from "react"
import { useState } from "react"
import { useNavigate, useLocation } from "@tanstack/react-router"
import { Sliders, ChevronUp, ChevronDown, UserCheck, UserX, Globe } from "lucide-react"

export interface DevHijackRoute {
	path: string
	label: string
}

export interface DevHijackPanelProps {
	appName?: string
	isDev?: boolean
	isAuthenticated?: boolean
	statusBadge?: string
	onToggleAuth?: () => void
	quickRoutes?: DevHijackRoute[]
	children?: ReactNode
}

export const DevHijackPanel = ({
	appName = "DEV",
	isDev = true,
	isAuthenticated = false,
	statusBadge,
	onToggleAuth,
	quickRoutes = [],
	children,
}: DevHijackPanelProps): JSX.Element | null => {
	if (!isDev) return null

	const navigate = useNavigate()
	const location = useLocation()
	const [isOpen, setIsOpen] = useState<boolean>(false)

	const badgeText = statusBadge || (isAuthenticated ? "LOGGED IN" : "GUEST")

	return (
		<div
			className="fixed bottom-5 left-32 z-[999999] font-sans antialiased pointer-events-auto"
			style={{ zIndex: 999999 }}
		>
			{/* Collapsed Pill Badge */}
			{!isOpen && (
				<button
					type="button"
					onClick={() => setIsOpen(true)}
					className="flex items-center gap-2 bg-slate-900/95 text-white hover:bg-slate-900 px-4 py-2.5 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.3)] backdrop-blur-md border border-slate-700/80 text-xs font-semibold cursor-pointer transition-all hover:scale-105"
				>
					<Sliders className="w-4 h-4 text-emerald-400" />
					<span>{appName} HIJACK</span>
					<span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.5 rounded-full font-mono border border-emerald-500/30">
						{badgeText}
					</span>
					<ChevronUp className="w-3.5 h-3.5 text-slate-400" />
				</button>
			)}

			{/* Expanded Debug Panel */}
			{isOpen && (
				<div className="bg-slate-900/95 text-slate-100 border border-slate-800 rounded-2xl shadow-2xl p-4 w-84 backdrop-blur-xl flex flex-col gap-3 max-h-[85vh] overflow-y-auto">
					{/* Header */}
					<div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
						<div className="flex items-center gap-2">
							<div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
							<span className="text-xs font-bold text-slate-200 tracking-wide uppercase">
								{appName} DEV HIJACK PANEL
							</span>
						</div>
						<button
							type="button"
							onClick={() => setIsOpen(false)}
							className="text-slate-400 hover:text-white text-xs cursor-pointer p-1"
						>
							<ChevronDown className="w-4 h-4" />
						</button>
					</div>

					{/* Auth Toggle */}
					{onToggleAuth && (
						<div className="flex items-center justify-between bg-slate-800/60 p-2.5 rounded-xl border border-slate-800">
							<div className="flex items-center gap-2 text-xs">
								{isAuthenticated ? (
									<UserCheck className="w-4 h-4 text-emerald-400" />
								) : (
									<UserX className="w-4 h-4 text-rose-400" />
								)}
								<span className="text-slate-300 font-medium">
									{isAuthenticated ? "Auth: Logged In" : "Auth: Guest"}
								</span>
							</div>
							<button
								type="button"
								onClick={onToggleAuth}
								className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors cursor-pointer"
							>
								{isAuthenticated ? "Simulate Logout" : "Simulate Login"}
							</button>
						</div>
					)}

					{/* Custom App Specific Controls */}
					{children}

					{/* Quick Route Switcher */}
					{quickRoutes.length > 0 && (
						<div className="flex flex-col gap-1.5 pt-2 border-t border-slate-800">
							<div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
								<Globe className="w-3.5 h-3.5 text-sky-400" />
								<span>Quick Route Switcher</span>
							</div>
							<div className="grid grid-cols-2 gap-1.5 pt-1">
								{quickRoutes.map((r) => {
									const isActive = location.pathname === r.path
									return (
										<button
											key={r.path}
											type="button"
											onClick={() => {
												navigate({ to: r.path as any })
												setIsOpen(false)
											}}
											className={`text-[11px] font-medium px-2.5 py-1.5 rounded-lg border text-left truncate transition-colors cursor-pointer ${
												isActive
													? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300 font-bold"
													: "bg-slate-800/50 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white"
											}`}
										>
											{r.label}
										</button>
									)
								})}
							</div>
						</div>
					)}
				</div>
			)}
		</div>
	)
}

export default DevHijackPanel
