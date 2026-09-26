import { createFileRoute } from "@tanstack/react-router"
import LoginPage from "@/components/auth/login-page"

export const Route = createFileRoute("/_guest/login")({
	component: LoginPage,
})
