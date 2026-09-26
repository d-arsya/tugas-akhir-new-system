import type { JSX, ReactNode } from "react"

import type { InvoiceStudentCard } from "@roja/types"

import LegacyCard from "@/components/legacy/legacy-card"
import LegacyLabel from "@/components/legacy/legacy-label"

const BlockInfo = ({ label, value }: { label: string; value: ReactNode }): JSX.Element => (
	<div className="relative -mx-[8px] rounded-[8px] border-b border-[var(--bg-tertiary)] px-[8px] py-[12px] last:border-b-0 hover:bg-[var(--bg-tertiary)]">
		<div>{label}</div>
		<div className="text-[var(--grey)] italic">{value}</div>
	</div>
)

type LegacyStudentCardProps = { student: InvoiceStudentCard; className: string }

const LegacyStudentCard = ({ student, className }: LegacyStudentCardProps): JSX.Element => (
	<LegacyCard className={className}>
		<div className="relative mb-[12px] rounded-[10px]">
			<img
				src={student.photoUrl ?? "/assets/svg/etc/No-Photo.svg"}
				alt={student.fullName ?? ""}
				className="h-auto w-full rounded-[10px]"
			/>
			<LegacyLabel
				variant="solid-primary"
				className="absolute right-[-10px] bottom-[30px] min-h-0 min-w-0 px-[14px] py-[4px]"
			>
				{student.academicYear}
			</LegacyLabel>
		</div>

		<BlockInfo label="NISP" value={student.nis} />
		<BlockInfo label="Nama" value={student.fullName ?? "-"} />
		<BlockInfo
			label="Jenjang & Kelas"
			value={`${student.levelName ?? ""}, Kelas ${student.grade ?? ""} ${student.subGrade ?? ""}`}
		/>
		<BlockInfo label="Nama Orang Tua atau Wali" value={student.fatherName ?? "-"} />
	</LegacyCard>
)

export default LegacyStudentCard
