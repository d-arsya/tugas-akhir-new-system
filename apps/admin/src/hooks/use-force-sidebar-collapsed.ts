import { useEffect } from "react"

import { useAdminLayout } from "@/components/layout/admin-layout-context"

// Legacy report pages run `$('html').addClass('sidebar-left-collapsed')` on load. The collapsed
// state only lives for that page load, so leaving the page brings the full sidebar back
export const useForceSidebarCollapsed = (): void => {
	const { setCollapsed } = useAdminLayout()

	useEffect(() => {
		setCollapsed(true)
		return () => setCollapsed(false)
	}, [setCollapsed])
}
