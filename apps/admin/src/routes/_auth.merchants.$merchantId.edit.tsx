import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

import MerchantEditPage from "@/components/merchants/merchant-edit-page"

export const Route = createFileRoute("/_auth/merchants/$merchantId/edit")({
	component: MerchantEditRoute,
})

function MerchantEditRoute(): JSX.Element {
	const { merchantId } = Route.useParams()
	return <MerchantEditPage merchantId={Number(merchantId)} />
}

export default MerchantEditRoute
