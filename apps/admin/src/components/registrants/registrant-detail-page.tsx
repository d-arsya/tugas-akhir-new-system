import { useState, type JSX } from "react"
import { Link } from "@tanstack/react-router"

import AdminPageTitle, { CRUMB_LINK_CLASS } from "@/components/layout/admin-page-title"
import { useRegistrantDetail } from "@/hooks/use-registrants"
import { useSocietySettings } from "@/hooks/use-society-settings"

import RegistrantEditForm from "./registrant-edit-form"
import { takeRegistrantCreated } from "./registrant-flash"

const ALERT = "relative mb-[16px] rounded-[8px] border-0 px-[20px] py-[12px]"

type RegistrantDetailPageProps = { registrantId: number }

const RegistrantDetailPage = ({ registrantId }: RegistrantDetailPageProps): JSX.Element => {
	const { data: detail, dataUpdatedAt } = useRegistrantDetail(registrantId)
	const { data: settings } = useSocietySettings()
	const [created] = useState(() => takeRegistrantCreated(registrantId))

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
				<RegistrantEditForm key={`${detail.id}-${dataUpdatedAt}`} detail={detail} settings={settings} />
			) : null}
		</>
	)
}

export default RegistrantDetailPage
