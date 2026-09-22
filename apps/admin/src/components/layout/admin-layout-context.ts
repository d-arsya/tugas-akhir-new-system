import { createContext, useContext } from "react"

type AdminLayoutState = {
	// Desktop sidebar collapsed to 73px (legacy `html.sidebar-left-collapsed`)
	collapsed: boolean
}

export const AdminLayoutContext = createContext<AdminLayoutState>({ collapsed: false })

export const useAdminLayout = (): AdminLayoutState => useContext(AdminLayoutContext)
