import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

import EwalletDetail from "@/components/ewallet/ewallet-detail"

// Legacy ewallet/detail.blade.php (+ _partials/student-detail | merchant-detail)
export const Route = createFileRoute("/_auth/ewallets/$ewalletId/")({
	component: EwalletDetailPage,
})

function EwalletDetailPage(): JSX.Element {
	const { ewalletId } = Route.useParams()
	return <EwalletDetail ewalletId={Number(ewalletId)} />
}

export default EwalletDetailPage
