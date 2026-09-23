import { useState, type JSX } from "react"

import LegacyCard, { LegacyCardText, LegacyCardTitle } from "@/components/legacy/legacy-card"
import { ACADEMIC_DIVIDER_CLASS } from "@/components/grades/grade-card"
import SubGradeEditModal from "@/components/grades/sub-grade-edit-modal"
import SubGradeForm from "@/components/grades/sub-grade-form"
import SubGradeTable from "@/components/grades/sub-grade-table"

// Right card of `grade/index.blade.php` — `grade/partials/subgrade.blade.php`
const SubGradeCard = (): JSX.Element => {
	const [editingId, setEditingId] = useState<number | null>(null)

	return (
		// `.card.tbr_card.mb-0 > .card-body.p-4`
		<LegacyCard>
			<LegacyCardTitle>Tambah subkelas</LegacyCardTitle>
			<LegacyCardText>Silakan tambahkan subkelas baru pada form di bawah ini.</LegacyCardText>

			<SubGradeForm />

			<hr className={ACADEMIC_DIVIDER_CLASS} />

			<SubGradeTable onEdit={setEditingId} />

			<SubGradeEditModal subGradeId={editingId} onClose={() => setEditingId(null)} />
		</LegacyCard>
	)
}

export default SubGradeCard
