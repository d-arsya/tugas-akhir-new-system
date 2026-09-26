import { useEffect } from "react"

import { useAdminLayout } from "@/components/layout/admin-layout-context"

export const useForceSidebarCollapsed = (): void => {
	const { setCollapsed } = useAdminLayout()

	useEffect(() => {
		setCollapsed(true)
		return () => setCollapsed(false)
	}, [setCollapsed])
}
