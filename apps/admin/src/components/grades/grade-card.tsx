import { useState, type JSX } from "react"

import LegacyCard, { LegacyCardText, LegacyCardTitle } from "@/components/legacy/legacy-card"
import GradeEditModal from "@/components/grades/grade-edit-modal"
import GradeForm from "@/components/grades/grade-form"
import GradeTable from "@/components/grades/grade-table"

// `hr.tbr_divider_solid.mt-3` (app.css 486-490) over porto's `hr` (22px margins, border-less)
export const ACADEMIC_DIVIDER_CLASS = "mt-[16px] mb-[22px] h-[2px] border-0 bg-[var(--bg-primary)]"

// Left card of `grade/index.blade.php` — `grade/partials/grade.blade.php`
const GradeCard = (): JSX.Element => {
	// `editData(event, '#edit-modal-grade', url, id)` — one modal, refetched per row
	const [editingId, setEditingId] = useState<number | null>(null)

	return (
		// `.card.tbr_card.mb-3.mb-lg-0 > .card-body.p-4`
		<LegacyCard className="mb-[16px] min-[992px]:mb-0">
			<LegacyCardTitle>Tambah kelas</LegacyCardTitle>
			<LegacyCardText>Saat akan menambahkan kelas, pilih jenjang terlebih dahulu.</LegacyCardText>

			<GradeForm />

			<hr className={ACADEMIC_DIVIDER_CLASS} />

			<GradeTable onEdit={setEditingId} />

			<GradeEditModal gradeId={editingId} onClose={() => setEditingId(null)} />
		</LegacyCard>
	)
}

export default GradeCard
