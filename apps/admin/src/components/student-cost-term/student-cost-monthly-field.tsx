import type { JSX } from "react"

import { cn } from "@roja/utils"

import { legacyControlClass } from "@/components/legacy/legacy-input"
import LegacySelect from "@/components/legacy/legacy-select"
import {
	Col,
	ColTight,
	CostCard,
	CostTooltip,
	HelpLabel,
	Row,
	RowTight,
} from "@/components/student-cost-term/student-cost-chrome"

type StudentCostMonthlyFieldProps = {
	mode: "create" | "edit"
	monthBill: string
	monthOfMonth: string
	dayOfMonth: string
	onMonthBillChange: (value: string) => void
	onMonthOfChange: (value: string) => void
	onDayOfChange: (value: string) => void
	reminderMonthly: string
	onReminderChange: (value: string) => void
}

const DUE_TOOLTIP = (
	<>
		Jika melewati tanggal ini dan tagihan belum dibayar maka, item tagihan akan diberikan indikator merah.
		<br /> Bulan yang diambil adalah bulan akhir pada setiap periodenya.
	</>
)
const REMINDER_TOOLTIP = "Tagihan akan muncul sesuai dengan hitungan hari yang sudah Anda tentukan."

const DAY_OPTIONS = [
	{ value: "", label: "Tanggal" },
	...Array.from({ length: 31 }, (_, i) => ({ value: String(i + 1), label: String(i + 1) })),
]

const StudentCostMonthlyField = ({
	mode,
	monthBill,
	monthOfMonth,
	dayOfMonth,
	onMonthBillChange,
	onMonthOfChange,
	onDayOfChange,
	reminderMonthly,
	onReminderChange,
}: StudentCostMonthlyFieldProps): JSX.Element => {
	const bold = mode === "create"
	const months = Number(monthBill)
	const monthOptions = [
		{ value: "", label: "Bulan ke" },
		...(Number.isFinite(months) && months > 0
			? Array.from({ length: Math.floor(months) }, (_, i) => ({ value: String(i + 1), label: String(i + 1) }))
			: []),
	]

	const monthKe = (
		<LegacySelect value={monthOfMonth} options={monthOptions} mutedText={monthOfMonth === ""} onChange={onMonthOfChange} />
	)
	const tanggal = (
		<LegacySelect value={dayOfMonth} options={DAY_OPTIONS} mutedText={dayOfMonth === ""} onChange={onDayOfChange} />
	)

	return (
		<Row>
			<Col className="min-w-0 flex-1">
				<CostCard className="mt-[16px]">
					<div className="mb-[16px]">
						<HelpLabel bold={bold} htmlFor="month_bill">
							Ditagihkan setiap
						</HelpLabel>
						<Row>
							<Col className="min-[768px]:max-w-[66.666667%] min-[768px]:flex-[0_0_66.666667%]">
								<div className="relative flex w-full flex-wrap items-stretch">
									<input
										type="number"
										min="1"
										max="99"
										id="month_bill"
										name="month_bill"
										spellCheck={false}
										value={monthBill}
										onChange={(event) => onMonthBillChange(event.target.value)}
										className={cn(legacyControlClass, "relative w-[1%] min-w-0 flex-auto rounded-r-none focus:z-[3]")}
									/>
									<span className="ml-[-2px] flex w-[115px] shrink-0 items-center justify-center rounded-r-[6px] border-2 border-[var(--bg-form-border)]! bg-[var(--bg-form)] px-[12px] py-[4px] text-[var(--grey)]">
										Bulan sekali
									</span>
								</div>
							</Col>
						</Row>
					</div>

					<div className="mb-[16px]">
						<HelpLabel bold={bold}>Tentukan tanggal jatuh tempo</HelpLabel>
						{bold ? (
							<RowTight>
								<ColTight className="mr-[8px] max-w-[75%] flex-[0_0_75%]">
									<Row>
										<Col className="mb-[8px] min-[768px]:mb-0 min-[768px]:max-w-[50%] min-[768px]:flex-[0_0_50%] min-[768px]:pr-[8px]">
											{monthKe}
										</Col>
										<Col className="min-[768px]:max-w-[50%] min-[768px]:flex-[0_0_50%] min-[768px]:pl-[8px]">
											{tanggal}
										</Col>
									</Row>
								</ColTight>
								<ColTight className="max-w-[16.666667%] flex-[0_0_16.666667%]">
									<CostTooltip content={DUE_TOOLTIP} className="mt-[8px]" />
								</ColTight>
							</RowTight>
						) : (
							<Row>
								<Col className="mb-[16px] max-w-[41.666667%] flex-[0_0_41.666667%] min-[992px]:mb-0 min-[992px]:max-w-[33.333333%] min-[992px]:flex-[0_0_33.333333%]">
									{monthKe}
								</Col>
								<Col className="max-w-[41.666667%] flex-[0_0_41.666667%] min-[992px]:max-w-[33.333333%] min-[992px]:flex-[0_0_33.333333%]">
									{tanggal}
								</Col>
								<Col className="max-w-[8.333333%] flex-[0_0_8.333333%]">
									<CostTooltip content={DUE_TOOLTIP} className="mt-[8px]" />
								</Col>
							</Row>
						)}
					</div>

					<div className="mb-[16px]">
						<HelpLabel bold={bold} htmlFor="reminder_monthly">
							Ingatkan sebelum jatuh tempo (hari)
						</HelpLabel>
						<Row>
							<Col className="min-[768px]:max-w-[41.666667%] min-[768px]:flex-[0_0_41.666667%]">
								<div className="flex items-center">
									<input
										type="number"
										min="1"
										id="reminder_monthly"
										name="reminder_monthly"
										spellCheck={false}
										value={reminderMonthly}
										onChange={(event) => onReminderChange(event.target.value)}
										className={`${legacyControlClass} mr-[8px]`}
									/>
									<CostTooltip content={REMINDER_TOOLTIP} placement="right" />
								</div>
							</Col>
						</Row>
					</div>
				</CostCard>
			</Col>
		</Row>
	)
}

export default StudentCostMonthlyField
