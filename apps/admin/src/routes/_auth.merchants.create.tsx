import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

import MerchantCreatePage from "@/components/merchants/merchant-create-page"

export const Route = createFileRoute("/_auth/merchants/create")({
	component: MerchantCreateRoute,
})

function MerchantCreateRoute(): JSX.Element {
	return <MerchantCreatePage />
}

export default MerchantCreateRoute
