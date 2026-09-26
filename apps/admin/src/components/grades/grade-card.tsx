import { useState, type JSX } from "react"

import LegacyCard, { LegacyCardText, LegacyCardTitle } from "@/components/legacy/legacy-card"
import GradeEditModal from "@/components/grades/grade-edit-modal"
import GradeForm from "@/components/grades/grade-form"
import GradeTable from "@/components/grades/grade-table"

export const ACADEMIC_DIVIDER_CLASS = "mt-[16px] mb-[22px] h-[2px] border-0 bg-[var(--bg-primary)]"

const GradeCard = (): JSX.Element => {
	const [editingId, setEditingId] = useState<number | null>(null)

	return (
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
