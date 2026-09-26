import { useState, type JSX } from "react"
import { Link } from "@tanstack/react-router"

import type { StudentTransactionDetail } from "@roja/types"

import LegacyButton, { legacyButtonClass } from "@/components/legacy/legacy-button"
import LegacyCard from "@/components/legacy/legacy-card"
import LegacyTextarea from "@/components/legacy/legacy-textarea"
import { useLegacySubmit } from "@/hooks/use-legacy-submit"
import { useUpdateTransactionNote } from "@/hooks/use-payments"

type PaymentNoteFormProps = { detail: StudentTransactionDetail; studentGradeId: string; onSaved: () => void }

const PaymentNoteForm = ({ detail, studentGradeId, onSaved }: PaymentNoteFormProps): JSX.Element => {
	const [note, setNote] = useState(detail.note ?? "")
	const [cancelNote, setCancelNote] = useState(detail.cancelNote ?? "")
	const cancelled = detail.status === "invalid"
	const mutation = useUpdateTransactionNote(detail.id)

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
			<LegacyCard>
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
