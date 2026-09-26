import type { JSX } from "react"
import { Link } from "@tanstack/react-router"

import type { CapabilityItemPage } from "@roja/types"
import { cn } from "@roja/utils"

import { legacyButtonClass } from "@/components/legacy/legacy-button"
import { BackArrowIcon } from "@/components/legacy/legacy-icons"
import LegacyLabel from "@/components/legacy/legacy-label"
import { capabilityPrintUrl, useDownloadCapability } from "@/hooks/use-student-capabilities"

import { Kembali } from "./capability-chrome"
import { ApproveIcon, DownloadIcon, PrintIcon } from "./capability-icons"

const inert = (active: boolean): string | false => !active && "pointer-events-none cursor-default opacity-60"

type CapabilityItemToolbarProps = {
	page: CapabilityItemPage
	canApprove: boolean
	onApprove: () => void
}

const CapabilityItemToolbar = ({ page, canApprove, onApprove }: CapabilityItemToolbarProps): JSX.Element => {
	const { capability, student } = page
	const active = capability.status !== "changed"
	const download = useDownloadCapability(capability.id, student.studentGradeId)

	return (
		<div className="mx-[-15px] mb-[24px] flex flex-wrap items-center justify-between">
			<div className="w-full px-[15px] min-[1200px]:w-1/2">
				<div className="my-[8px] mr-[24px]">
					<div className="mb-[-3px]">
						<h4 className="m-0! mb-[4px]! inline-block text-[16px]! font-semibold! text-[var(--heading-txt-inverse)]!">
							Item Kesanggupan
						</h4>
						<LegacyLabel variant="info" className="mr-[8px] ml-[12px]">
							#{capability.ordinal}
						</LegacyLabel>
						{capability.status === "approve" ? (
							<LegacyLabel variant="success">Disepakati</LegacyLabel>
						) : capability.status === "disapprove" ? (
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
						href={capabilityPrintUrl(capability.id, student.studentGradeId)}
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
						onClick={() => download.mutate()}
						disabled={download.isPending}
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
