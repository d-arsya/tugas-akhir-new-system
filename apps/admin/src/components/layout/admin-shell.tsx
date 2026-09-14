import { useState, useEffect, type JSX, type ReactNode } from "react"
import type { AuthUser } from "@roja/types"
import { AdminSidebar } from "./admin-sidebar"
import { AdminHeader } from "./admin-header"

export interface AdminShellProps {
	user: AuthUser | null
	userRole: string
	onLogout: () => void
	children: ReactNode
}

export function AdminShell({
	user,
	userRole,
	onLogout,
	children,
}: AdminShellProps): JSX.Element {
	const [collapsed, setCollapsed] = useState<boolean>(() => {
		if (typeof window !== "undefined") {
			return localStorage.getItem("admin_sidebar_collapsed") === "true"
		}
		return false
	})

	const [mobileOpen, setMobileOpen] = useState<boolean>(false)

	useEffect(() => {
		localStorage.setItem("admin_sidebar_collapsed", String(collapsed))
	}, [collapsed])

	const toggleCollapse = () => {
		setCollapsed((prev) => !prev)
	}

	return (
		<div className="min-h-screen bg-[var(--bg-primary)] text-slate-800 flex flex-col">
			{/* Sticky Top Header */}
			<AdminHeader
				user={user}
				userRole={userRole}
				onToggleSidebar={toggleCollapse}
				onOpenMobileSidebar={() => setMobileOpen(true)}
				onLogout={onLogout}
			/>

			{/* Main Workspace: Left Sidebar + Fluid Bleed Content Area */}
			<div className="flex-1 flex w-full relative">
				{/* Left Sidebar */}
				<AdminSidebar
					collapsed={collapsed}
					onToggleCollapse={toggleCollapse}
					mobileOpen={mobileOpen}
					onCloseMobile={() => setMobileOpen(false)}
					userRole={userRole}
				/>

				{/* Fluid Bleed Main Content Area */}
				<main className="flex-1 min-w-0 w-full overflow-x-hidden">
					<div className="w-full px-4 sm:px-6 lg:px-8 py-6 max-w-full space-y-6">
						{children}
					</div>
				</main>
			</div>
		</div>
	)
}
