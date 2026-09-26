import { useState, type JSX } from "react"
import { useRouter } from "@tanstack/react-router"

import type { CapabilityPublishResult } from "@roja/types"

import AdminPageTitle from "@/components/layout/admin-page-title"
import LegacyCard from "@/components/legacy/legacy-card"
import { legacyNotify } from "@/components/legacy/legacy-notify"
import LegacyStudentCard from "@/components/legacy/legacy-student-card"
import CapabilityHelpModal from "@/components/student-capabilities/modals/capability-help-modal"
import CapabilityChangeModal from "@/components/student-capabilities/modals/capability-change-modal"
import {
	useCapabilityAcademicYears,
	useCapabilityHistory,
	useCapabilityStudentPage,
	useChangeCapability,
	useCreateCapability,
	useReloadStudentCapability,
} from "@/hooks/use-student-capabilities"
import { INITIAL_TABLE_STATE, type TableState } from "@/lib/legacy-table"

import CapabilityAlert from "./capability-alert"
import { GradeCrumb, YearCrumb } from "./capability-chrome"
import CapabilityHistoryTable from "./capability-history-table"
import CapabilityHistoryToolbar from "./capability-history-toolbar"

const CapabilityHistoryPage = ({ studentGradeId }: { studentGradeId: number }): JSX.Element => {
	const router = useRouter()
	const reload = useReloadStudentCapability()

	const detail = useCapabilityStudentPage(studentGradeId)
	const history = useCapabilityHistory(studentGradeId)
	const { data: years } = useCapabilityAcademicYears()

	const [state, setState] = useState<TableState>(INITIAL_TABLE_STATE)
	const [helpOpen, setHelpOpen] = useState(false)
	const [changeOpen, setChangeOpen] = useState(false)

	const follow = (data: CapabilityPublishResult): void => {
		legacyNotify.success("kesanggupan berhasil dibuat")
		void reload()
		if (data.redirect) router.history.push(data.redirect)
	}
	const create = useCreateCapability(studentGradeId, follow)
	const change = useChangeCapability(studentGradeId, follow)

	const page = detail.data
	const year = years?.find((row) => row.id === page?.academicYearId)?.year ?? null

	return (
		<>
			<AdminPageTitle
				title="Kesanggupan"
				breadcrumbs={[
					{
						label: "…",
						dropdown: [
							{ label: "Pembayaran Santri", to: "/student-capabilities" },
							{ label: "Kesanggupan", to: "/student-capabilities" },
						],
					},
					...(page
						? [
								{ label: year ?? "", node: <YearCrumb academicYearId={page.academicYearId} year={year} /> },
								{
									label: `Kelas ${page.student.grade ?? ""}`,
									node: <GradeCrumb academicYearId={page.academicYearId} gradeId={page.gradeId} label={page.student.grade} />,
								},
							]
						: []),
					{ label: "Detail" },
				]}
			/>

			<div className="mx-[-15px] flex flex-wrap">
				<div className="w-full px-[15px] min-[992px]:w-1/4">
					{page ? <LegacyStudentCard student={page.student} className="mb-[16px] min-[992px]:mb-0" /> : null}
				</div>
				<div className="w-full min-w-0 px-[15px] min-[992px]:w-3/4">
					<LegacyCard className="mb-[16px] min-[992px]:mb-0">
						{page ? (
							<CapabilityAlert
								alert={page.alert}
								creating={create.submitting}
								onCreate={() => create.submit(undefined)}
								onChange={() => setChangeOpen(true)}
							/>
						) : null}

						<CapabilityHistoryToolbar
							page={page}
							search={state.search}
							onSearchChange={(search) => setState({ ...state, search, page: 1 })}
							onHelp={() => setHelpOpen(true)}
						/>

						<CapabilityHistoryTable
							studentGradeId={studentGradeId}
							rows={history.data}
							loaded={history.isSuccess || history.isError}
							processing={history.isFetching}
							state={state}
							onStateChange={setState}
						/>
					</LegacyCard>
				</div>
			</div>

			<CapabilityHelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />
			<CapabilityChangeModal
				open={changeOpen}
				submitting={change.submitting}
				onCancel={() => setChangeOpen(false)}
				onConfirm={() => change.submit(undefined)}
			/>
		</>
	)
}

export default CapabilityHistoryPage
