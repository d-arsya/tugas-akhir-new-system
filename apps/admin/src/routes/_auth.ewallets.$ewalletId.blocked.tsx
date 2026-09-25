import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

import EwalletBlockedPage from "@/components/ewallet/modals/ewallet-blocked-page"

// Legacy ewallet/blocked-pin.blade.php
export const Route = createFileRoute("/_auth/ewallets/$ewalletId/blocked")({
	component: BlockedRoute,
})

function BlockedRoute(): JSX.Element {
	const { ewalletId } = Route.useParams()
	return <EwalletBlockedPage ewalletId={Number(ewalletId)} />
}

export default BlockedRoute
