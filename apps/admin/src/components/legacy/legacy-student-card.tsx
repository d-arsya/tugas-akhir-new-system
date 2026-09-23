import type { JSX, ReactNode } from "react"

import type { InvoiceStudentCard } from "@roja/types"

import LegacyCard from "@/components/legacy/legacy-card"
import LegacyLabel from "@/components/legacy/legacy-label"

// The santri card down the left of every Pembayaran Santri detail page. Legacy repeats the
// same markup across five blades — `student-invoice/{detail,detail-bill,create-transaction,
// detail-history}.blade.php` and `student-transaction/detail.blade.php` — which differ only
// in the card's bottom margin and in where the caller reads the santri from.
//
// `detail-history` and `student-transaction/detail` read off `studentGradeWithTrashed`, so a
// payment made by a santri who was later removed still prints that santri's own details
// rather than the current roster's. That is the caller's concern: pass the right data.

// `.tbr_block_info` (app.css): 12px/8px padding pulled 8px into the card body, an 8px radius
// that only shows on hover, and a divider that the last row drops.
const BlockInfo = ({ label, value }: { label: string; value: ReactNode }): JSX.Element => (
	<div className="relative -mx-[8px] rounded-[8px] border-b border-[var(--bg-tertiary)] px-[8px] py-[12px] last:border-b-0 hover:bg-[var(--bg-tertiary)]">
		<div>{label}</div>
		{/* `> div:last-child` is grey and italic; `.tbr_weight-italic` swaps in the italic face */}
		<div className="text-[var(--grey)] italic">{value}</div>
	</div>
)

// `className` is required rather than optional: the blades give the card `mb-3` or `mb-4`
// depending on the page, and `exactOptionalPropertyTypes` rejects passing `undefined` through.
type LegacyStudentCardProps = { student: InvoiceStudentCard; className: string }

const LegacyStudentCard = ({ student, className }: LegacyStudentCardProps): JSX.Element => (
	<LegacyCard className={className}>
		{/* `.tbr_user_image` — relative, 12px below, the photo filling the width at a 10px radius */}
		<div className="relative mb-[12px] rounded-[10px]">
			<img
				src={student.photoUrl ?? "/assets/svg/etc/No-Photo.svg"}
				alt={student.fullName ?? ""}
				className="h-auto w-full rounded-[10px]"
			/>
			{/* `.tbr_label.tbr_label-solid-primary`, pinned `right: -10px; bottom: 30px` */}
			<LegacyLabel
				variant="solid-primary"
				className="absolute right-[-10px] bottom-[30px] min-h-0 min-w-0 px-[14px] py-[4px]"
			>
				{student.academicYear}
			</LegacyLabel>
		</div>

		<BlockInfo label="NISP" value={student.nis} />
		<BlockInfo label="Nama" value={student.fullName ?? "-"} />
		{/* Legacy concatenates without null guards: `level->name . ', Kelas ' . grade . ' ' . sub_grade` */}
		<BlockInfo
			label="Jenjang & Kelas"
			value={`${student.levelName ?? ""}, Kelas ${student.grade ?? ""} ${student.subGrade ?? ""}`}
		/>
		<BlockInfo label="Nama Orang Tua atau Wali" value={student.fatherName ?? "-"} />
	</LegacyCard>
)

export default LegacyStudentCard
