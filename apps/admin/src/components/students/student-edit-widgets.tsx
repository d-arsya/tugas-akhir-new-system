import type { JSX, ReactNode } from "react"
import { Link } from "@tanstack/react-router"

import type { AdminStudentDetail, AdminStudentOptions } from "@roja/types"
import { cn } from "@roja/utils"

import LegacyButton, { legacyButtonClass } from "@/components/legacy/legacy-button"
import LegacyCard, { LegacyCardText } from "@/components/legacy/legacy-card"
import LegacyInput from "@/components/legacy/legacy-input"
import LegacySelect from "@/components/legacy/legacy-select"
import { studentPrintUrl } from "@/hooks/use-students"
import { RIPPLE_CLASS, triggerRipple } from "@/lib/ripple"

const BlockInfo = ({ label, value }: { label: string; value: ReactNode }): JSX.Element => (
	<div className="relative -mx-[8px] rounded-[8px] border-b border-[var(--bg-tertiary)] px-[8px] py-[12px] last:border-b-0 hover:bg-[var(--bg-tertiary)]">
		<div>{label}</div>
		<div className="text-[var(--grey)] italic">{value}</div>
	</div>
)

export const StudentWidgetInfo = ({ detail, nis, onNisChange }: { detail: AdminStudentDetail; nis: string; onNisChange: (value: string) => void }): JSX.Element => (
	<LegacyCard className="mb-[16px] min-[992px]:mb-0">
		<div className="relative mb-[12px] rounded-[10px]">
			<img src={detail.photoUrl ?? "/assets/svg/etc/No-Photo.svg"} alt={detail.fullname ?? ""} className="h-auto w-full rounded-[10px]" />
		</div>
		<div className="mb-[16px]">
			<label htmlFor="nis" className="mb-[8px] inline-block">
				NISP
			</label>
			<LegacyInput type="number" name="nis" id="nis" autoComplete="off" spellCheck={false} min={1000000} max={9999999} value={nis} onChange={(event) => onNisChange(event.target.value)} />
		</div>
		<BlockInfo label="Email" value={detail.email ?? "-"} />
		<BlockInfo label="Mendaftar Pada" value={detail.createdAtDisplay} />
		<BlockInfo label="Sumber" value={detail.source ?? "-"} />
	</LegacyCard>
)

type Option = { value: string; label: string }

const Select = ({ value, options, placeholder, onChange, disabled = false }: { value: string; options: Option[]; placeholder: string; onChange?: (value: string) => void; disabled?: boolean }): JSX.Element => {
	const all = [{ value: "", label: placeholder }, ...options]
	const shown = all.find((option) => option.value === value) ?? all[0]
	return (
		<div className="mb-[16px]">
			<LegacySelect value={shown?.value ?? ""} options={all} onChange={onChange ?? (() => undefined)} mutedText={shown?.value === ""} disabled={disabled} />
		</div>
	)
}

const SVG_WHITE_ON_HOVER = "[&:hover_path:not(.tbr-except)]:fill-white [&:hover_.tbr-white]:fill-white"

const BackIcon = (): JSX.Element => (
	<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="block">
		<path className="tbr-except" d="M0,0H24V24H0Z" fill="none" fillRule="evenodd" />
		<rect className="tbr-white" width="2" height="14" rx="1" transform="translate(5 13) rotate(-90)" fill="#6866e9" opacity="0.3" />
		<path d="M3.707,15.707a1,1,0,0,1-1.414-1.414l6-6a1,1,0,0,1,1.383-.03l6,5.5a1,1,0,1,1-1.351,1.474L9.03,10.384Z" transform="translate(-3 21) rotate(-90)" fill="#6866e9" />
	</svg>
)

const PrintIcon = (): JSX.Element => (
	<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="block">
		<rect width="24" height="24" fill="none" />
		<path
			d="M16,17v4a1,1,0,0,1-1,1H9a1,1,0,0,1-1-1V17H5a2,2,0,0,1-2-2V8A2,2,0,0,1,5,6H19a2,2,0,0,1,2,2v7a2,2,0,0,1-2,2Zm1.5-6A1.5,1.5,0,1,0,16,9.5,1.5,1.5,0,0,0,17.5,11ZM10,14v6h4V14Z"
			fill="#f8374b"
			fillRule="evenodd"
		/>
		<rect className="tbr-white" width="8" height="2" rx="1" transform="translate(8 2)" fill="#f8374b" opacity="0.3" />
	</svg>
)

type StatusProps = {
	detail: AdminStudentDetail
	options: AdminStudentOptions | undefined
	subGrade: string
	onSubGradeChange: (value: string) => void
	majorName: string
	onMajorChange: (value: string) => void
	onSave: () => void
	saving: boolean
}

export const StudentWidgetStatus = ({ detail, options, subGrade, onSubGradeChange, majorName, onMajorChange, onSave, saving }: StatusProps): JSX.Element => {
	const years = (options?.academicYears ?? []).map((year) => ({ value: year.year ?? "", label: year.year ?? "" }))
	const levels = (options?.levels ?? []).map((level) => ({ value: String(level.id), label: level.name ?? "" }))
	const grades = [...(options?.grades ?? [])].reverse().map((grade) => ({ value: String(grade.label ?? ""), label: String(grade.label ?? "") }))
	const subGrades = [{ value: "undefined", label: "Undefined" }, ...(options?.subGrades ?? []).map((label) => ({ value: label, label }))]
	const majors = detail.majors.map((name) => ({ value: name, label: name }))

	return (
		<LegacyCard>
			<LegacyCardText>Anda dapat merubah subkelas dan jurusan jika diperlukan.</LegacyCardText>
			<Select value={detail.currentAcademicYear ?? ""} options={years} placeholder="Tahun ajaran" disabled />
			<Select value={detail.levelId === null ? "" : String(detail.levelId)} options={levels} placeholder="Jenjang" disabled />
			<Select value={detail.grade === null ? "" : String(detail.grade)} options={grades} placeholder="Kelas" disabled />
			<Select value={subGrade} options={subGrades} placeholder="Subkelas" onChange={onSubGradeChange} />
			<div className="pb-[4px] [&>div]:mb-[24px]">
				<Select value={majorName} options={majors} placeholder="Jurusan" onChange={onMajorChange} />
			</div>

			<hr className="my-[22px] h-[2px] border-0 bg-[var(--bg-primary)]" />

			<div className="mt-[24px] flex items-center justify-between pt-[4px]">
				<div className="flex">
					{detail.academicYearId !== null && detail.grade !== null && detail.levelId !== null ? (
						<Link
							to="/students/academic-years/$academicYearId/grades/$grade/levels/$levelId"
							params={{ academicYearId: String(detail.academicYearId), grade: String(detail.grade), levelId: String(detail.levelId) }}
							onMouseDown={triggerRipple}
							className={legacyButtonClass(
								"light",
								cn("mr-[8px] bg-[rgba(var(--info-rgb),0.16)] p-[8px] text-[var(--info)] hover:bg-[var(--info)] hover:text-white", SVG_WHITE_ON_HOVER, RIPPLE_CLASS),
							)}
						>
							<BackIcon />
						</Link>
					) : null}
					<a
						href={studentPrintUrl(detail.id)}
						target="_blank"
						rel="noreferrer"
						onMouseDown={triggerRipple}
						className={legacyButtonClass("light-danger", cn("p-[8px]", SVG_WHITE_ON_HOVER, RIPPLE_CLASS))}
					>
						<PrintIcon />
					</a>
				</div>
				<LegacyButton variant="primary" type="button" loading={saving} onClick={onSave}>
					Simpan
				</LegacyButton>
			</div>
		</LegacyCard>
	)
}
