import { useState, type JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

import AdminPageTitle from "@/components/layout/admin-page-title"
import LegacyStickyToolbar, { BackIcon, RefreshIcon } from "@/components/legacy/legacy-sticky-toolbar"
import ArrearPanel from "@/components/reports/arrear-panel"
import { useForceSidebarCollapsed } from "@/hooks/use-force-sidebar-collapsed"
import { useReportOptions } from "@/hooks/use-reports"

// Legacy /report/arrear (ReportArrearController@arrear → report/arrear.blade.php)
export const Route = createFileRoute("/_auth/reports/arrears")({
	component: ReportArrearsPage,
})

function ReportArrearsPage(): JSX.Element {
	useForceSidebarCollapsed()
	const { data: options } = useReportOptions()
	const [resetSignal, setResetSignal] = useState(0)

	return (
		<>
			<AdminPageTitle title="Laporan Tunggakan" breadcrumbs={[{ label: "Laporan Tunggakan" }]} />

			<div className="mx-[-15px] flex">
				<div className="w-full min-w-0 px-[15px]">
					{/* `.card > .card-body` (Porto card body restyled like `.tbr_card`) */}
					<div className="rounded-[12px] bg-[var(--bg-secondary)] p-[20px] shadow-[0px_8px_30px_0px_rgba(0,0,0,0.08)]">
						<ArrearPanel options={options} resetSignal={resetSignal} />
					</div>
				</div>
			</div>

			<LegacyStickyToolbar
				items={[
					{ key: "reset", color: "orange", icon: <RefreshIcon />, label: "Reset filter", onClick: () => setResetSignal((n) => n + 1) },
					{ key: "back", color: "info", icon: <BackIcon />, label: "Kembali ke Laporan", to: "/reports" },
				]}
			/>
		</>
	)
}

export default ReportArrearsPage
