import { useState, type FormEvent, type JSX } from "react"
import { Link } from "@tanstack/react-router"

import type { StudentTransactionDetail } from "@roja/types"

import LegacyButton, { legacyButtonClass } from "@/components/legacy/legacy-button"
import LegacyCard from "@/components/legacy/legacy-card"
import LegacyTextarea from "@/components/legacy/legacy-textarea"
import { useUpdateTransactionNote } from "@/hooks/use-student-transactions"
import { useLegacySubmit } from "@/hooks/use-legacy-submit"

const TransactionNoteForm = ({ detail }: { detail: StudentTransactionDetail }): JSX.Element => {
	const [note, setNote] = useState(detail.note ?? "")
	const mutation = useUpdateTransactionNote(detail.id)

	const submit = useLegacySubmit({
		mutationFn: () => mutation.mutateAsync({ note }),
	})

	const onSubmit = (event: FormEvent<HTMLFormElement>): void => {
		event.preventDefault()
		submit.submit(undefined)
	}

	return (
		<form onSubmit={onSubmit} id="main-form">
			<LegacyCard>
				<div className="mx-[-15px] mb-[24px] flex flex-wrap">
					<div className="w-full px-[15px] min-[768px]:w-3/12">
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

				<div className="flex justify-end">
					<div>
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
