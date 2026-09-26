import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

import EwalletBlockedPage from "@/components/ewallet/modals/ewallet-blocked-page"

export const Route = createFileRoute("/_auth/ewallets/$ewalletId/blocked")({
	component: BlockedRoute,
})

function BlockedRoute(): JSX.Element {
	const { ewalletId } = Route.useParams()
	return <EwalletBlockedPage ewalletId={Number(ewalletId)} />
}

export default BlockedRoute
