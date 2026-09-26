import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

import AlumniIndex from "@/components/alumni/alumni-index"

export const Route = createFileRoute("/_auth/alumni/")({
	component: Page,
})

function Page(): JSX.Element {
	return <AlumniIndex />
}

export default Page
