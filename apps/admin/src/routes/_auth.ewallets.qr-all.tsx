import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

import { EwalletQrPrintAll } from "@/components/ewallet/ewallet-qr-print"

// Legacy ewallet/qrcode-print-all.blade.php — a standalone print page, opened in a new tab
export const Route = createFileRoute("/_auth/ewallets/qr-all")({
	component: EwalletQrPrintAllPage,
})

function EwalletQrPrintAllPage(): JSX.Element {
	return <EwalletQrPrintAll />
}

export default EwalletQrPrintAllPage
