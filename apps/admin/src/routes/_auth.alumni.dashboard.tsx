import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

import ComingSoon from "@/components/alumni/coming-soon"

export const Route = createFileRoute("/_auth/alumni/dashboard")({
	component: Page,
})

function Page(): JSX.Element {
	return <ComingSoon />
}

export default Page
