import type { JSX } from "react"
import { Link } from "@tanstack/react-router"

import { legacyButtonClass } from "@/components/legacy/legacy-button"

import CapabilityConfirmModal from "./capability-confirm-modal"

type CapabilityCostMissingModalProps = {
	open: boolean
	gradeLabel: string
	academicYear: string | null
	studentCostTo: string
	onCancel: () => void
}

const CapabilityCostMissingModal = ({
	open,
	gradeLabel,
	academicYear,
	studentCostTo,
	onCancel,
}: CapabilityCostMissingModalProps): JSX.Element => (
	<CapabilityConfirmModal
		open={open}
		variant="danger"
		title="Master biaya belum ditentukan!"
		footer={
			<>
				<button type="button" className={legacyButtonClass("light", "mr-[8px]")} onClick={onCancel}>
					Batal
				</button>{" "}
				<Link to={studentCostTo} className={legacyButtonClass("danger", "mr-[8px]")}>
					Ya, atur sekarang
				</Link>
			</>
		}
	>
		<div className="mb-[24px] px-[24px] text-center">
			Apakah Anda ingin menentukan master biaya untuk <span className="text-[var(--primary)]">{gradeLabel}</span> ditahun
			ajaran {academicYear}
		</div>
	</CapabilityConfirmModal>
)

export default CapabilityCostMissingModal
