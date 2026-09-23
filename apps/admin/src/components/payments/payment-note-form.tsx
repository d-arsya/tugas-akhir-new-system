import { useState, type JSX } from "react"
import { Link } from "@tanstack/react-router"

import type { StudentTransactionDetail } from "@roja/types"

import LegacyButton, { legacyButtonClass } from "@/components/legacy/legacy-button"
import LegacyCard from "@/components/legacy/legacy-card"
import LegacyTextarea from "@/components/legacy/legacy-textarea"
import { useLegacySubmit } from "@/hooks/use-legacy-submit"
import { useUpdateTransactionNote } from "@/hooks/use-payments"

// `student-invoice/detail-history.blade.php` 166-213 — the note, and the cancellation reason once
// the payment has been cancelled.
//
// `updateTransaction` (655-673) writes `cancel_note` **only** while the transaction is already
// `invalid`, and the server re-checks that, so the second textarea appearing is the whole
// condition. `cancel_note` is rendered as text and never as HTML: legacy interpolated it raw into
// a `data-original-title` with `data-html="true"` on the Dibatalkan tab, which is stored XSS (F-6).

type PaymentNoteFormProps = { detail: StudentTransactionDetail; studentGradeId: string; onSaved: () => void }

const PaymentNoteForm = ({ detail, studentGradeId, onSaved }: PaymentNoteFormProps): JSX.Element => {
	const [note, setNote] = useState(detail.note ?? "")
	const [cancelNote, setCancelNote] = useState(detail.cancelNote ?? "")
	const cancelled = detail.status === "invalid"
	const mutation = useUpdateTransactionNote(detail.id)

	// `default-ajax.js` — PNotify with `res.message`, then reload 1000 ms later
	const save = useLegacySubmit({
		mutationFn: () => mutation.mutateAsync(cancelled ? { note, cancelNote } : { note }),
		onDone: onSaved,
	})

	return (
		<form
			id="main-form"
			onSubmit={(event) => {
				event.preventDefault()
				save.submit(undefined)
			}}
		>
			{/* `.card.tbr_card > .card-body.p-4` */}
			<LegacyCard>
				{/* `.row.mb-4` with a right-aligned `.col-md-3` label column */}
				<div className="mx-[-15px] mb-[24px] flex flex-wrap">
					<div className="w-full px-[15px] text-right min-[768px]:w-3/12">
						<label htmlFor="note">Catatan bila diperlukan</label>
					</div>
					<div className="w-full px-[15px] min-[768px]:w-9/12">
						<LegacyTextarea
							id="note"
							name="note"
							rows={5}
							value={note}
							onChange={(event) => setNote(event.target.value)}
						/>
					</div>
				</div>

				{cancelled ? (
					<div className="mx-[-15px] mb-[24px] flex flex-wrap">
						{/* The blade's `for="note"` on this label is a copy-paste slip; pointed at the
						    right control here, because a duplicate `for` breaks the click target. */}
						<div className="w-full px-[15px] text-right min-[768px]:w-3/12">
							<label htmlFor="cancel_note">Alasan pembayaran ini dibatalkan</label>
						</div>
						<div className="w-full px-[15px] min-[768px]:w-9/12">
							<LegacyTextarea
								id="cancel_note"
								name="cancel_note"
								rows={5}
								value={cancelNote}
								onChange={(event) => setCancelNote(event.target.value)}
							/>
						</div>
					</div>
				) : null}

				{/* `div.d-flex.justify-content-end > div` — a block, so the newline between the buttons
				    renders as a space on top of `mr-2`. */}
				<div className="flex justify-end">
					<div>
						<Link
							to="/student-invoices/$studentGradeId"
							params={{ studentGradeId }}
							className={legacyButtonClass("light", "mr-[8px] inline-flex")}
						>
							Kembali
						</Link>{" "}
						<LegacyButton type="submit" variant="primary" className="inline-flex" loading={save.submitting}>
							Simpan
						</LegacyButton>
					</div>
				</div>
			</LegacyCard>
		</form>
	)
}

export default PaymentNoteForm
