import { useState, type JSX } from "react"

import AdminPageTitle from "@/components/layout/admin-page-title"
import LegacyTabs from "@/components/legacy/legacy-tabs"
import { useAlumniArchive } from "@/hooks/use-alumni"
import { INITIAL_TABLE_STATE, type TableState } from "@/lib/legacy-table"

import AlumniRowTable from "./alumni-row-table"
import AlumniYearTable from "./alumni-year-table"
import { useAlumniDelete } from "./use-alumni-delete"

type TabKey = "alumni" | "archive"

const TabLabel = ({ text }: { text: string }): JSX.Element => <span className="font-bold">{text}</span>

const AlumniIndex = (): JSX.Element => {
	const [tab, setTab] = useState<TabKey>("alumni")
	const [archiveOpened, setArchiveOpened] = useState(false)
	const [archiveState, setArchiveState] = useState<TableState>(INITIAL_TABLE_STATE)
	const archive = useAlumniArchive(archiveOpened)
	const remove = useAlumniDelete()

	const changeTab = (key: TabKey): void => {
		setTab(key)
		if (key === "archive") setArchiveOpened(true)
	}

	return (
		<>
			<AdminPageTitle
				title="Data Alumni - Pilih Tahun Kelulusan"
				breadcrumbs={[{ label: "Akademik", to: "/alumni" }, { label: "Alumni", to: "/alumni" }, { label: "Data Alumni" }]}
			/>

			<div className="mx-[-15px] flex min-h-[calc(100vh-216px)] flex-wrap">
				<div className="w-full min-w-0 flex-1 basis-0 px-[15px]">
					<LegacyTabs<TabKey>
						active={tab}
						onChange={changeTab}
						tabs={[
							{
								key: "alumni",
								label: <TabLabel text="Alumni" />,
								content: <AlumniYearTable onDelete={(year) => remove.ask({ kind: "year", year })} />,
							},
							{
								key: "archive",
								label: <TabLabel text="Archive" />,
								content: (
									<AlumniRowTable
										list={archive.data}
										state={archiveState}
										onStateChange={setArchiveState}
										processing={archive.isFetching}
										loaded={archive.isSuccess}
										onDelete={(row) => remove.ask({ kind: "alumni", id: row.id })}
										toolbar
										hideNameWhenOff={false}
									/>
								),
							},
						]}
					/>
				</div>
			</div>

			{remove.modal}
		</>
	)
}

export default AlumniIndex
