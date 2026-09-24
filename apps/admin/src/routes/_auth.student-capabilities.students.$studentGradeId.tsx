import { useState, type JSX } from "react"
import { createFileRoute, Link, useRouter } from "@tanstack/react-router"

import type { CapabilityPublishResult } from "@roja/types"

import AdminPageTitle from "@/components/layout/admin-page-title"
import LegacyCard from "@/components/legacy/legacy-card"
import { BackArrowIcon } from "@/components/legacy/legacy-icons"
import { legacyNotify } from "@/components/legacy/legacy-notify"
import LegacyStudentCard from "@/components/legacy/legacy-student-card"
import CapabilityAlert from "@/components/student-capabilities/capability-alert"
import { GradeCrumb, HelpButton, Kembali, LIGHT_BACK_CLASS, YearCrumb } from "@/components/student-capabilities/capability-chrome"
import CapabilityHistoryTable from "@/components/student-capabilities/capability-history-table"
import CapabilityChangeModal from "@/components/student-capabilities/modals/capability-change-modal"
import CapabilityHelpModal from "@/components/student-capabilities/modals/capability-help-modal"
import { useLegacySubmit } from "@/hooks/use-legacy-submit"
import {
	useCapabilityAcademicYears,
	useCapabilityHistory,
	useCapabilityStudentPage,
	useReloadStudentCapability,
} from "@/hooks/use-student-capabilities"
import { adminApi } from "@/lib/api"
import { INITIAL_TABLE_STATE, type TableState } from "@/lib/legacy-table"

// Legacy student-capability/student-capability.blade.php (@studentCapability + @studentCapabilityList)
// — level 4, one santri's capability history, with `partials/student-capability-page-header`.
export const Route = createFileRoute("/_auth/student-capabilities/students/$studentGradeId")({
	component: StudentCapabilityHistoryPage,
})

// The DataTables search input's skin, reused for the page's own `#search_filter`
const SEARCH_CLASS =
	"h-[40px] w-full rounded-[6px] border-2 border-[var(--bg-form-border)]! bg-[var(--bg-form)] px-[16px] py-[6px] text-[12px] leading-[22.2px] text-[var(--body-txt-inverse)] outline-none placeholder:text-[var(--grey)] focus:border-[var(--secondary)]!"

function StudentCapabilityHistoryPage(): JSX.Element {
	const { studentGradeId: param } = Route.useParams()
	const studentGradeId = Number(param)
	const router = useRouter()
	const reload = useReloadStudentCapability()

	const detail = useCapabilityStudentPage(studentGradeId)
	const history = useCapabilityHistory(studentGradeId)
	const { data: years } = useCapabilityAcademicYears()

	const [state, setState] = useState<TableState>(INITIAL_TABLE_STATE)
	const [helpOpen, setHelpOpen] = useState(false)
	const [changeOpen, setChangeOpen] = useState(false)

	/**
	 * `create-capability.js` — PNotify, then `window.location.href = res.redirect` straight away
	 * (no 1000 ms wait on this script). Level 5 then flashes `session('add')` as a second notice,
	 * "kesanggupan berhasil dibuat"; the notice host outlives the navigation, so it is raised here.
	 */
	const follow = (data: CapabilityPublishResult): void => {
		legacyNotify.success("kesanggupan berhasil dibuat")
		void reload()
		if (data.redirect) router.history.push(data.redirect)
	}
	const create = useLegacySubmit({
		mutationFn: () => adminApi.createCapability(studentGradeId, { items: [] }),
		afterMs: 0,
		onDone: follow,
	})
	const change = useLegacySubmit({
		mutationFn: () => adminApi.changeCapability(studentGradeId),
		afterMs: 0,
		onDone: follow,
	})

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

						{/* `.row.mb-2` — help and back on the left, an empty `.col-md-5`, the search box right */}
						<div className="mx-[-15px] mb-[8px] flex flex-wrap">
							<div className="mb-[16px] w-full px-[15px] min-[768px]:mb-0 min-[768px]:w-1/3">
								<div className="mr-[8px] inline-flex">
									<HelpButton onClick={() => setHelpOpen(true)} />
								</div>
								<div className="inline-flex">
									{page ? (
										<Kembali>
											<Link
												to="/student-capabilities/academic-years/$academicYearId/grades/$gradeId"
												params={{ academicYearId: String(page.academicYearId), gradeId: String(page.gradeId) }}
												className={`${LIGHT_BACK_CLASS} mr-[8px]`}
											>
												<BackArrowIcon />
											</Link>
										</Kembali>
									) : null}
								</div>
							</div>
							<div className="w-full px-[15px] min-[768px]:w-5/12" />
							<div className="w-full px-[15px] min-[768px]:w-1/4">
								<input
									type="text"
									value={state.search}
									placeholder="Search"
									onChange={(event) => setState({ ...state, search: event.target.value, page: 1 })}
									className={SEARCH_CLASS}
								/>
							</div>
						</div>

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

export default StudentCapabilityHistoryPage
