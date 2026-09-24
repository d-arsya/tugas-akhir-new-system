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
	useCapabilityMassEditAccounts,
	useCapabilityMassEditPage,
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
import { MassSpecialConditionBanner } from "./-student-capability-mass-banner"

/**
 * Legacy `student-capability/mass-edit.blade.php` + `@massEdit` / `@massEditAccountList` /
 * `@massUpdate`.
 *
 * Same query-string selection as mass-create (`?students=1,2,3`, nowhere else), and the same
 * N=1 / N≥2 flip on Save. Two things are its own:
 *
 *  * the `special_condition` banner, when the selected santri do not all hold the same accounts;
 *  * `shownAccountancyIds` — legacy's `showed_id[]`. Every account the shared form displayed is
 *    posted, checked or not, and the server replicates everything *outside* that list onto the
 *    new capability. Omitting it would silently delete each santri's private accounts.
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

export const Route = createFileRoute("/_auth/student-capabilities/academic-years/$academicYearId/grades/$gradeId/mass-edit")({
	validateSearch: searchSchema,
	// `@massEdit`: an empty selection redirects back to the santri list
	beforeLoad: ({ search, params }) => {
		if (!search.students) {
			throw redirect({ to: "/student-capabilities/academic-years/$academicYearId/grades/$gradeId", params })
		}
	},
	component: StudentCapabilityMassEditPage,
})

function StudentCapabilityMassEditPage(): JSX.Element {
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

	const pageQuery = useCapabilityMassEditPage(academicYear, grade, studentGradeIds)
	const accountsQuery = useCapabilityMassEditAccounts(academicYear, grade, studentGradeIds, studentGradeIds.length > 0)
	const page = pageQuery.data
	const accounts = accountsQuery.data

	// Unlike mass-create, `mass-edit.blade.php:118` renders the Save button with no `tbr_disabled`
	const draft = useMassDraft(accounts)
	const [note, setNote] = useState("")
	const [confirming, setConfirming] = useState(false)

	const backTo = `/student-capabilities/academic-years/${academicYear}/grades/${grade}`
	useRejectedSelection(pageQuery.error ?? accountsQuery.error, backTo)

	/** `mass-edit.blade.php:87-96` — one santri posts to `@store`, two or more to `@massUpdate`. */
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
		return adminApi.massUpdateCapability(academicYear, grade, data)
	}, (result) => void navigate({ to: result.redirect }))

	const send = (): void => {
		setConfirming(false)
		submit.submit({
			studentGradeIds,
			...(note ? { note } : {}),
			items: draft.payload,
			shownAccountancyIds: draft.shownAccountancyIds,
		})
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
					// Legacy reuses `mass-create-page-header`, so the last crumb reads "Buat …" here too
					{ label: "Buat kesanggupan masal" },
				]}
			/>

			<MassSelectionCard students={page?.students ?? []} />

			{page?.specialCondition === true ? <MassSpecialConditionBanner /> : null}

			<div className="mx-[-15px] mt-[24px] flex flex-wrap">
				<div className="w-full min-w-0 flex-1 px-[15px]">
					<LegacyCard>
						<MassAccountTable draft={draft} onEdit={draft.openEditor} />

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

export default StudentCapabilityMassEditPage
