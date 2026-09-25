import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

import EwalletList from "@/components/ewallet/ewallet-list"

// Legacy ewallet/index.blade.php
export const Route = createFileRoute("/_auth/ewallets/")({
	component: EwalletsIndexPage,
})

function EwalletsIndexPage(): JSX.Element {
	return <EwalletList />
}

export default EwalletsIndexPage
