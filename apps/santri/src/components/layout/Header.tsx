import type { JSX } from "react"
import useAuthStore from "@/stores/auth.store"
import { useNavigate } from "@tanstack/react-router"
import { RojaHeader } from "@roja/ui"

export const Header = (): JSX.Element => {
	const navigate = useNavigate()
	const { user, logout, isAuthenticated } = useAuthStore()

	const handleLogout = () => {
		logout()
		navigate({ to: "/login" })
	}

	return (
		<RojaHeader
			user={user}
			roleLabel="SANTRI"
			isAuthenticated={isAuthenticated}
			homeHref="/dashboard"
			loginHref="/login"
			onLogout={handleLogout}
		/>
	)
}

export default Header
