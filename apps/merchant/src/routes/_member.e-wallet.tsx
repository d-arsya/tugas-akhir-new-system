import { type JSX, useState } from "react"
import { createFileRoute, Link, useLocation, Outlet } from "@tanstack/react-router"
import { Plus } from "lucide-react"
import {
	RojaCard,
	Button,
	PinChallengeGate,
	type DateRange,
} from "@roja/ui"
import { toast } from "sonner"

import useEwalletStore from "@/stores/ewalletStore"
import {
	useMerchantEwalletStatus,
	useMerchantEwalletDashboard,
	useLoginEwalletPinMutation,
} from "@/hooks/use-merchant-queries"
import { useDebounce } from "@/hooks/use-debounce"
import TransactionModal from "@/components/transactions/TransactionModal"
import MerchantTransactionHistoryTable from "@/components/ewallet/MerchantTransactionHistoryTable"

export const Route = createFileRoute("/_member/e-wallet")({
	component: EwalletDashboardRouteComponent,
})

function EwalletDashboardRouteComponent(): JSX.Element {
	const location = useLocation()
	const { setPinAuthenticated, isPinAuthenticated } = useEwalletStore()

	const [page, setPage] = useState(1)
	const [limit, setLimit] = useState(10)
	const [statusFilter, setStatusFilter] = useState("all")
	const [searchQuery, setSearchQuery] = useState("")
	const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
	const [isModalOpen, setIsModalOpen] = useState(false)

	const debouncedSearch = useDebounce(searchQuery, 400)

	const isSubRoute = location.pathname !== "/e-wallet" && location.pathname !== "/e-wallet/"

	const dateStart = dateRange?.from ? dateRange.from.toISOString().split("T")[0] : undefined
	const dateEnd = dateRange?.to ? dateRange.to.toISOString().split("T")[0] : dateStart

	// Check status
	const { data: statusData, isLoading: isLoadingStatus } = useMerchantEwalletStatus()

	// Query dashboard data
	const {
		data: dashboardData,
		isLoading: isLoadingDashboard,
		refetch,
	} = useMerchantEwalletDashboard(
		{
			page,
			limit,
			status: statusFilter === "all" ? undefined : statusFilter,
			search: debouncedSearch || undefined,
			dateStart,
			dateEnd,
		},
		isPinAuthenticated && !isSubRoute,
	)

	const loginPinMutation = useLoginEwalletPinMutation()

	if (isSubRoute) {
		return <Outlet />
	}

	if (isLoadingStatus) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[40vh] space-y-3">
				<div className="w-8 h-8 rounded-full border-2 border-[#8dc31e] border-t-transparent animate-spin" />
				<p className="text-xs text-slate-500 font-medium">Memeriksa status dompet digital...</p>
			</div>
		)
	}

	if (statusData && !statusData.hasEwallet) {
		return (
			<div className="space-y-6 max-w-md mx-auto py-8 text-center">
				<RojaCard className="p-8 rounded-2xl border border-slate-200/80 space-y-4 shadow-sm">
					<div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#8dc31e]/10 text-[#8dc31e]">
						<Plus className="w-7 h-7" />
					</div>
					<div>
						<h3 className="text-lg font-bold text-slate-800">Aktivasi E-Wallet Merchant</h3>
						<p className="text-xs text-slate-500 mt-1">
							Anda belum mengaktifkan layanan dompet digital merchant.
						</p>
					</div>
					<Link to="/e-wallet/create">
						<Button className="w-full h-11 bg-[#8dc31e] hover:bg-[#8dc31e]/90 text-white font-bold text-xs rounded-xl cursor-pointer shadow-sm">
							Aktifkan Sekarang
						</Button>
					</Link>
				</RojaCard>
			</div>
		)
	}

	if (statusData && !statusData.isActive) {
		return (
			<div className="space-y-6 max-w-md mx-auto py-8 text-center">
				<RojaCard className="p-8 rounded-2xl border border-rose-200 space-y-4 shadow-sm">
					<h3 className="text-lg font-bold text-rose-600">E-Wallet Nonaktif</h3>
					<p className="text-xs text-slate-500">
						Layanan dompet digital merchant dinonaktifkan oleh administrator.
					</p>
					<Link to="/e-wallet/inactive">
						<Button variant="outline" className="w-full h-10 text-xs rounded-xl">
							Lihat Informasi
						</Button>
					</Link>
				</RojaCard>
			</div>
		)
	}

	if (!isPinAuthenticated) {
		return (
			<PinChallengeGate
				title="Masukkan PIN E-Wallet Merchant"
				description="Memastikan bahwa benar dompet ini milik merchant Anda."
				onSubmitPin={async (pin) => {
					await loginPinMutation.mutateAsync(pin)
					setPinAuthenticated(true)
					toast.success("PIN Terverifikasi", { description: "Dompet digital terbuka." })
				}}
			/>
		)
	}

	const transactions = dashboardData?.transactions ?? []
	const totalSaldo = dashboardData?.totalBalance ?? dashboardData?.totalSaldo ?? 0
	const meta = dashboardData?.meta

	return (
		<div className="space-y-6">
			<MerchantTransactionHistoryTable
				totalSaldo={totalSaldo}
				transactions={transactions}
				meta={meta}
				page={page}
				limit={limit}
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
					setStatusFilter("all")
					setDateRange(undefined)
					setPage(1)
				}}
				onPageChange={setPage}
				onLimitChange={(newLimit) => {
					setLimit(newLimit)
					setPage(1)
				}}
				onOpenModal={() => setIsModalOpen(true)}
				onRefetch={() => refetch()}
				isLoading={isLoadingDashboard}
			/>

			{/* Modal Transaksi */}
			<TransactionModal open={isModalOpen} onOpenChange={setIsModalOpen} />
		</div>
	)
}

export default Route
