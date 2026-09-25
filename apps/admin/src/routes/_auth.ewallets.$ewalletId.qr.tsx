import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

import { EwalletQrPrintSingle } from "@/components/ewallet/ewallet-qr-print"

// Legacy ewallet/qrcode-print.blade.php — a standalone print page, opened in a new tab
export const Route = createFileRoute("/_auth/ewallets/$ewalletId/qr")({
	component: EwalletQrPrintPage,
})

function EwalletQrPrintPage(): JSX.Element {
	const { ewalletId } = Route.useParams()
	return <EwalletQrPrintSingle ewalletId={Number(ewalletId)} />
}

export default EwalletQrPrintPage
