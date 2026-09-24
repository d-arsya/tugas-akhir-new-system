import type { JSX } from "react"
import { Link } from "@tanstack/react-router"

import { legacyButtonClass } from "@/components/legacy/legacy-button"

import CapabilityConfirmModal from "./capability-confirm-modal"

/**
 * `student-capability/partials/modal-student-cost.blade.php` — `#modalStudentCost`, opened
 * from the level-2 grade list when a grade has no applied cost term
 * (`Grade::studentCapabilityAction`, the `!$student_cost_term->exists()` branch).
 *
 * The **only** danger-tinted modal in the menu, and the only one whose confirm control is an
 * `<a href>` rather than a button: it navigates to Data Master ▸ Biaya Santri for that grade
 * instead of posting anything. `modal.js:1-30` filled `#tbr_grade` and the href on open, which
 * is why the grade label and the target arrive as props.
 */
type CapabilityCostMissingModalProps = {
	open: boolean
	/** `Kelas {label}` — the pink span in the body copy. */
	gradeLabel: string
	/** `$academic_year->year`, appended after "ditahun ajaran". */
	academicYear: string | null
	/** `route('studentCost.accounts', [academic_year, grade])` — the Data Master destination. */
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
		{/* `.mb-4.text-center.px-4` — note legacy's "ditahun" is one word */}
		<div className="mb-[24px] px-[24px] text-center">
			Apakah Anda ingin menentukan master biaya untuk <span className="text-[var(--primary)]">{gradeLabel}</span> ditahun
			ajaran {academicYear}
		</div>
	</CapabilityConfirmModal>
)

export default CapabilityCostMissingModal
