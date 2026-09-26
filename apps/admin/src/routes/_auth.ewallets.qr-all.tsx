import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

import { EwalletQrPrintAll } from "@/components/ewallet/ewallet-qr-print"

export const Route = createFileRoute("/_auth/ewallets/qr-all")({
	component: EwalletQrPrintAllPage,
})

function EwalletQrPrintAllPage(): JSX.Element {
	return <EwalletQrPrintAll />
}

export default EwalletQrPrintAllPage
