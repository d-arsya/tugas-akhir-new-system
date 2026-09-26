import { useState, type JSX } from "react"
import { Link, createFileRoute } from "@tanstack/react-router"

import AdminPageTitle, { CRUMB_LINK_CLASS } from "@/components/layout/admin-page-title"
import { takeRegistrantCreated } from "@/components/registrants/registrant-flash"
import RegistrantEditForm from "@/components/registrants/registrant-edit-form"
import { useRegistrantDetail } from "@/hooks/use-registrants"
import { useSocietySettings } from "@/hooks/use-society-settings"

// Legacy registrant/edit.blade.php (+ partials/edit/page-header.blade.php and alert.blade.php) — "Detail PSB".
export const Route = createFileRoute("/_auth/registrants/$registrantId")({
	component: Page,
})

// `.alert` (bootstrap: 16px below, 12px / 20px padding; app.css: no border, 8px radius) inside `div.mb-4`
const ALERT = "relative mb-[16px] rounded-[8px] border-0 px-[20px] py-[12px]"

function Page(): JSX.Element {
	const { registrantId } = Route.useParams()
	const id = Number(registrantId)
	const { data: detail, dataUpdatedAt } = useRegistrantDetail(id)
	const { data: settings } = useSocietySettings()
	// `session()->flash('success', true)` from the wizard's final save: shown on this visit only
	const [created] = useState(() => takeRegistrantCreated(id))

	const year = detail?.academicYear ?? ""
	return (
		<>
			<AdminPageTitle
				title="Detail PSB"
				breadcrumbs={[
					{ label: "Akademik", dropdown: [{ label: "PSB", to: "/registrants" }, { label: "Akademik", to: "/registrants" }] },
					{ label: "Data PSB", to: "/registrants" },
					{
						label: year,
						node: (
							<Link
								to="/registrants/academic-years/$academicYearId"
								params={{ academicYearId: String(detail?.academicYearId ?? "") }}
								className={CRUMB_LINK_CLASS}
							>
								{year}
							</Link>
						),
					},
					{ label: "Detail" },
				]}
			/>

			{created ? (
				<div className="mb-[24px]">
					<div role="alert" className={`${ALERT} bg-[rgba(40,175,82,0.1)] text-[var(--success)]`}>
						Anda berhasil menambahkan pendaftar baru dengan data di bawah ini.
					</div>
				</div>
			) : null}
			{detail?.registeredByAdmin === true ? (
				<div className="mb-[24px]">
					<div role="alert" className={`${ALERT} bg-[rgba(255,168,0,0.1)] text-[var(--warning)]`}>
						Anda juga dapat menambahkan akun untuk pendaftar yang sudah didaftarkan agar pendaftar bisa melihat pengumuman pada halaman PSB.
						Silakan pilih tab atau menu account di bawah dengan icon kunci.
					</div>
				</div>
			) : null}

			{detail && settings ? (
				// A fresh copy of the record after every save, like legacy's `location.reload()`
				<RegistrantEditForm key={`${detail.id}-${dataUpdatedAt}`} detail={detail} settings={settings} />
			) : null}
		</>
	)
}

export default Page
