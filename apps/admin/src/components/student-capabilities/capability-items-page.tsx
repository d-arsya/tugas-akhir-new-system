import { useCallback, useRef, useState, type JSX } from "react"

import AdminPageTitle from "@/components/layout/admin-page-title"
import LegacyCard from "@/components/legacy/legacy-card"
import LegacyStudentCard from "@/components/legacy/legacy-student-card"
import CapabilityPublishModal from "@/components/student-capabilities/modals/capability-publish-modal"
import {
	useCapabilityAcademicYears,
	useCapabilityItemPage,
	useCapabilityItems,
	usePublishCapability,
	useReloadStudentCapability,
	useSaveCapabilityItems,
} from "@/hooks/use-student-capabilities"

import { DetailCrumb, GradeCrumb, YearCrumb } from "./capability-chrome"
import CapabilityItemTable, { type CapabilityItemSave } from "./capability-item-table"
import CapabilityItemToolbar from "./capability-item-toolbar"

type CapabilityItemsPageProps = { capabilityId: number; studentGradeId: number }

const CapabilityItemsPage = ({ capabilityId, studentGradeId }: CapabilityItemsPageProps): JSX.Element => {
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

	const save = useSaveCapabilityItems(capabilityId, studentGradeId, () => void reload())
	const publish = usePublishCapability(capabilityId, studentGradeId, () => draftRef.current, () => {
		setPublishOpen(false)
		void reload()
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

export default CapabilityItemsPage
