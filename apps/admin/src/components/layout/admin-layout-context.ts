import { createContext, useContext } from "react"

type AdminLayoutState = {
	// Desktop sidebar collapsed to 73px (legacy `html.sidebar-left-collapsed`)
	collapsed: boolean
	setCollapsed: (collapsed: boolean) => void
}

export const AdminLayoutContext = createContext<AdminLayoutState>({ collapsed: false, setCollapsed: () => undefined })

export const useAdminLayout = (): AdminLayoutState => useContext(AdminLayoutContext)
