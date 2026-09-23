import { useState, type JSX } from "react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"

import AdminPageTitle from "@/components/layout/admin-page-title"
import LegacyCard from "@/components/legacy/legacy-card"
import PaymentForm, { type PaymentFormValues } from "@/components/payments/payment-form"
import PaymentRemoveModal from "@/components/payments/payment-remove-modal"
import PaymentSelectionTable from "@/components/payments/payment-selection-table"
import LegacyStudentCard from "@/components/legacy/legacy-student-card"
import { useCreateTransaction, useInvoiceSelection } from "@/hooks/use-payments"
import { useLegacySubmit } from "@/hooks/use-legacy-submit"
import { useStudentInvoiceDetail } from "@/hooks/use-student-invoices"

// Legacy student-invoice/create-transaction.blade.php — record a payment against the
// invoices selected on the Tagihan tab.
//
// Legacy carried that selection in the global `idInvoice` session key, which was never bound to
// a santri: two tabs open on two santri shared one key, and whichever wrote last decided whose
// invoices the other one paid (fix F-5). The selection is in the URL here, so the page is
// reloadable, shareable and — because the server re-checks every id against `student_grade_id`
// before it writes — cannot be pointed at another santri by editing it.
const parseIds = (raw: unknown): number[] => {
	if (typeof raw !== "string" || raw === "") return []
	return [...new Set(raw.split(",").map(Number).filter((id) => Number.isInteger(id) && id > 0))]
}

export const Route = createFileRoute("/_auth/student-invoices/$studentGradeId/create-transaction")({
	// Every key stays optional, so navigating here does not force callers to pass `search` —
	// the Tagihan tab links to this route and belongs to another workstream.
	validateSearch: (search: Record<string, unknown>): { invoices?: string } =>
		typeof search["invoices"] === "string" ? { invoices: search["invoices"] } : {},
	component: CreateTransactionPage,
})

function CreateTransactionPage(): JSX.Element {
	const { studentGradeId } = Route.useParams()
	const { invoices } = Route.useSearch()
	const navigate = useNavigate()
	const [removing, setRemoving] = useState<number | null>(null)

	const invoiceIds = parseIds(invoices)
	const student = useStudentInvoiceDetail(Number(studentGradeId))
	const selection = useInvoiceSelection(Number(studentGradeId), invoiceIds)
	const create = useCreateTransaction()

	// `ajax-create-transaction.js`: PNotify with `res.message`, then `window.location = res.redirect`
	const save = useLegacySubmit({
		mutationFn: (values: PaymentFormValues) =>
			create.mutateAsync({
				studentGradeId: Number(studentGradeId),
				invoiceIds,
				desc: values.desc,
				amount: values.amount,
				note: values.note === "" ? null : values.note,
			}),
		successMessage: (data) => data.message,
		onDone: (data) => void navigate({ to: data.redirect }),
	})

	// `delete-invoice.js` drops one invoice and reloads; here the id leaves the URL and the
	// selection is re-priced, which also re-runs the arrears check on what is left.
	const removeInvoice = (invoiceId: number): void => {
		const next = invoiceIds.filter((id) => id !== invoiceId)
		void navigate({
			to: "/student-invoices/$studentGradeId/create-transaction",
			params: { studentGradeId },
			search: { invoices: next.join(",") },
			replace: true,
		})
	}

	return (
		<>
			<AdminPageTitle
				title="Buat Pembayaran"
				breadcrumbs={[
					{ label: "Pembayaran Santri", to: "/student-invoices" },
					{ label: "Tagihan", to: "/student-invoices" },
					{ label: "Buat Pembayaran" },
				]}
			/>

			{/* `.row` */}
			<div className="mx-[-15px] flex flex-wrap">
				{/* `.col-lg-3` */}
				<div className="w-full px-[15px] min-[992px]:w-3/12">
					{student.data ? <LegacyStudentCard student={student.data.student} className="" /> : null}
				</div>

				{/* `.col-lg-9` */}
				<div className="w-full px-[15px] min-[992px]:w-9/12">
					<LegacyCard>
						{/* `.tbr_card_intro.mb-4` */}
						<div className="relative mb-[24px]">
							<div className="relative mt-[2px] inline-block text-[16px] font-bold">Buat Pembayaran</div>
							<p className="m-0! text-[var(--grey)]">Pastikan item tagihan sesuai dengan yang Anda pilih.</p>
						</div>

						<PaymentSelectionTable selection={selection.data} onRemove={setRemoving} />

						<PaymentForm
							studentGradeId={studentGradeId}
							total={selection.data?.total ?? 0}
							// `{{ count($invoices) > 0 ? '':'disabled' }}` on the submit button
							disabled={(selection.data?.items.length ?? 0) === 0}
							submitting={save.submitting}
							onSubmit={save.submit}
						/>
					</LegacyCard>
				</div>
			</div>

			<PaymentRemoveModal
				open={removing !== null}
				onCancel={() => setRemoving(null)}
				onConfirm={() => {
					if (removing !== null) removeInvoice(removing)
					setRemoving(null)
				}}
			/>
		</>
	)
}

export default CreateTransactionPage
