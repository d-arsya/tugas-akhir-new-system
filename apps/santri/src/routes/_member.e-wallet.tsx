import type { JSX } from "react"
import { useState, useEffect } from "react"
import { createFileRoute, useLocation, Outlet } from "@tanstack/react-router"
import useEwalletStore from "@/stores/ewalletStore"
import { santriApi } from "@/lib/api"
import CreateEwalletView from "@/components/ewallet/CreateEwalletView"
import InactiveEwalletView from "@/components/ewallet/InactiveEwalletView"
import PinChallengeGate from "@/components/ewallet/PinChallengeGate"
import TransactionHistoryTable from "@/components/ewallet/TransactionHistoryTable"
import type { EwalletTransaction } from "@roja/types"

const EwalletPage = (): JSX.Element => {
	const location = useLocation()

	const {
		isPinAuthenticated,
		hasEwallet,
		isActive,
		setPinAuthenticated,
		setHasEwallet,
		setIsActive,
	} = useEwalletStore()

	// If current route is a sub-route under /e-wallet (e.g. /e-wallet/withdraw, /e-wallet/edit-pin, etc.), render Outlet
	const isSubRoute = location.pathname !== "/e-wallet" && location.pathname !== "/e-wallet/"
	if (isSubRoute) {
		return <Outlet />
	}

	// Dashboard Data State
	const [totalSaldo, setTotalSaldo] = useState<number>(0)
	const [transactions, setTransactions] = useState<EwalletTransaction[]>([])

	// Check status on mount
	useEffect(() => {
		const fetchStatus = async () => {
			try {
				const res = await santriApi.getEwalletStatus()
				setHasEwallet(res.hasEwallet)
				setIsActive(res.isActive)
			} catch (err) {
				// Default fallback in dev
			}
		}
		fetchStatus()
	}, [setHasEwallet, setIsActive])

	// Fetch dashboard data when PIN is authenticated
	useEffect(() => {
		if (isPinAuthenticated && hasEwallet && isActive) {
			const fetchDashboard = async () => {
				try {
					const data = await santriApi.getEwalletDashboard()
					setTotalSaldo(data.totalSaldo)
					setTransactions(data.transactions)
				} catch (err) {
					// Fallback
				}
			}
			fetchDashboard()
		}
	}, [isPinAuthenticated, hasEwallet, isActive])

	// Create E-Wallet Submission
	const handleCreateEwallet = async (pin: string, pinConfirmation: string) => {
		await santriApi.createEwallet({ pin, pinConfirmation })
		setHasEwallet(true)
		setPinAuthenticated(true)
	}

	// State 1: User does not have E-Wallet
	if (!hasEwallet) {
		return (
			<div className="py-6">
				<CreateEwalletView onSubmit={handleCreateEwallet} />
			</div>
		)
	}

	// State 2: E-Wallet is Inactive
	if (!isActive) {
		return (
			<div className="py-6">
				<InactiveEwalletView />
			</div>
		)
	}

	// State 3: PIN Challenge Gate
	if (!isPinAuthenticated) {
		return <PinChallengeGate />
	}

	// State 4: E-Wallet Core Dashboard
	return (
		<TransactionHistoryTable
			totalSaldo={totalSaldo}
			transactions={transactions}
			onSaldoChange={(newSaldo) => setTotalSaldo(newSaldo)}
		/>
	)
}

export const Route = createFileRoute("/_member/e-wallet")({
	component: EwalletPage,
})

export default EwalletPage
