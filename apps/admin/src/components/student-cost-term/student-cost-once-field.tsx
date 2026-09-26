import type { JSX } from "react"

import { legacyControlClass } from "@/components/legacy/legacy-input"
import {
	Col,
	ColTight,
	CostCard,
	CostTooltip,
	HelpLabel,
	Row,
	RowTight,
} from "@/components/student-cost-term/student-cost-chrome"
import StudentCostDueDateInput from "@/components/student-cost-term/student-cost-due-date-input"

type StudentCostOnceFieldProps = {
	mode: "create" | "edit"
	onceBill: string
	reminderOnce: string
	onOnceBillChange: (value: string) => void
	onReminderChange: (value: string) => void
}

const DUE_TOOLTIP =
	"Jika melewati tanggal ini dan tagihan belum dibayar maka, item tagihan akan diberikan indikator merah."
const REMINDER_TOOLTIP = "Tagihan akan muncul sesuai dengan hitungan hari yang sudah Anda tentukan."

const StudentCostOnceField = ({
	mode,
	onceBill,
	reminderOnce,
	onOnceBillChange,
	onReminderChange,
}: StudentCostOnceFieldProps): JSX.Element => {
	const bold = mode === "create"

	return (
		<Row>
			<Col className="min-[992px]:max-w-[83.333333%] min-[992px]:flex-[0_0_83.333333%]">
				<CostCard className="mt-[16px]">
					<div className="mb-[16px]">
						<HelpLabel bold={bold}>Tentukan tanggal jatuh tempo</HelpLabel>
						{bold ? (
							<Row>
								<Col className="min-[768px]:max-w-[66.666667%] min-[768px]:flex-[0_0_66.666667%]">
									<div className="flex items-center">
										<div className="mr-[8px] w-full">
											<StudentCostDueDateInput value={onceBill} onChange={onOnceBillChange} />
										</div>
										<CostTooltip content={DUE_TOOLTIP} placement="right" />
									</div>
								</Col>
							</Row>
						) : (
							<RowTight className="items-center">
								<ColTight className="max-w-[83.333333%] flex-[0_0_83.333333%] pr-[16px]">
									<div className="mr-[8px]">
										<StudentCostDueDateInput value={onceBill} onChange={onOnceBillChange} />
									</div>
								</ColTight>
								<ColTight className="max-w-[16.666667%] flex-[0_0_16.666667%]">
									<CostTooltip content={DUE_TOOLTIP} placement="right" />
								</ColTight>
							</RowTight>
						)}
					</div>

					<div className="mb-[16px]">
						<HelpLabel bold={bold} htmlFor="reminder_once">
							Ingatkan sebelum jatuh tempo (hari)
						</HelpLabel>
						<Row>
							<Col className="min-[768px]:max-w-[50%] min-[768px]:flex-[0_0_50%]">
								<div className="flex items-center">
									<input
										type="number"
										min="1"
										id="reminder_once"
										name="reminder_once"
										spellCheck={false}
										value={reminderOnce}
										onChange={(event) => onReminderChange(event.target.value)}
										className={`${legacyControlClass} mr-[8px]`}
									/>
									<CostTooltip content={REMINDER_TOOLTIP} />
								</div>
							</Col>
						</Row>
					</div>
				</CostCard>
			</Col>
		</Row>
	)
}

export default StudentCostOnceField
