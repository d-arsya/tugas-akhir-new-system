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
	/** The "Kembali" target — level 3 for this year and grade. */
	backTo: { academicYearId: string; gradeId: string }
	onSubmit: (payload: StudentCostTermPayload) => void
	submitting: boolean
}

const PERIOD_OPTIONS = [
	{ value: "once", label: "Sekali", id: "once" },
	{ value: "monthly", label: "Bulanan", id: "monthly" },
]

/** `assets/svg/icons/reset.svg` — the icon-only `resetCreate()` / `resetEdit()` button. */
const ResetIcon = (): JSX.Element => (
	<img src="/assets/svg/icons/reset.svg" alt="reset" width={24} height={24} />
)

/**
 * `student-cost-term/create.blade.php` and `edit.blade.php`. The two blades are the same form
 * with three differences, all carried here:
 *
 *  1. the create page bolds every `help-block` label and the edit page does not;
 *  2. the edit page's Periode column is `.col` rather than `.col-lg-9`, and carries
 *     `tbr_disabled` when an approved StudentCapability exists (`periodLocked`);
 *  3. create posts and redirects to the **edit** page; edit patches and its `data-redirect=""`
 *     makes `default-ajax.js` do `window.location = ""`, i.e. reload the current URL.
 *
 * Legacy quirk **18** is fixed rather than reproduced: `resetEdit()` reads
 * `$('#hidden_month_month')`, and `edit/monthly.blade.php` renders **two** elements with that
 * id, so the first (the month *count*) wins and resetting a monthly item put the wrong number
 * in `Bulan ke`. Reset here restores the values the page loaded with.
 */
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
		// `.row.justify-content-center > .col-xl-9.col-lg-10`
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
							// create writes `.col-lg-9`, edit writes a bare `.col`. Beside a `col-lg-3`
							// label both come out at 75% from 992px up, which is all this breakpoint map
							// expresses — the kit stacks label and field below that either way.
							fieldCols={9}
						>
							{/* `.tbr_disabled` (app.css 468): half opacity and `pointer-events: none`,
							    with no `disabled` attribute — the radios stay in the DOM and keep their value */}
							{/* `div.mt-2` = 8px on the wrapper; the items themselves carry no top margin */}
							<div className={cn("mt-[8px]", detail.periodLocked && "pointer-events-none opacity-50")}>
								<LegacyRadioGroup
									name="period"
									value={values.period}
									options={PERIOD_OPTIONS}
									inline
									// `.custom-control-inline.mr-4` on the first radio: 24px, not the kit default 16px
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
										// `callMonth()` rebuilds the list and drops the selection
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

						{/* `.d-flex.justify-content-between` — reset on the left, Kembali/Simpan on the right */}
						<div className="flex justify-between">
							<button
								type="button"
								onClick={() => setValues(initial)}
								className={legacyButtonClass("light", mode === "edit" ? "mr-[8px] p-[8px]" : "mr-[8px]")}
							>
								<ResetIcon />
							</button>
							<div>
								{/* The edit blade sends you back with the **term's** academic_year_id */}
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
