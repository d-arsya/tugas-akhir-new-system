import { useState, type JSX } from "react"
import { Link } from "@tanstack/react-router"

import type { CapabilityItemPage } from "@roja/types"
import { cn } from "@roja/utils"

import { legacyButtonClass } from "@/components/legacy/legacy-button"
import { BackArrowIcon } from "@/components/legacy/legacy-icons"
import LegacyLabel from "@/components/legacy/legacy-label"
import { legacyNotify } from "@/components/legacy/legacy-notify"
import { adminApi } from "@/lib/api"
import { saveBlob } from "@/lib/download"
import { legacyErrors } from "@/lib/legacy-errors"

import { Kembali } from "./capability-chrome"
import { ApproveIcon, DownloadIcon, PrintIcon } from "./capability-icons"

/** `.tbr_print_action` (app.css 2624-2634): dimmed and inert unless `.tbr_active`. */
const inert = (active: boolean): string | false => !active && "pointer-events-none cursor-default opacity-60"

type CapabilityItemToolbarProps = {
	page: CapabilityItemPage
	canApprove: boolean
	onApprove: () => void
}

/**
 * `capability-item.blade.php:41-93` — the summary heading and the action row above the table.
 *
 * Print and download are `.tbr_print_action.tbr_active` except on a `changed` (superseded)
 * capability, where legacy drops `.tbr_active` and both go inert. "Telah Disepakati" exists only
 * while the capability is `disapprove`, starts `.tbr_disabled`, and is enabled once any line is
 * ticked (`callbackDT`).
 *
 * The page-header badges (`#{no}` and the status) are drawn here beside the heading: legacy puts
 * them inside `<header class="page-header">`, but `AdminPageTitle` takes its title as a string.
 */
const CapabilityItemToolbar = ({ page, canApprove, onApprove }: CapabilityItemToolbarProps): JSX.Element => {
	const { capability, student } = page
	const active = capability.status !== "changed"
	const [downloading, setDownloading] = useState(false)

	const download = async (): Promise<void> => {
		setDownloading(true)
		try {
			const file = await adminApi.downloadCapability(capability.id, student.studentGradeId)
			saveBlob(file.blob, file.fileName ?? "Kesanggupan.pdf")
		} catch (error) {
			legacyNotify.error(legacyErrors(error))
		} finally {
			setDownloading(false)
		}
	}

	return (
		// `.row.justify-content-between.align-items-center.flex-wrap.mb-4`
		<div className="mx-[-15px] mb-[24px] flex flex-wrap items-center justify-between">
			<div className="w-full px-[15px] min-[1200px]:w-1/2">
				<div className="my-[8px] mr-[24px]">
					<div className="mb-[-3px]">
						{/* `h4.tbr_summary_title.mt-0.mb-1` (app.css 2755: 16px) */}
						<h4 className="m-0! mb-[4px]! inline-block text-[16px]! font-semibold! text-[var(--heading-txt-inverse)]!">
							Item Kesanggupan
						</h4>
						{/* `capability-item-page-header.blade.php:3-10` */}
						<LegacyLabel variant="info" className="mr-[8px] ml-[12px]">
							#{capability.ordinal}
						</LegacyLabel>
						{capability.status === "approve" ? (
							<LegacyLabel variant="success">Disepakati</LegacyLabel>
						) : capability.status === "disapprove" ? (
							// The header writes a capital D, unlike the history list's badge
							<LegacyLabel variant="warning">Belum Disepakati</LegacyLabel>
						) : (
							<LegacyLabel variant="danger">Dirubah</LegacyLabel>
						)}
						<p className="mb-0 text-[var(--grey)]">
							<span>Sesuaikan dengan kesanggupan santri.</span>
						</p>
					</div>
				</div>
			</div>
			<div className="w-full px-[15px] min-[1200px]:w-1/2">
				<div className="mt-[16px] justify-end min-[768px]:flex min-[1200px]:mt-0">
					<Kembali>
						<Link
							to="/student-capabilities/students/$studentGradeId"
							params={{ studentGradeId: String(student.studentGradeId) }}
							className={legacyButtonClass("light", "mr-[16px] p-[8px]")}
						>
							<BackArrowIcon />
						</Link>
					</Kembali>
					<a
						href={adminApi.capabilityPrintUrl(capability.id, student.studentGradeId)}
						target="_blank"
						rel="noreferrer"
						title="Cetak"
						className={cn(legacyButtonClass("secondary", "mr-[16px] p-[8px]"), inert(active))}
					>
						<PrintIcon />
					</a>
					<button
						type="button"
						title="Unduh"
						onClick={() => void download()}
						disabled={downloading}
						className={cn(legacyButtonClass("danger", "mr-[16px] p-[8px]"), inert(active))}
					>
						<DownloadIcon />
					</button>
					{page.editable ? (
						<button
							type="button"
							onClick={onApprove}
							className={cn(
								legacyButtonClass("success", "px-[16px] py-[8px]"),
								!canApprove && "pointer-events-none opacity-50",
							)}
						>
							<ApproveIcon />
							Telah Disepakati
						</button>
					) : null}
				</div>
			</div>
		</div>
	)
}

export default CapabilityItemToolbar
