import { useState, type JSX } from "react"

import AdminPageTitle from "@/components/layout/admin-page-title"
import LegacyStickyToolbar, { BackIcon, RefreshIcon } from "@/components/legacy/legacy-sticky-toolbar"
import LegacyTabs from "@/components/legacy/legacy-tabs"
import { useForceSidebarCollapsed } from "@/hooks/use-force-sidebar-collapsed"
import { useReportOptions } from "@/hooks/use-reports"

import IncomeDetailPanel from "./income-detail-panel"
import IncomeRecapPanel from "./income-recap-panel"

type IncomeTab = "detail" | "recap"

const ReportIncomePage = (): JSX.Element => {
	useForceSidebarCollapsed()
	const { data: options } = useReportOptions()
	const [tab, setTab] = useState<IncomeTab>("detail")
	const [recapStarted, setRecapStarted] = useState(false)
	const [resetSignal, setResetSignal] = useState(0)

	const changeTab = (next: IncomeTab): void => {
		setTab(next)
		if (next === "recap") setRecapStarted(true)
	}

	return (
		<>
			<AdminPageTitle title="Laporan Pemasukkan" breadcrumbs={[{ label: "Laporan Pemasukkan" }]} />

			<div className="mx-[-15px] flex">
				<div className="w-full min-w-0 px-[15px]">
					<LegacyTabs
						active={tab}
						onChange={changeTab}
						tabs={[
							{ key: "detail", label: "Rincian", content: <IncomeDetailPanel options={options} resetSignal={resetSignal} /> },
							{
								key: "recap",
								label: "Rekapitulasi",
								content: <IncomeRecapPanel options={options} resetSignal={resetSignal} started={recapStarted} />,
							},
						]}
					/>
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

export default ReportIncomePage
