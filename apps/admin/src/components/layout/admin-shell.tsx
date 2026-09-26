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

const AdminShell = ({ userName, role, onLogout, children }: AdminShellProps): JSX.Element => {
	const pathname = useRouterState({ select: (state) => state.location.pathname })
	const [collapsed, setCollapsed] = useState(false)
	const [mobileOpen, setMobileOpen] = useState(false)
	const canActAsCashier = role === "superadmin" || role === "kasir"
	const { data: ewalletBadge } = useEwalletBadge(canActAsCashier)

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

				<div className="md:pt-[110px]">
					<AdminSidebar
						role={role}
						collapsed={collapsed}
						onToggleCollapse={() => setCollapsed((value) => !value)}
						mobileOpen={mobileOpen}
						badges={{ ewalletProcess: ewalletBadge?.count ?? 0 }}
					/>

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
