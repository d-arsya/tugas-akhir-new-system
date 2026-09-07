import type { JSX } from "react"
import useAuthStore from "@/stores/auth.store"
import { santriApi } from "@/lib/api"
import { useNavigate } from "@tanstack/react-router"
import { RojaHeader } from "@roja/ui"

export const Header = (): JSX.Element => {
	const auth = useAuthStore()
	const navigate = useNavigate()

	const handleLogout = async (): Promise<void> => {
		await santriApi.logout()
		auth.logout()
		navigate({ to: "/login" })
	}

	return (
		<RojaHeader
			user={auth.user}
			roleLabel="SANTRI"
			isAuthenticated={auth.isAuthenticated}
			homeHref={auth.isAuthenticated ? "/dashboard" : "/login"}
			loginHref="/login"
			onLogout={handleLogout}
		/>
	)
}

export default Header
