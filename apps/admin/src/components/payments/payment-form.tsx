import { useState, type JSX } from "react"
import { Link } from "@tanstack/react-router"

import LegacyButton, { legacyButtonClass } from "@/components/legacy/legacy-button"
import LegacyCard from "@/components/legacy/legacy-card"
import LegacyCurrencyInput from "@/components/legacy/legacy-currency-input"
import LegacyInput from "@/components/legacy/legacy-input"
import LegacyTextarea from "@/components/legacy/legacy-textarea"
import { maskRupiah, unmaskRupiah } from "@/lib/legacy-currency"

// `student-invoice/create-transaction.blade.php` 113-160 — Keterangan, Dibayar, Kembali, the
// note, and the two buttons.
//
// The hidden `total_amount`, `student_grade_id`, `invoice_id[]` and `amounts[]` inputs are gone:
// the server prices the selection from the locked invoice rows, so the browser no longer names
// any amount (fix F-8). "Kembali" was already display-only — `name="cashback"` sits on a disabled
// input, which browsers do not submit — and stays that way.

export type PaymentFormValues = { desc: string; amount: string; note: string }

type PaymentFormProps = {
	studentGradeId: string
	/** The billed total, used only to derive the change shown in "Kembali". */
	total: number
	disabled: boolean
	submitting: boolean
	onSubmit: (values: PaymentFormValues) => void
}

// `label.tbr_text-grey.font-weight-bold`
const LABEL_CLASS = "mb-[8px] inline-block max-w-full text-[var(--grey)] font-bold"

// The `Rp` prepend of `.input-group.tbr_fix_ig` (form.css 195-219): 42px wide, 2px border
const RP_PREPEND_CLASS =
	"mr-[-2px] flex w-[42px] shrink-0 items-center justify-center rounded-l-[6px] border-2 border-[var(--bg-form-border)]! bg-[var(--bg-form)] px-[12px] py-[4px] text-[#777777]"

const PaymentForm = ({ studentGradeId, total, disabled, submitting, onSubmit }: PaymentFormProps): JSX.Element => {
	const [desc, setDesc] = useState("")
	const [amount, setAmount] = useState("")
	const [note, setNote] = useState("")
	const [touched, setTouched] = useState(false)

	// `create-transaction.js` binds `keyup keypress blur` on **every** `input[type="text"]` on the
	// page, so Keterangan drives this field as much as Dibayar does — and until one of them is
	// touched the handler has never run, which is why legacy renders "Kembali" empty rather than 0.
	// `total = paid - total_amount`, shown only while positive, else 0. Overpayment is displayed
	// here and nowhere else: it is never submitted and never stored.
	const change = unmaskRupiah(amount) - total
	const cashback = touched ? (change > 0 ? maskRupiah(String(change)) : "0") : ""

	return (
		<form
			id="main-form"
			onSubmit={(event) => {
				event.preventDefault()
				onSubmit({ desc, amount, note })
			}}
		>
			{/* `.card.tbr_cost_card > .card-body.p-4`: `--bg-primary` behind an inset 5px #e3e3e3 shadow */}
			<LegacyCard
				className="mb-[24px]"
				bodyClassName="bg-[var(--bg-primary)]! shadow-[inset_0_0_5px_#e3e3e3]!"
			>
				{/* `.form-input.mb-2` */}
				<div className="mb-[8px]">
					<label className={LABEL_CLASS} htmlFor="desc">
						Keterangan
					</label>
					<LegacyInput
						type="text"
						id="desc"
						name="desc"
						value={desc}
						onChange={(event) => {
							setDesc(event.target.value)
							setTouched(true)
						}}
					/>
				</div>

				{/* `.form-input.row` with `.col-md-7` / `.col-md-5`: a 12-column split from 768px up */}
				<div className="-mx-[15px] flex flex-wrap">
					<div className="w-full px-[15px] md:w-[58.333333%]">
						<label className={LABEL_CLASS} htmlFor="paid_amount">
							Dibayar
						</label>
						<div className="relative flex w-full flex-wrap items-stretch">
							<span className={RP_PREPEND_CLASS}>Rp</span>
							<LegacyCurrencyInput
								id="paid_amount"
								name="amount"
								value={amount}
								onChange={(masked) => {
									setAmount(masked)
									setTouched(true)
								}}
								className="relative w-[1%] min-w-0 flex-auto rounded-l-none focus:z-[3]"
							/>
						</div>
					</div>
					{/* This label has no `.font-weight-bold` in the blade — the two are not a matched pair */}
					<div className="w-full px-[15px] md:w-[41.666667%]">
						<label className="mb-[8px] inline-block max-w-full text-[var(--grey)]" htmlFor="cashback_amount">
							Kembali
						</label>
						<div className="relative flex w-full flex-wrap items-stretch">
							<span className={RP_PREPEND_CLASS}>Rp</span>
							<LegacyInput
								type="text"
								id="cashback_amount"
								name="cashback"
								value={cashback}
								readOnly
								disabled
								className="relative w-[1%] min-w-0 flex-auto rounded-l-none"
							/>
						</div>
					</div>
				</div>
			</LegacyCard>

			<LegacyTextarea
				className="mb-[24px]"
				name="note"
				id="note"
				rows={5}
				placeholder="Catatan jika diperlukan"
				value={note}
				onChange={(event) => setNote(event.target.value)}
			/>

			{/* `div.d-flex.justify-content-end > div` — the inner div is a block, so the newline
			    between the two buttons survives as a ~3.73px gap on top of `mr-2`. */}
			<div className="flex justify-end">
				<div>
					{/*
					 * Legacy links back with `route('studentInvoice.edit', $studentGrade->student->id)` —
					 * a **student** id handed to a route bound to a StudentGrade. The two only agree for
					 * the earliest rows, so today this button walks the bendahara to another santri's
					 * invoices or to a 404. Corrected to the student_grade id the whole menu keys on.
					 */}
					<Link
						to="/student-invoices/$studentGradeId"
						params={{ studentGradeId }}
						className={legacyButtonClass("light", "mr-[8px] inline-flex")}
					>
						Kembali
					</Link>{" "}
					<LegacyButton type="submit" variant="primary" className="inline-flex" disabled={disabled} loading={submitting}>
						Simpan
					</LegacyButton>
				</div>
			</div>
		</form>
	)
}

export default PaymentForm
