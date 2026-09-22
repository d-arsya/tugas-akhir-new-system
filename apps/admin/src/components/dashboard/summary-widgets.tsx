import type { JSX } from "react"
import { Link } from "@tanstack/react-router"

import type { DashboardOptions, DashboardStats } from "@roja/types"
import { cn } from "@roja/utils"

import LegacySelect from "@/components/legacy/legacy-select"
import { RIPPLE_CLASS, triggerRipple } from "@/lib/ripple"

import ChartHeading from "./chart-heading"

type SummaryWidgetsProps = {
	stats: DashboardStats | undefined
	options: DashboardOptions | undefined
	academicYearId: number | undefined
	onAcademicYearChange: (academicYearId: number | undefined) => void
}

// Legacy `.tbr_widget` colour variants (public/assets/css/widget.css)
const WIDGET_VARIANT = {
	primary: "bg-[var(--primary)] shadow-[0px_8px_10px_rgba(228,0,126,0.25)]",
	secondary: "bg-[var(--secondary)] shadow-[0px_8px_10px_rgba(141,195,30,0.25)]",
	danger: "bg-[var(--danger)] shadow-[0px_8px_10px_rgba(248,55,75,0.25)]",
} as const

const ALL_YEARS = "all"

const PeopleIcon = (): JSX.Element => (
	<svg xmlns="http://www.w3.org/2000/svg" width="32.265" height="32.265" viewBox="0 0 32.265 32.265">
		<path d="M0,0H32.265V32.265H0Z" fill="none" fillRule="evenodd" />
		<path d="M22.477,17.788a4.033,4.033,0,1,1,4.033-4.033A4.033,4.033,0,0,1,22.477,17.788Zm-12.1-4.033a5.378,5.378,0,1,1,5.378-5.378A5.378,5.378,0,0,1,10.378,13.755Z" transform="translate(1.722 1.033)" fill="#fff" opacity="0.3" />
		<path d="M23.663,15.69c4.58.05,8.319,2.365,8.6,7.259a.685.685,0,0,1-.729.807H26.35A13.384,13.384,0,0,0,23.663,15.69ZM0,22.678C.522,16.262,5.73,13,12.077,13,18.514,13,23.8,16.083,24.2,22.68a.923.923,0,0,1-1.01,1.076H.978A1.488,1.488,0,0,1,0,22.678Z" transform="translate(0 4.477)" fill="#fff" />
	</svg>
)

type WidgetProps = { variant: keyof typeof WIDGET_VARIANT; count: number | undefined; label: string }

const Widget = ({ variant, count, label }: WidgetProps): JSX.Element => (
	// Bootstrap col-xl-4 col-lg-4 col-md-6 col-sm-6 col-12 (bootstrap breakpoints, not Tailwind's)
	<div className="w-full px-[15px] min-[576px]:w-1/2 min-[992px]:w-1/3">
		<Link
			to="/registrants"
			onClick={triggerRipple}
			className={cn(
				"mb-[16px] flex h-auto w-full flex-row flex-nowrap items-center rounded-[12px] bg-[url('/assets/svg/etc/Widget-Bg.svg')] bg-contain bg-right-bottom bg-no-repeat p-[25px] text-[var(--light)] hover:text-[var(--light)] hover:shadow-none focus:shadow-none active:shadow-none",
				RIPPLE_CLASS,
				WIDGET_VARIANT[variant],
			)}
		>
			<div className="mr-[20px] flex h-[60px] w-[60px] items-center justify-center rounded-[10px] bg-white/10">
				<PeopleIcon />
			</div>
			<div>
				<div className="mt-[7px] mb-[8px] text-[35px] font-bold">{count ?? 0}</div>
				<div>{label}</div>
			</div>
		</Link>
	</div>
)

// Port of legacy dashboard/partials/summary-widgets.blade.php
const SummaryWidgets = ({ stats, options, academicYearId, onAcademicYearChange }: SummaryWidgetsProps): JSX.Element => {
	const yearOptions = [
		{ value: ALL_YEARS, label: "Semua Tahun Ajaran" },
		...(options?.academicYears ?? []).map((ay) => ({ value: String(ay.id), label: ay.year })),
	]

	return (
		<>
			<div className="mx-[-15px] mb-[8px] flex flex-wrap items-center justify-between">
				<div className="w-full px-[15px] min-[992px]:w-2/3">
					<ChartHeading icon="primary" title="Statistik Pendaftaran Santri Baru" />
				</div>
				<div className="w-full px-[15px] min-[992px]:w-1/3">
					<div className="block min-[992px]:flex min-[992px]:justify-end">
						<div className="my-[16px] min-[992px]:my-0">
							<LegacySelect
								variant="summary"
								// Legacy options carry title="Select", which select2 renders in grey
								mutedText
								value={academicYearId === undefined ? ALL_YEARS : String(academicYearId)}
								options={yearOptions}
								onChange={(value) => onAcademicYearChange(value === ALL_YEARS ? undefined : Number(value))}
								className="min-[992px]:w-[220px]"
							/>
						</div>
					</div>
				</div>
			</div>

			<div className="mx-[-15px] flex flex-wrap">
				<Widget variant="primary" count={stats?.total} label="Total pendaftar" />
				<Widget variant="secondary" count={stats?.approve} label="Total diterima" />
				<Widget variant="danger" count={stats?.reject} label="Total tidak diterima" />
			</div>
		</>
	)
}

export default SummaryWidgets
