import { useState, type FormEvent, type JSX } from "react"
import { Link } from "@tanstack/react-router"

import type { StudentTransactionDetail } from "@roja/types"

import LegacyButton, { legacyButtonClass } from "@/components/legacy/legacy-button"
import LegacyCard from "@/components/legacy/legacy-card"
import LegacyTextarea from "@/components/legacy/legacy-textarea"
import { useUpdateTransactionNote } from "@/hooks/use-student-transactions"
import { useLegacySubmit } from "@/hooks/use-legacy-submit"

// Legacy `student-transaction/detail.blade.php:148-173`. Owned by WS P1-C.
//
// The form PATCHes `studentInvoice.updateTransaction` (`StudentInvoiceController:649-667`),
// which is P1-B's endpoint — reached here through the shared api-client, not by opening
// their file.

const TransactionNoteForm = ({ detail }: { detail: StudentTransactionDetail }): JSX.Element => {
	const [note, setNote] = useState(detail.note ?? "")
	const mutation = useUpdateTransactionNote(detail.id)

	// `default-ajax.js` — PNotify with `res.message`, then reload 1000 ms later
	const submit = useLegacySubmit({
		mutationFn: () => mutation.mutateAsync({ note }),
	})

	const onSubmit = (event: FormEvent<HTMLFormElement>): void => {
		event.preventDefault()
		submit.submit(undefined)
	}

	return (
		<form onSubmit={onSubmit} id="main-form">
			{/* `.card.tbr_card > .card-body.p-4` */}
			<LegacyCard>
				{/* `.row.mb-4` */}
				<div className="mx-[-15px] mb-[24px] flex flex-wrap">
					<div className="w-full px-[15px] min-[768px]:w-3/12">
						<label htmlFor="note">Catatan bila diperlukan</label>
					</div>
					<div className="w-full px-[15px] min-[768px]:w-9/12">
						{/* `<textarea … rows="5">` */}
						<LegacyTextarea
							id="note"
							name="note"
							rows={5}
							value={note}
							onChange={(event) => setNote(event.target.value)}
						/>
					</div>
				</div>

				<div className="flex justify-end">
					<div>
						{/* `.btn.tbr_btn.tbr_btn-light.d-inline-flex.mr-2` */}
						<Link to="/student-transactions" className={legacyButtonClass("light", "mr-[8px]")}>
							Kembali
						</Link>
						<LegacyButton type="submit" variant="primary" loading={submit.submitting}>
							Simpan
						</LegacyButton>
					</div>
				</div>
			</LegacyCard>
		</form>
	)
}

export default TransactionNoteForm
