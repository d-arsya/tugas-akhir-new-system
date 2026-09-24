import { useMemo, useState, type JSX } from "react"
import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router"
import { z } from "zod"

import type { CapabilityItemRow, CapabilityMassWriteDto } from "@roja/types"

import AdminPageTitle, { CRUMB_LINK_CLASS } from "@/components/layout/admin-page-title"
import LegacyButton from "@/components/legacy/legacy-button"
import LegacyCard from "@/components/legacy/legacy-card"
import LegacyTextarea from "@/components/legacy/legacy-textarea"
import CapabilityAmountModal from "@/components/student-capabilities/modals/capability-amount-modal"
import CapabilityPublishMassModal from "@/components/student-capabilities/modals/capability-publish-mass-modal"
import {
	useCapabilityMassCreateAccounts,
	useCapabilityMassCreatePage,
	useCapabilityMassSubmit,
} from "@/hooks/use-capability-mass"
import { adminApi } from "@/lib/api"
import {
	MassAccountTable,
	MassSelectionCard,
	useMassDraft,
	useRejectedSelection,
	type MassDraft,
} from "./-student-capability-mass"

/**
 * Legacy `student-capability/mass-create.blade.php` + `@massCreate` / `@massCreateAccountList` /
 * `@massStore`.
 *
 * **The tick list travels in the query string.** `?students=1,2,3` is written by level 3's
 * "Buat atau ubah kesanggupan" redirect and read back here; there is no sessionStorage, no store
 * and no server-side session. Legacy's one global session key is how two tabs could write santri
 * A's amounts onto santri B.
 */
// TanStack's default search parser JSON-decodes each value, so a single santri (`?students=99005`)
// arrives as a **number** while two or more (`?students=1,2`) stay a string. Accept both, or the
// N=1 branch of the flip lands on the error boundary.
const searchSchema = z.object({
	students: z
		.union([z.string(), z.number()])
		.optional()
		.transform((value) => (value === undefined ? undefined : String(value))),
})

export const Route = createFileRoute("/_auth/student-capabilities/academic-years/$academicYearId/grades/$gradeId/mass-create")({
	validateSearch: searchSchema,
	// `@massCreate`: an empty selection redirects back to the santri list
	beforeLoad: ({ search, params }) => {
		if (!search.students) {
			throw redirect({ to: "/student-capabilities/academic-years/$academicYearId/grades/$gradeId", params })
		}
	},
	component: StudentCapabilityMassCreatePage,
})

function StudentCapabilityMassCreatePage(): JSX.Element {
	const { academicYearId, gradeId } = Route.useParams()
	const { students } = Route.useSearch()
	const navigate = useNavigate()

	const academicYear = Number(academicYearId)
	const grade = Number(gradeId)
	const studentGradeIds = useMemo(
		() =>
			(students ?? "")
				.split(",")
				.map((part) => Number(part.trim()))
				.filter((id) => Number.isInteger(id) && id > 0),
		[students],
	)

	const pageQuery = useCapabilityMassCreatePage(academicYear, grade, studentGradeIds)
	const accountsQuery = useCapabilityMassCreateAccounts(academicYear, grade, studentGradeIds.length > 0)
	const page = pageQuery.data
	const accounts = accountsQuery.data

	// `mass-create.blade.php:88` — the Save button starts disabled when any term is `type='option'`
	const draft = useMassDraft(accounts, (accounts ?? []).some((row) => row.type === "option"))
	const [note, setNote] = useState("")
	const [confirming, setConfirming] = useState(false)

	const backTo = `/student-capabilities/academic-years/${academicYear}/grades/${grade}`
	useRejectedSelection(pageQuery.error ?? accountsQuery.error, backTo)

	/**
	 * `mass-create.blade.php:68-77` — the form's `action` flips on the size of the selection.
	 * One santri posts to `@store` and gets an **unagreed** capability with **no** invoices; two
	 * or more post to `@massStore` and are approved and published in the same request. That is an
	 * explicit product decision, reproduced rather than smoothed over.
	 */
	const submit = useCapabilityMassSubmit((data: CapabilityMassWriteDto) => {
		if (data.studentGradeIds.length === 1) {
			return adminApi
				.createCapability(data.studentGradeIds[0] as number, {
					...(data.note ? { note: data.note } : {}),
					items: data.items,
				})
				.then((result) => ({
					message: result.message,
					redirect: result.redirect ?? backTo,
					studentsProcessed: 1,
					invoicesCreated: result.invoicesCreated,
					...(result.warning ? { warning: result.warning } : {}),
				}))
		}
		return adminApi.massCreateCapability(academicYear, grade, data)
	}, (result) => void navigate({ to: result.redirect }))

	const send = (): void => {
		setConfirming(false)
		submit.submit({ studentGradeIds, ...(note ? { note } : {}), items: draft.payload })
	}

	return (
		<>
			<AdminPageTitle
				title="Kesanggupan"
				breadcrumbs={[
					{ label: "…", dropdown: [{ label: "Pembayaran Santri", to: "/student-capabilities" }, { label: "Kesanggupan", to: "/student-capabilities" }] },
					{
						label: page?.academicYear.year ?? "",
						node: (
							<Link to="/student-capabilities/academic-years/$academicYearId" params={{ academicYearId }} className={CRUMB_LINK_CLASS}>
								{page?.academicYear.year ?? ""}
							</Link>
						),
					},
					{
						label: `Kelas ${page?.grade.label ?? ""}`,
						node: (
							<Link
								to="/student-capabilities/academic-years/$academicYearId/grades/$gradeId"
								params={{ academicYearId, gradeId }}
								className={CRUMB_LINK_CLASS}
							>
								Kelas {page?.grade.label ?? ""}
							</Link>
						),
					},
					{ label: "Buat kesanggupan masal" },
				]}
			/>

			<MassSelectionCard students={page?.students ?? []} />

			{/* `.row > .col > .card.tbr_card.mt-4 > .card-body.p-4` */}
			<div className="mx-[-15px] mt-[24px] flex flex-wrap">
				<div className="w-full min-w-0 flex-1 px-[15px]">
					<LegacyCard>
						<MassAccountTable draft={draft} onEdit={draft.openEditor} />

						{/* `<form id="main-form" class="mt-5">` */}
						<div className="mt-[48px]">
							<LegacyTextarea
								name="note"
								id="note"
								rows={3}
								value={note}
								onChange={(event) => setNote(event.target.value)}
								placeholder="Tambahkan catatan jika diperlukan"
								className="mb-[16px]"
							/>
							<div className="text-right">
								<Link
									to="/student-capabilities/academic-years/$academicYearId/grades/$gradeId"
									params={{ academicYearId, gradeId }}
									className="mr-[8px] inline-flex min-h-[40px] cursor-pointer items-center justify-center rounded-[6px] bg-[var(--bg-btn-light-inverse)] px-[16px] py-[7.52px] text-[12px] leading-[18px] tracking-[0.5px] text-[var(--grey)]"
								>
									Batal
								</Link>{" "}
								<LegacyButton
									variant="primary"
									id="tbr_btn_create_capability"
									loading={submit.submitting}
									// `mass-create.blade.php:88` starts the button `tbr_disabled` when any listed
									// term is `type='option'`; `mass-create-bulk-action.js` then re-evaluates on
									// every checkbox change and every modal save.
									disabled={draft.saveDisabled}
									onClick={() => setConfirming(true)}
								>
									Simpan
								</LegacyButton>
							</div>
						</div>
					</LegacyCard>
				</div>
			</div>

			<AmountEditor draft={draft} />
			<CapabilityPublishMassModal
				open={confirming}
				submitting={submit.submitting}
				percent={submit.submitting ? 100 : 0}
				onCancel={() => setConfirming(false)}
				onConfirm={send}
			/>
		</>
	)
}

/** The one shared amount modal — `components/student-capabilities/modals/capability-amount-modal.tsx`. */
const AmountEditor = ({ draft }: { draft: MassDraft }): JSX.Element | null => {
	const row: CapabilityItemRow | null = draft.editing
	if (row === null) return null
	return (
		<CapabilityAmountModal
			open
			name={row.name}
			periodLabel={row.periodLabel}
			type={row.type}
			max={row.maxAmount}
			step={row.step}
			value={draft.amounts.get(row.costTermId) ?? row.amount}
			options={row.options}
			onClose={draft.closeEditor}
			onSave={draft.saveAmount}
		/>
	)
}

export default StudentCapabilityMassCreatePage
