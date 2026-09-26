import type { JSX, ReactNode } from "react"

import type { AdminRegistrantDetail } from "@roja/types"

import LegacyCard from "@/components/legacy/legacy-card"
import LegacyLabel from "@/components/legacy/legacy-label"

// `registrant/partials/edit/widget-info.blade.php` — `.card.tbr_card.mb-3.mb-lg-0`: the photo (or
// No-Photo.svg) with the path label pinned on it, then four `.tbr_block_info` rows.

const BlockInfo = ({ label, value }: { label: string; value: ReactNode }): JSX.Element => (
	<div className="relative -mx-[8px] rounded-[8px] border-b border-[var(--bg-tertiary)] px-[8px] py-[12px] last:border-b-0 hover:bg-[var(--bg-tertiary)]">
		<div>{label}</div>
		<div className="text-[var(--grey)] italic">{value}</div>
	</div>
)

// `.tbr_label-solid-secondary` / `-solid-primary`, pinned `right: -10px; bottom: 30px` by `.tbr_user_image .tbr_label`
const PATH_LABEL = "absolute right-[-10px] bottom-[30px] min-h-0 min-w-0 px-[14px] py-[4px]"

const RegistrantWidgetInfo = ({ detail }: { detail: AdminRegistrantDetail }): JSX.Element => (
	<LegacyCard className="mb-[16px] min-[992px]:mb-0">
		<div className="relative mb-[12px] rounded-[10px]">
			<img src={detail.photoUrl ?? "/assets/svg/etc/No-Photo.svg"} alt={detail.fullname ?? ""} className="h-auto w-full rounded-[10px]" />
			{detail.registrationPath === "reguler" ? (
				<LegacyLabel variant="solid-primary" className={`${PATH_LABEL} bg-[var(--secondary)] shadow-[0px_8px_10px_0px_rgba(141,195,30,0.25)]`}>
					{detail.registrationPath}
				</LegacyLabel>
			) : detail.registrationPath === "indent" ? (
				<LegacyLabel variant="solid-primary" className={PATH_LABEL}>
					{detail.registrationPath}
				</LegacyLabel>
			) : null}
		</div>

		<BlockInfo label="Nomor Pendaftar" value={detail.registrantId} />
		<BlockInfo label="Email" value={detail.email ?? "-"} />
		<BlockInfo label="Mendaftar Pada" value={detail.createdAtLabel} />
		<BlockInfo label="Jalur Pendaftaran" value={detail.registrationPath} />
	</LegacyCard>
)

export default RegistrantWidgetInfo
