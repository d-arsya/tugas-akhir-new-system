import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

import EwalletSetting from "@/components/ewallet/ewallet-setting"

export const Route = createFileRoute("/_auth/ewallets/$ewalletId/setting")({
	component: EwalletSettingPage,
})

function EwalletSettingPage(): JSX.Element {
	const { ewalletId } = Route.useParams()
	return <EwalletSetting ewalletId={Number(ewalletId)} />
}

export default EwalletSettingPage
