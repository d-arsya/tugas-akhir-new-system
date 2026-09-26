import { useState, type JSX } from "react"
import { Link } from "@tanstack/react-router"

import LegacyButton, { legacyButtonClass } from "@/components/legacy/legacy-button"
import LegacyCard from "@/components/legacy/legacy-card"
import LegacyCurrencyInput from "@/components/legacy/legacy-currency-input"
import LegacyInput from "@/components/legacy/legacy-input"
import LegacyTextarea from "@/components/legacy/legacy-textarea"
import { maskRupiah, unmaskRupiah } from "@/lib/legacy-currency"

export type PaymentFormValues = { desc: string; amount: string; note: string }

type PaymentFormProps = {
	studentGradeId: string
	total: number
	disabled: boolean
	submitting: boolean
	onSubmit: (values: PaymentFormValues) => void
}

const LABEL_CLASS = "mb-[8px] inline-block max-w-full text-[var(--grey)] font-bold"

const RP_PREPEND_CLASS =
	"mr-[-2px] flex w-[42px] shrink-0 items-center justify-center rounded-l-[6px] border-2 border-[var(--bg-form-border)]! bg-[var(--bg-form)] px-[12px] py-[4px] text-[#777777]"

const PaymentForm = ({ studentGradeId, total, disabled, submitting, onSubmit }: PaymentFormProps): JSX.Element => {
	const [desc, setDesc] = useState("")
	const [amount, setAmount] = useState("")
	const [note, setNote] = useState("")
	const [touched, setTouched] = useState(false)

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
			<LegacyCard
				className="mb-[24px]"
				bodyClassName="bg-[var(--bg-primary)]! shadow-[inset_0_0_5px_#e3e3e3]!"
			>
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

			<div className="flex justify-end">
				<div>
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
