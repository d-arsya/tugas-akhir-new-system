import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

import AccountancyDeletePage from "@/components/accountancy/accountancy-delete-page"

export const Route = createFileRoute("/_auth/accountancy/$accountancyId/delete")({
	component: AccountancyDeleteRoute,
})

function AccountancyDeleteRoute(): JSX.Element {
	const { accountancyId } = Route.useParams()
	return <AccountancyDeletePage accountancyId={Number(accountancyId)} />
}

export default AccountancyDeleteRoute
