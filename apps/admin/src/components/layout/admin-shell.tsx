import { useEffect, useState, type JSX, type ReactNode } from "react"
import { useRouterState } from "@tanstack/react-router"

import { cn } from "@roja/utils"

import { LegacyNotifyHost } from "@/components/legacy/legacy-notify"
import { useEwalletBadge } from "@/hooks/use-ewallets"
import { roleLabel, type LayoutRole } from "@/lib/admin-roles"

import AdminFooter from "./admin-footer"
import { AdminLayoutContext } from "./admin-layout-context"
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
	// Legacy `ViewServiceProvider` counts `process` transactions on every page, but the menu (and so the
	// badge) exists only under `@can('do-as-cashier')` — the API answers 403 to anyone else, so only ask them
	const { data: ewalletBadge } = useEwalletBadge(role === "superadmin" || role === "kasir")

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
		<AdminLayoutContext.Provider value={{ collapsed, setCollapsed }}>
			<div className="min-h-screen bg-[var(--bg-primary)]">
				<AdminHeader
					userName={userName}
					roleLabel={roleLabel(role)}
					onToggleMobileSidebar={() => setMobileOpen((open) => !open)}
					onLogout={onLogout}
				/>

				{/* Legacy `html.fixed .inner-wrapper`: 60px header + 50px fixed page title */}
				<div className="md:pt-[110px]">
					<AdminSidebar
						role={role}
						collapsed={collapsed}
						onToggleCollapse={() => setCollapsed((value) => !value)}
						mobileOpen={mobileOpen}
						badges={{ ewalletProcess: ewalletBadge?.count ?? 0 }}
					/>

					{/* Porto `html.flexbox.fixed`: content-body fills the viewport below the page title (flex: 2) and
						`.flex-grow-1` pushes the footer to the bottom on short pages */}
					<main
						className={cn(
							"block px-[15px] pt-0 pb-[15px] md:flex md:min-h-[calc(100vh-110px)] md:flex-col md:p-[30px] md:transition-[margin] md:duration-300",
							collapsed ? "md:ml-[73px]" : "md:ml-[250px]",
						)}
					>
						<div className="min-w-0 md:grow">{children}</div>
						<AdminFooter />
					</main>
				</div>
				<LegacyNotifyHost />
			</div>
		</AdminLayoutContext.Provider>
	)
}

export default AdminShell
