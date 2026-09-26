import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

import EwalletWithdrawPinPage from "@/components/ewallet/modals/ewallet-withdraw-pin-page"

export const Route = createFileRoute("/_auth/ewallets/$ewalletId/withdraw-pin")({
	component: WithdrawPinRoute,
})

function WithdrawPinRoute(): JSX.Element {
	const { ewalletId } = Route.useParams()
	return <EwalletWithdrawPinPage ewalletId={Number(ewalletId)} />
}

export default WithdrawPinRoute
