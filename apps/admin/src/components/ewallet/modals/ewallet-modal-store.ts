import { useSyncExternalStore } from "react"

export type EwalletModalName = "topUp" | "topUpConfirm" | "withdraw" | "withdrawConfirm" | "resetPin" | "doneReset"

type ModalState = Record<EwalletModalName, boolean>

const CLOSED: ModalState = { topUp: false, topUpConfirm: false, withdraw: false, withdrawConfirm: false, resetPin: false, doneReset: false }

let state: ModalState = CLOSED
const listeners = new Set<() => void>()

const set = (patch: Partial<ModalState>): void => {
	state = { ...state, ...patch }
	listeners.forEach((listener) => listener())
}

export const openEwalletModal = (name: EwalletModalName): void => set({ [name]: true })
export const closeEwalletModal = (name: EwalletModalName): void => set({ [name]: false })
export const closeAllEwalletModals = (): void => set(CLOSED)

const subscribe = (listener: () => void): (() => void) => {
	listeners.add(listener)
	return () => listeners.delete(listener)
}

export const useEwalletModalState = (): ModalState => useSyncExternalStore(subscribe, () => state, () => CLOSED)
