import { useState, type FormEvent, type JSX } from "react"
import { Link } from "@tanstack/react-router"

import LegacyButton, { legacyButtonClass } from "@/components/legacy/legacy-button"
import LegacyCard from "@/components/legacy/legacy-card"
import LegacyTextarea from "@/components/legacy/legacy-textarea"
import { useUpdateInvoiceNote } from "@/hooks/use-student-invoices"

type InvoiceNoteFormProps = { invoiceId: number; studentGradeId: number; note: string | null }

const InvoiceNoteForm = ({ invoiceId, studentGradeId, note }: InvoiceNoteFormProps): JSX.Element => {
	const [value, setValue] = useState(note ?? "")
	const { submit, submitting } = useUpdateInvoiceNote(invoiceId)

	const onSubmit = (event: FormEvent<HTMLFormElement>): void => {
		event.preventDefault()
		submit({ note: value === "" ? null : value })
	}

	return (
		<form onSubmit={onSubmit}>
			<LegacyCard>
				<div className="mx-[-15px] mb-[24px] flex flex-wrap">
					<div className="w-full px-[15px] min-[768px]:w-1/4">
						<label htmlFor="note">Catatan bila diperlukan</label>
					</div>
					<div className="w-full px-[15px] min-[768px]:w-3/4">
						<LegacyTextarea id="note" name="note" rows={5} value={value} onChange={(event) => setValue(event.target.value)} />
					</div>
				</div>
				<div className="flex justify-end">
					<div>
						<Link
							to="/student-invoices/$studentGradeId"
							params={{ studentGradeId: String(studentGradeId) }}
							className={legacyButtonClass("light", "mr-[8px]")}
						>
							Kembali
						</Link>
						<LegacyButton type="submit" variant="primary" loading={submitting}>
							Simpan
						</LegacyButton>
					</div>
				</div>
			</LegacyCard>
		</form>
	)
}

export default InvoiceNoteForm
