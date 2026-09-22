import { useEffect, useState, type JSX, type ReactNode } from "react"
import { useRouterState } from "@tanstack/react-router"

import { cn } from "@roja/utils"

import { roleLabel, type LayoutRole } from "@/lib/admin-roles"

import AdminFooter from "./admin-footer"
import AdminHeader from "./admin-header"
import AdminSidebar from "./admin-sidebar"

type AdminShellProps = {
	userName: string
	role: LayoutRole | null
	onLogout: () => void
	children: ReactNode
}

// Port of legacy layouts/app.blade.php with `<html class="fixed sidebar-left-sm">`
const AdminShell = ({ userName, role, onLogout, children }: AdminShellProps): JSX.Element => {
	const pathname = useRouterState({ select: (state) => state.location.pathname })
	// Legacy keeps the collapsed state per page load only, so it is not persisted
	const [collapsed, setCollapsed] = useState(false)
	const [mobileOpen, setMobileOpen] = useState(false)

	useEffect(() => {
		setMobileOpen(false)
	}, [pathname])

	useEffect(() => {
		document.body.style.overflow = mobileOpen ? "hidden" : ""
		return () => {
			document.body.style.overflow = ""
		}
	}, [mobileOpen])

	return (
		<div className="min-h-screen bg-[var(--bg-primary)]">
			<AdminHeader
				userName={userName}
				roleLabel={roleLabel(role)}
				onToggleMobileSidebar={() => setMobileOpen((open) => !open)}
				onLogout={onLogout}
			/>

			<div className="md:pt-[60px]">
				<AdminSidebar
					role={role}
					collapsed={collapsed}
					onToggleCollapse={() => setCollapsed((value) => !value)}
					mobileOpen={mobileOpen}
					badges={{}}
				/>

				{/* Porto's fixed layout renders content-body as a block, so the footer follows the content */}
				<main
					className={cn(
						"block px-[15px] pt-0 pb-[15px] md:p-[30px] md:transition-[margin] md:duration-300",
						collapsed ? "md:ml-[73px]" : "md:ml-[250px]",
					)}
				>
					<div className="min-w-0">{children}</div>
					<AdminFooter />
				</main>
			</div>
		</div>
	)
}

export default AdminShell
