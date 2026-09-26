import { useState, type JSX } from "react"

import type { CapabilityMassPage } from "@roja/types"

import LegacyCard from "@/components/legacy/legacy-card"

const DropdownArrow = ({ open }: { open: boolean }): JSX.Element => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="24"
		height="24"
		viewBox="0 0 24 24"
		aria-hidden="true"
		className={`transition-transform duration-300 ease-[cubic-bezier(0.785,0.135,0.15,0.86)] ${open ? "rotate-180" : ""}`}
	>
		<path
			d="M12,16a1,1,0,0,1-.64-.23l-6-5A1,1,0,0,1,6.64,9.23L12,13.71l5.36-4.32A1.025,1.025,0,1,1,18.63,11l-6,4.83A1,1,0,0,1,12,16Z"
			fill="#ffa800"
		/>
	</svg>
)

type MassSelectionCardProps = { students: CapabilityMassPage["students"] }

const MassSelectionCard = ({ students }: MassSelectionCardProps): JSX.Element => {
	const [open, setOpen] = useState(false)

	return (
		<LegacyCard bodyClassName="p-[25px]">
			<div className="relative">
				<div className="mb-[8px] mt-[2px] inline-block text-[16px] font-bold">
					Santri yang dipilih
					<span className="pl-[4px] text-[var(--primary)]">({students.length})</span>
				</div>
				<p className="mb-0">
					Lihat santri yang sudah dipilih{" "}
					<button type="button" aria-expanded={open} onClick={() => setOpen((current) => !current)} className="cursor-pointer align-middle">
						<DropdownArrow open={open} />
					</button>
				</p>
			</div>
			{open ? (
				<LegacyCard bodyClassName="p-[24px]">
					{students.map((student, index) => (
						<div key={student.studentGradeId} className="ml-[8px] flex">
							<div className="mr-[24px]">{index + 1}</div>
							<div className="mr-[8px]">{student.fullName}</div>
							<div className="mr-[8px]">({student.nis})</div>
						</div>
					))}
				</LegacyCard>
			) : null}
		</LegacyCard>
	)
}

export default MassSelectionCard
