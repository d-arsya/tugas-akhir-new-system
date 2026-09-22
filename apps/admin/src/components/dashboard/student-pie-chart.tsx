import { lazy, Suspense, type JSX } from "react"

import type { DashboardPieItem } from "@roja/types"

// amCharts is large; keep it out of the main bundle
const PieChartCanvas = lazy(() => import("./pie-chart-canvas"))

type StudentPieChartProps = {
	data: DashboardPieItem[] | undefined
}

// Port of legacy dashboard/partials/pie-chart.blade.php
const StudentPieChart = ({ data }: StudentPieChartProps): JSX.Element => (
	<div className="rounded-[12px] bg-[var(--bg-secondary)] p-[20px] shadow-[0px_8px_30px_0px_rgba(0,0,0,0.08)]">
		<Suspense fallback={<div className="min-h-[350px]" />}>
			<PieChartCanvas data={data ?? []} />
		</Suspense>
		<div className="text-center">
			{/* "!" beats globals.css h4 (outside any @layer) */}
			<h4 className="mt-[24px]! mb-0! text-[16px]! leading-[1.4rem]!">Tahun Ajaran Berjalan</h4>
			<p className="mb-0 text-[var(--grey)]">
				Hover pada label atau partial pie untuk melihat jumlah per kelas.
			</p>
		</div>
	</div>
)

export default StudentPieChart
