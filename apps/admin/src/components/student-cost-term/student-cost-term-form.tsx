import { useState, type JSX } from "react"
import { Link } from "@tanstack/react-router"

import { cn } from "@roja/utils"

import type { StudentCostTermDetail, StudentCostTermPayload } from "@roja/types"

import LegacyButton, { legacyButtonClass } from "@/components/legacy/legacy-button"
import LegacyCard, { LegacyCardText, LegacyCardTitle } from "@/components/legacy/legacy-card"
import LegacyFormRow from "@/components/legacy/legacy-form-row"
import LegacyRadioGroup from "@/components/legacy/legacy-radio-group"
import StudentCostMonthlyField from "@/components/student-cost-term/student-cost-monthly-field"
import StudentCostOnceField from "@/components/student-cost-term/student-cost-once-field"
import StudentCostTypeField from "@/components/student-cost-term/student-cost-type-field"
import {
	initialCostTermValues,
	toCostTermPayload,
	type StudentCostTermFormValues,
} from "@/components/student-cost-term/student-cost-term-values"

type StudentCostTermFormProps = {
	mode: "create" | "edit"
	detail: StudentCostTermDetail
	backTo: { academicYearId: string; gradeId: string }
	onSubmit: (payload: StudentCostTermPayload) => void
	submitting: boolean
}

const PERIOD_OPTIONS = [
	{ value: "once", label: "Sekali", id: "once" },
	{ value: "monthly", label: "Bulanan", id: "monthly" },
]

const ResetIcon = (): JSX.Element => (
	<img src="/assets/svg/icons/reset.svg" alt="reset" width={24} height={24} />
)

const StudentCostTermForm = ({
	mode,
	detail,
	backTo,
	onSubmit,
	submitting,
}: StudentCostTermFormProps): JSX.Element => {
	const initial = initialCostTermValues(detail.term)
	const [values, setValues] = useState<StudentCostTermFormValues>(initial)

	const set = <K extends keyof StudentCostTermFormValues>(
		key: K,
		value: StudentCostTermFormValues[K],
	): void => setValues((current) => ({ ...current, [key]: value }))

	return (
		<div className="mx-[-15px] flex flex-wrap justify-center">
			<div className="w-full px-[15px] min-[992px]:max-w-[83.333333%] min-[992px]:flex-[0_0_83.333333%] min-[1200px]:max-w-[75%] min-[1200px]:flex-[0_0_75%]">
				<LegacyCard bodyClassName="min-[992px]:px-[48px]">
					<LegacyCardTitle>{detail.accountancy.name}</LegacyCardTitle>
					<LegacyCardText>Sesuaikan dengan kebutuhan pokok.</LegacyCardText>

					<form
						autoComplete="off"
						onSubmit={(event) => {
							event.preventDefault()
							onSubmit(toCostTermPayload(values))
						}}
					>
						<StudentCostTypeField
							mode={mode}
							type={values.type}
							amount={values.amount}
							amounts={values.amounts}
							onTypeChange={(type) => set("type", type)}
							onAmountChange={(amount) => set("amount", amount)}
							onAmountsChange={(amounts) => set("amounts", amounts)}
						/>

						<LegacyFormRow
							label="Periode"
							hint="required"
							htmlFor="period"
							labelCols={3}
							fieldCols={9}
						>
							<div className={cn("mt-[8px]", detail.periodLocked && "pointer-events-none opacity-50")}>
								<LegacyRadioGroup
									name="period"
									value={values.period}
									options={PERIOD_OPTIONS}
									inline
									itemClassName="mt-0 first:mr-[24px]"
									onChange={(value) => set("period", value === "monthly" ? "monthly" : "once")}
								/>
							</div>

							<div>
								{values.period === "once" ? (
									<StudentCostOnceField
										mode={mode}
										onceBill={values.onceBill}
										reminderOnce={values.reminderOnce}
										onOnceBillChange={(value) => set("onceBill", value)}
										onReminderChange={(value) => set("reminderOnce", value)}
									/>
								) : (
									<StudentCostMonthlyField
										mode={mode}
										monthBill={values.monthBill}
										monthOfMonth={values.monthOfMonth}
										dayOfMonth={values.dayOfMonth}
										reminderMonthly={values.reminderMonthly}
										onMonthBillChange={(value) =>
											setValues((current) => ({ ...current, monthBill: value, monthOfMonth: "" }))
										}
										onMonthOfChange={(value) => set("monthOfMonth", value)}
										onDayOfChange={(value) => set("dayOfMonth", value)}
										onReminderChange={(value) => set("reminderMonthly", value)}
									/>
								)}
							</div>
						</LegacyFormRow>

						<div className="flex justify-between">
							<button
								type="button"
								onClick={() => setValues(initial)}
								className={legacyButtonClass("light", mode === "edit" ? "mr-[8px] p-[8px]" : "mr-[8px]")}
							>
								<ResetIcon />
							</button>
							<div>
								<Link
									to="/student-costs/$academicYearId/grades/$gradeId"
									params={backTo}
									className={legacyButtonClass("light", "mr-[8px]")}
								>
									Kembali
								</Link>{" "}
								<LegacyButton type="submit" variant="primary" loading={submitting}>
									Simpan
								</LegacyButton>
							</div>
						</div>
					</form>
				</LegacyCard>
			</div>
		</div>
	)
}

export default StudentCostTermForm
