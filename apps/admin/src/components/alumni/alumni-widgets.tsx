import type { JSX, ReactNode } from "react"
import { Link } from "@tanstack/react-router"

import type { AdminAlumniDetail } from "@roja/types"
import { cn } from "@roja/utils"

import { legacyButtonClass } from "@/components/legacy/legacy-button"
import LegacyCard, { LegacyCardText, LegacyCardTitle } from "@/components/legacy/legacy-card"
import { adminApi } from "@/lib/api"
import { RIPPLE_CLASS, triggerRipple } from "@/lib/ripple"

import { BackArrowIcon, PrintIcon } from "./alumni-icons"

// OWNER: AK-A. `alumni/partials/edit/widget-info.blade.php` and `widget-status.blade.php`, the two side cards
// of the alumni detail page. Both are `.card.tbr_card > .card-body` without `p-4`, i.e. bootstrap's 20px.

/** `.tbr_block_info` (app.css 2009-2030) */
const BlockInfo = ({ label, value }: { label: string; value: ReactNode }): JSX.Element => (
	<div className="relative -mx-[8px] rounded-[8px] border-b border-[var(--bg-tertiary)] px-[8px] py-[12px] last:border-b-0 hover:bg-[var(--bg-tertiary)]">
		<div>{label}</div>
		{/* `.tbr_weight-italic` */}
		<div className="text-[var(--grey)] italic">{value}</div>
	</div>
)

/**
 * The photo (or No-Photo.svg), then Nama / Awal Masuk / Lulus Pada. The blade's `registration_path` label
 * never renders: `tbr_alumnis` has no such column.
 */
export const AlumniWidgetInfo = ({ detail }: { detail: AdminAlumniDetail }): JSX.Element => (
	<LegacyCard className="mb-[16px] min-[992px]:mb-0" bodyClassName="p-[20px]">
		<div className="relative mb-[12px] rounded-[10px]">
			<img
				src={detail.widget.photoUrl ?? "/assets/svg/etc/No-Photo.svg"}
				alt={detail.widget.fullname ?? ""}
				className="h-auto w-full rounded-[10px]"
			/>
		</div>
		<BlockInfo label="Nama" value={detail.widget.fullname} />
		<BlockInfo label="Awal Masuk" value={detail.widget.academicYear} />
		<BlockInfo label="Lulus Pada" value={detail.widget.graduatedAt} />
	</LegacyCard>
)

// `.tbr_btn:not(.tbr_btn-back):not(.tbr_btn-light):hover svg path:not(.tbr_except), svg .tbr_white { fill: #fff }`
const ICON_BUTTON = "inline-flex p-[8px] [&:hover_path:not(.tbr-except)]:fill-white [&:hover_.tbr-white]:fill-white"

type AlumniWidgetStatusProps = { detail: AdminAlumniDetail; saving: boolean }

/** "Actions": back to the year (`.tbr_btn-light-info`), Print in a new tab (`.tbr_btn-light-danger`), Simpan. */
export const AlumniWidgetStatus = ({ detail, saving }: AlumniWidgetStatusProps): JSX.Element => (
	<LegacyCard bodyClassName="p-[20px]">
		<LegacyCardTitle>Actions</LegacyCardTitle>
		<LegacyCardText>Anda dapat mencetak data per alumni pada tombol print di bawah.</LegacyCardText>

		<div className="mt-[24px] flex items-center justify-between pt-[4px]">
			<div className="flex">
				{detail.graduationYear ? (
					<Link
						to="/alumni/graduation-year/$year"
						params={{ year: detail.graduationYear }}
						onMouseDown={triggerRipple}
						className={legacyButtonClass(
							"light",
							cn("mr-[8px] bg-[rgba(104,102,233,0.16)] text-[var(--info)] hover:bg-[var(--info)] hover:text-white", ICON_BUTTON, RIPPLE_CLASS),
						)}
					>
						<BackArrowIcon hoverWhite />
					</Link>
				) : (
					<Link
						to="/alumni"
						onMouseDown={triggerRipple}
						className={legacyButtonClass(
							"light",
							cn("mr-[8px] bg-[rgba(104,102,233,0.16)] text-[var(--info)] hover:bg-[var(--info)] hover:text-white", ICON_BUTTON, RIPPLE_CLASS),
						)}
					>
						<BackArrowIcon hoverWhite />
					</Link>
				)}
				<a
					href={adminApi.alumniPrintUrl(detail.id)}
					target="_blank"
					rel="noreferrer"
					onMouseDown={triggerRipple}
					className={legacyButtonClass("light-danger", cn(ICON_BUTTON, RIPPLE_CLASS))}
				>
					<PrintIcon />
				</a>
			</div>
			<button type="submit" disabled={saving} onMouseDown={triggerRipple} className={legacyButtonClass("primary", RIPPLE_CLASS)}>
				{saving ? (
					<span role="status" className="absolute h-[32px] w-[32px] rounded-full bg-white opacity-0 [animation:legacy-spinner-grow_0.75s_linear_infinite]" />
				) : null}
				<span className={saving ? "invisible" : undefined}>Simpan</span>
			</button>
		</div>
	</LegacyCard>
)
