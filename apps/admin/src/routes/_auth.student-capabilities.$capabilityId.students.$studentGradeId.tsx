import { useCallback, useRef, useState, type JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

import type { CapabilityPublishResult } from "@roja/types"

import AdminPageTitle from "@/components/layout/admin-page-title"
import LegacyCard from "@/components/legacy/legacy-card"
import { legacyNotify } from "@/components/legacy/legacy-notify"
import LegacyStudentCard from "@/components/legacy/legacy-student-card"
import { DetailCrumb, GradeCrumb, YearCrumb } from "@/components/student-capabilities/capability-chrome"
import CapabilityItemTable, { type CapabilityItemSave } from "@/components/student-capabilities/capability-item-table"
import CapabilityItemToolbar from "@/components/student-capabilities/capability-item-toolbar"
import CapabilityPublishModal from "@/components/student-capabilities/modals/capability-publish-modal"
import { useLegacySubmit } from "@/hooks/use-legacy-submit"
import {
	useCapabilityAcademicYears,
	useCapabilityItemPage,
	useCapabilityItems,
	useReloadStudentCapability,
} from "@/hooks/use-student-capabilities"
import { adminApi } from "@/lib/api"

// Legacy student-capability/capability-item.blade.php (@studentCapabilityItem + @studentCapabilityItemList)
// — level 5, the line items of one capability, with `partials/capability-item-page-header`.
export const Route = createFileRoute("/_auth/student-capabilities/$capabilityId/students/$studentGradeId")({
	component: StudentCapabilityItemsPage,
})

function StudentCapabilityItemsPage(): JSX.Element {
	const { capabilityId: capParam, studentGradeId: sgParam } = Route.useParams()
	const capabilityId = Number(capParam)
	const studentGradeId = Number(sgParam)
	const reload = useReloadStudentCapability()

	const detail = useCapabilityItemPage(capabilityId, studentGradeId)
	const items = useCapabilityItems(capabilityId, studentGradeId)
	const { data: years } = useCapabilityAcademicYears()

	const [publishOpen, setPublishOpen] = useState(false)
	const [selectedCount, setSelectedCount] = useState(0)
	const draftRef = useRef<CapabilityItemSave | null>(null)
	const onSelectionChange = useCallback((count: number, payload: CapabilityItemSave) => {
		setSelectedCount(count)
		draftRef.current = payload
	}, [])

	// `update-ajax.js` — PNotify with `res.message`, then `window.location.reload()` 1000 ms later
	const save = useLegacySubmit({
		mutationFn: (payload: CapabilityItemSave) => adminApi.updateCapabilityItems(capabilityId, studentGradeId, payload),
		onDone: () => void reload(),
	})

	/**
	 * `item-capability.js` `specificForm` — PNotify, then reload 1000 ms later. The API also reports
	 * how many invoices were written, and a `warning` when that is zero (a grade with no cost terms
	 * publishes nothing); legacy had no way to say so, so the warning is raised as its own notice.
	 */
	const publish = useLegacySubmit({
		mutationFn: async () => {
			// Publishing agrees the *stored* line items, and a fresh capability has none until Simpan
			// runs — so the ticked lines are saved first rather than answering "pilih minimal 1".
			if (draftRef.current && draftRef.current.items.length > 0) {
				await adminApi.updateCapabilityItems(capabilityId, studentGradeId, draftRef.current)
			}
			return adminApi.publishCapability(capabilityId, studentGradeId)
		},
		successMessage: (data: CapabilityPublishResult) => {
			if (data.warning) legacyNotify.error(data.warning, "Peringatan!")
			return data.message
		},
		onDone: () => {
			setPublishOpen(false)
			void reload()
		},
	})

	const page = detail.data
	const year = years?.find((row) => row.id === page?.academicYearId)?.year ?? ""

	return (
		<>
			<AdminPageTitle
				title="Item Kesanggupan"
				breadcrumbs={[
					{
						label: "…",
						dropdown: [
							{ label: "Pembayaran Santri", to: "/student-capabilities" },
							{ label: "Kesanggupan", to: "/student-capabilities" },
							// Legacy links this one to level 2 (`studentCapability.grade`)
							page
								? { label: year, node: <YearCrumb academicYearId={page.academicYearId} year={year} inDropdown /> }
								: { label: year },
						],
					},
					...(page
						? [
								{
									label: `Kelas ${page.student.grade ?? ""}`,
									node: <GradeCrumb academicYearId={page.academicYearId} gradeId={page.gradeId} label={page.student.grade} />,
								},
								{ label: "Detail", node: <DetailCrumb studentGradeId={studentGradeId} /> },
							]
						: []),
					{ label: "Item Kesanggupan" },
				]}
			/>

			<div className="mx-[-15px] flex flex-wrap">
				<div className="w-full px-[15px] min-[992px]:w-1/4">
					{page ? <LegacyStudentCard student={page.student} className="mb-[16px] min-[992px]:mb-0" /> : null}
				</div>
				<div className="w-full min-w-0 px-[15px] min-[992px]:w-3/4">
					<LegacyCard className="mb-[16px] min-[992px]:mb-0">
						{page ? (
							<CapabilityItemToolbar
								page={page}
								canApprove={selectedCount > 0}
								onApprove={() => setPublishOpen(true)}
							/>
						) : null}
						<CapabilityItemTable
							rows={items.data}
							loaded={items.isSuccess || items.isError}
							processing={items.isFetching}
							editable={page?.editable ?? false}
							note={page?.capability.note ?? null}
							saving={save.submitting}
							onSave={save.submit}
							onSelectionChange={onSelectionChange}
						/>
					</LegacyCard>
				</div>
			</div>

			<CapabilityPublishModal
				open={publishOpen}
				submitting={publish.submitting}
				onCancel={() => setPublishOpen(false)}
				onConfirm={() => publish.submit(undefined)}
			/>
		</>
	)
}

export default StudentCapabilityItemsPage
