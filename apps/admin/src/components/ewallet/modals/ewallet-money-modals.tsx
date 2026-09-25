import { useEffect, type JSX } from "react"

import type { EwalletDetail } from "@roja/types"

import EwalletAmountModals from "@/components/ewallet/modals/ewallet-amount-modals"
import { closeAllEwalletModals, openEwalletModal } from "@/components/ewallet/modals/ewallet-modal-store"

// Seam 1 of the Dompet port: the detail page (D-A) mounts `<EwalletMoneyModals detail={…} />` once and opens
// a modal from its buttons with `useEwalletModals()`; the setting page mounts `<EwalletResetPinModals ewalletId={…} />`
// (ewallet-reset-pin-modals.tsx) and opens it the same way.
type EwalletMoneyModalsProps = { detail: EwalletDetail }

export const EwalletMoneyModals = ({ detail }: EwalletMoneyModalsProps): JSX.Element => {
	// A modal left open must not greet the next wallet's page
	useEffect(() => closeAllEwalletModals, [])

	return (
		<>
			<EwalletAmountModals kind="topUp" detail={detail} />
			<EwalletAmountModals kind="withdraw" detail={detail} />
		</>
	)
}

export type EwalletModalOpeners = {
	/** `data-target="#tbr_top_up_modal"` */
	openTopUp: () => void
	/** `data-target="#tbr_withdraw_modal"` */
	openWithdraw: () => void
	/** `data-target="#modalResetPin"` */
	openResetPin: () => void
}

const OPENERS: EwalletModalOpeners = {
	openTopUp: () => openEwalletModal("topUp"),
	openWithdraw: () => openEwalletModal("withdraw"),
	openResetPin: () => openEwalletModal("resetPin"),
}

export const useEwalletModals = (): EwalletModalOpeners => OPENERS

export default EwalletMoneyModals
