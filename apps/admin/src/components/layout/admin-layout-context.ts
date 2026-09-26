import { createContext, useContext } from "react"

type AdminLayoutState = {
	collapsed: boolean
	setCollapsed: (collapsed: boolean) => void
}

export const AdminLayoutContext = createContext<AdminLayoutState>({ collapsed: false, setCollapsed: () => undefined })

export const useAdminLayout = (): AdminLayoutState => useContext(AdminLayoutContext)
