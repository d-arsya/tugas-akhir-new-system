import { useMemo, useState, type JSX } from "react"

import type { AdminRegistrantRow } from "@roja/types"

import AdminPageTitle from "@/components/layout/admin-page-title"
import LegacyConfirmDelete from "@/components/legacy/legacy-confirm-delete"
import LegacyLabel from "@/components/legacy/legacy-label"
import { societySettingLookup } from "@/components/society/society-settings"
import { useRegistrantYearPage } from "@/hooks/use-registrants"
import { useDeleteRegistrant } from "@/hooks/use-registrants-write"
import { useSocietySettings } from "@/hooks/use-society-settings"

import RegistrantGroupActions from "./registrant-group-actions"
import RegistrantListTable from "./registrant-list-table"
import RegistrantYearTabs from "./registrant-year-tabs"

type RegistrantYearPageProps = { academicYearId: number }

const RegistrantYearPage = ({ academicYearId }: RegistrantYearPageProps): JSX.Element => {
	const { data: page } = useRegistrantYearPage(academicYearId)
	const { data: settings } = useSocietySettings()
	const [target, setTarget] = useState<AdminRegistrantRow | null>(null)
	const remove = useDeleteRegistrant(() => setTarget(null))

	const labels = useMemo(() => {
		const lookup = societySettingLookup(settings ?? [])
		return {
			name: lookup.status(1) ? lookup.label(1) : null,
			school: lookup.status(19) ? lookup.label(19) : null,
		}
	}, [settings])

	const levels = page?.levels ?? []
	const table = (tab: "new" | "approved" | "rejected"): JSX.Element => (
		<RegistrantListTable
			academicYearId={academicYearId}
			tab={tab}
			levels={levels}
			nameLabel={labels.name}
			schoolLabel={labels.school}
			onDelete={setTarget}
		/>
	)

	const year = page?.year ?? ""
	return (
		<>
			<AdminPageTitle
				title={`Data PSB - Tahun Ajaran ${year}`}
				titleAddon={
					<LegacyLabel variant="success" className="min-h-0 min-w-0 bg-[rgba(141,195,30,0.1)] px-[14px] py-[4px] text-[var(--secondary)]">
						{page?.total ?? ""}
					</LegacyLabel>
				}
				breadcrumbs={[
					{ label: "Akademik", dropdown: [{ label: "Akademik", to: "/registrants" }] },
					{ label: "PSB", to: "/registrants" },
					{ label: "Data PSB", to: "/registrants" },
					{ label: ` ${year}` },
				]}
			/>
			<RegistrantGroupActions academicYearId={academicYearId} />

			<RegistrantYearTabs
				tabs={[
					{ key: "new", label: "Baru", count: page?.newCount, variant: "primary", content: table("new") },
					{ key: "approved", label: "Diterima", count: page?.approveCount, variant: "success", content: table("approved") },
					{ key: "rejected", label: "Tidak Diterima", count: page?.rejectCount, variant: "danger", content: table("rejected") },
				]}
			/>

			<LegacyConfirmDelete
				open={target !== null}
				loading={remove.isPending}
				onCancel={() => setTarget(null)}
				onConfirm={() => {
					if (target !== null) remove.mutate(target.id)
				}}
			/>
		</>
	)
}

export default RegistrantYearPage
