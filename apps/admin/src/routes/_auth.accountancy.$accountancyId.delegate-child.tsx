import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

import AccountancyDelegateChildPage from "@/components/accountancy/accountancy-delegate-child-page"

export const Route = createFileRoute("/_auth/accountancy/$accountancyId/delegate-child")({
	component: AccountancyDelegateChildRoute,
})

function AccountancyDelegateChildRoute(): JSX.Element {
	const { accountancyId } = Route.useParams()
	return <AccountancyDelegateChildPage accountancyId={Number(accountancyId)} />
}

export default AccountancyDelegateChildRoute
