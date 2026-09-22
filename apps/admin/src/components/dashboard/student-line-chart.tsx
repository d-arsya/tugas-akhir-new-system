import { lazy, Suspense, type JSX } from "react"

import type { DashboardChartItem, DashboardOptions } from "@roja/types"

import LegacySelect from "@/components/legacy/legacy-select"

// amCharts is large; keep it out of the main bundle
const LineChartCanvas = lazy(() => import("./line-chart-canvas"))

type StudentLineChartProps = {
	data: DashboardChartItem[] | undefined
	options: DashboardOptions | undefined
	grade: number
	onGradeChange: (grade: number) => void
}

// Port of legacy dashboard/partials/line-chart.blade.php
const StudentLineChart = ({ data, options, grade, onGradeChange }: StudentLineChartProps): JSX.Element => {
	const gradeOptions = (options?.grades ?? []).map((g) => ({
		value: String(g.label),
		label: `Kelas ${g.label}`,
	}))

	return (
		<div className="mb-[16px] min-[992px]:mb-0">
			<div className="rounded-[12px] bg-[var(--bg-secondary)] px-0 py-[20px] shadow-[0px_8px_30px_0px_rgba(0,0,0,0.08)]">
				<div className="flex items-center justify-end px-[20px]">
					<div className="min-w-[150px]">
						<LegacySelect
							variant="chart"
							value={String(grade)}
							options={gradeOptions}
							onChange={(value) => onGradeChange(Number(value))}
						/>
					</div>
				</div>
				<Suspense fallback={<div className="min-h-[380px]" />}>
					<LineChartCanvas data={data ?? []} />
				</Suspense>
				<div className="text-center">
					{/* "!" beats globals.css h4 (outside any @layer) */}
					<h4 className="mt-[8px]! mb-0! text-[16px]! leading-[1.4rem]!">5 Tahun Ajaran Terakhir</h4>
					<p className="mb-0 text-[var(--grey)]">Hover pada bullet untuk melihat jumlah per tahun.</p>
				</div>
			</div>
		</div>
	)
}

export default StudentLineChart
