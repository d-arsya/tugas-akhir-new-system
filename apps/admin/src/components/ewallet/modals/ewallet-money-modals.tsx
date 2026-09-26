import { useEffect, type JSX } from "react"

import type { EwalletDetail } from "@roja/types"

import EwalletAmountModals from "@/components/ewallet/modals/ewallet-amount-modals"
import { closeAllEwalletModals, openEwalletModal } from "@/components/ewallet/modals/ewallet-modal-store"

type EwalletMoneyModalsProps = { detail: EwalletDetail }

const EwalletMoneyModals = ({ detail }: EwalletMoneyModalsProps): JSX.Element => {
	useEffect(() => closeAllEwalletModals, [])

	return (
		<>
			<EwalletAmountModals kind="topUp" detail={detail} />
			<EwalletAmountModals kind="withdraw" detail={detail} />
		</>
	)
}

type EwalletModalOpeners = {
	openTopUp: () => void
	openWithdraw: () => void
	openResetPin: () => void
}

const OPENERS: EwalletModalOpeners = {
	openTopUp: () => openEwalletModal("topUp"),
	openWithdraw: () => openEwalletModal("withdraw"),
	openResetPin: () => openEwalletModal("resetPin"),
}

export const useEwalletModals = (): EwalletModalOpeners => OPENERS

export default EwalletMoneyModals
