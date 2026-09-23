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

/**
 * `#once-option` — `create/once.blade.php` and `edit/once.blade.php`.
 *
 * The two differ only in the due-date row's grid and in whether the `help-block` labels are
 * bold, so both branches key off `mode`:
 *   create — `.row > .col-md-8 > .d-flex.align-items-center`, tooltip inside the flex
 *   edit   — `.row.no-gutters.align-items-center > .col-10.pr-3` plus a `.col-2` for the tooltip
 */
const StudentCostOnceField = ({
	mode,
	onceBill,
	reminderOnce,
	onOnceBillChange,
	onReminderChange,
}: StudentCostOnceFieldProps): JSX.Element => {
	// The create blade bolds every `help-block`; the edit blade does not
	const bold = mode === "create"

	return (
		// `.row > .col-lg-10` around the card; edit inherits the same width
		<Row>
			<Col className="min-[992px]:max-w-[83.333333%] min-[992px]:flex-[0_0_83.333333%]">
				<CostCard className="mt-[16px]">
					{/* `.form-group` — bootstrap's 1rem bottom margin */}
					<div className="mb-[16px]">
						<HelpLabel bold={bold}>Tentukan tanggal jatuh tempo</HelpLabel>
						{bold ? (
							<Row>
								<Col className="min-[768px]:max-w-[66.666667%] min-[768px]:flex-[0_0_66.666667%]">
									<div className="flex items-center">
										{/* `.input-group.tbr_fix_ig.mr-2` */}
										<div className="mr-[8px] w-full">
											<StudentCostDueDateInput value={onceBill} onChange={onOnceBillChange} />
										</div>
										<CostTooltip content={DUE_TOOLTIP} placement="right" />
									</div>
								</Col>
							</Row>
						) : (
							<RowTight className="items-center">
								{/* `.col-10.pr-3` + `.col-2`, both at every width */}
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
						{/* `.row > .col-md-6 > .d-flex.align-items-center` on both pages */}
						<Row>
							<Col className="min-[768px]:max-w-[50%] min-[768px]:flex-[0_0_50%]">
								<div className="flex items-center">
									{/* `.input-group.mr-2` — a group with no addon, so just the control */}
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
