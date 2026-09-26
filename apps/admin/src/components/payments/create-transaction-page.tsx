import { useState, type JSX } from "react"
import { useNavigate } from "@tanstack/react-router"

import AdminPageTitle from "@/components/layout/admin-page-title"
import LegacyCard from "@/components/legacy/legacy-card"
import LegacyStudentCard from "@/components/legacy/legacy-student-card"
import { useCreateTransaction, useInvoiceSelection } from "@/hooks/use-payments"
import { useLegacySubmit } from "@/hooks/use-legacy-submit"
import { useStudentInvoiceDetail } from "@/hooks/use-student-invoices"

import PaymentForm, { type PaymentFormValues } from "./payment-form"
import PaymentRemoveModal from "./payment-remove-modal"
import PaymentSelectionTable from "./payment-selection-table"

const parseInvoiceIds = (raw: string | undefined): number[] => {
	if (raw === undefined || raw === "") return []
	return [...new Set(raw.split(",").map(Number).filter((id) => Number.isInteger(id) && id > 0))]
}

type CreateTransactionPageProps = { studentGradeId: string; invoices: string | undefined }

const CreateTransactionPage = ({ studentGradeId, invoices }: CreateTransactionPageProps): JSX.Element => {
	const navigate = useNavigate()
	const [removing, setRemoving] = useState<number | null>(null)

	const invoiceIds = parseInvoiceIds(invoices)
	const student = useStudentInvoiceDetail(Number(studentGradeId))
	const selection = useInvoiceSelection(Number(studentGradeId), invoiceIds)
	const create = useCreateTransaction()

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

			<div className="mx-[-15px] flex flex-wrap">
				<div className="w-full px-[15px] min-[992px]:w-3/12">
					{student.data ? <LegacyStudentCard student={student.data.student} className="" /> : null}
				</div>

				<div className="w-full px-[15px] min-[992px]:w-9/12">
					<LegacyCard>
						<div className="relative mb-[24px]">
							<div className="relative mt-[2px] inline-block text-[16px] font-bold">Buat Pembayaran</div>
							<p className="m-0! text-[var(--grey)]">Pastikan item tagihan sesuai dengan yang Anda pilih.</p>
						</div>

						<PaymentSelectionTable selection={selection.data} onRemove={setRemoving} />

						<PaymentForm
							studentGradeId={studentGradeId}
							total={selection.data?.total ?? 0}
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
