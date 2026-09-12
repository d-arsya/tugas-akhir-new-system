import type { JSX } from "react"
import { useEffect, useState } from "react"
import { createFileRoute, useLocation, Outlet } from "@tanstack/react-router"
import type { DateRange } from "@roja/ui"
import useEwalletStore from "@/stores/ewalletStore"
import CreateEwalletView from "@/components/ewallet/CreateEwalletView"
import InactiveEwalletView from "@/components/ewallet/InactiveEwalletView"
import { PinChallengeGate } from "@roja/ui"
import TransactionHistoryTable from "@/components/ewallet/TransactionHistoryTable"
import {
	useSantriEwalletStatus,
	useSantriEwalletDashboard,
	useCreateEwalletMutation,
} from "@/hooks/use-santri-queries"
import { useDebounce } from "@/hooks/use-debounce"
import { santriApi } from "@/lib/api";

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

	const [page, setPage] = useState<number>(1)
	const [entriesPerPage, setEntriesPerPage] = useState<number>(10)
	const [statusFilter, setStatusFilter] = useState<string>("")
	const [searchQuery, setSearchQuery] = useState<string>("")
	const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)

	const debouncedSearch = useDebounce(searchQuery, 400)

	// Check status via TanStack Query
	const { data: statusData } = useSantriEwalletStatus()

	useEffect(() => {
		if (statusData) {
			setHasEwallet(statusData.hasEwallet)
			setIsActive(statusData.isActive)
		}
	}, [statusData, setHasEwallet, setIsActive])

	const dateStart = dateRange?.from ? dateRange.from.toISOString().split("T")[0] : undefined
	const dateEnd = dateRange?.to ? dateRange.to.toISOString().split("T")[0] : dateStart

	// Fetch dashboard data when PIN is authenticated
	const { data: dashboardData } = useSantriEwalletDashboard(
		{
			page,
			limit: entriesPerPage,
			status: statusFilter || undefined,
			search: debouncedSearch || undefined,
			dateStart,
			dateEnd,
		},
		isPinAuthenticated && hasEwallet && isActive,
	)

	const createEwalletMutation = useCreateEwalletMutation()

	// Create E-Wallet Submission
	const handleCreateEwallet = async (pin: string, pinConfirmation: string) => {
		await createEwalletMutation.mutateAsync({ pin, pinConfirmation })
		setHasEwallet(true)
		setPinAuthenticated(true)
	}

	if (isSubRoute) {
		return <Outlet />
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
		return (
			<PinChallengeGate
				onSubmitPin={async (pin) => {
					await santriApi.loginEwalletPin(pin)
					setPinAuthenticated(true)
				}}
			/>
		)
	}

	// State 4: E-Wallet Core Dashboard
	return (
		<TransactionHistoryTable
			totalSaldo={dashboardData?.totalBalance ?? 0}
			transactions={dashboardData?.transactions ?? []}
			meta={dashboardData?.meta}
			page={page}
			limit={entriesPerPage}
			searchQuery={searchQuery}
			onSearchChange={(val) => {
				setSearchQuery(val)
				setPage(1)
			}}
			statusFilter={statusFilter}
			onStatusChange={(val) => {
				setStatusFilter(val)
				setPage(1)
			}}
			dateRange={dateRange}
			onDateRangeChange={(val) => {
				setDateRange(val)
				setPage(1)
			}}
			onResetFilters={() => {
				setSearchQuery("")
				setStatusFilter("")
				setDateRange(undefined)
				setPage(1)
			}}
			onPageChange={setPage}
			onLimitChange={(newLimit) => {
				setEntriesPerPage(newLimit)
				setPage(1)
			}}
		/>
	)
}

export const Route = createFileRoute("/_member/e-wallet")({
	component: EwalletPage,
})

export default EwalletPage
