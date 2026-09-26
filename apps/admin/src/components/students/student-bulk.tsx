import { useRef, useState, type JSX } from "react"

import { cn } from "@roja/utils"

import { legacyButtonClass } from "@/components/legacy/legacy-button"
import { legacyNotify } from "@/components/legacy/legacy-notify"
import LegacySelect from "@/components/legacy/legacy-select"
import { useStudentBulk, useStudentMajorUpdate, useStudentStatusUpdate, useStudentSubGradeUpdate } from "@/hooks/use-students"
import { legacyErrors } from "@/lib/legacy-errors"
import { RIPPLE_CLASS, triggerRipple } from "@/lib/ripple"

import StudentListingModal, { CONTENTS_KBM, type ListedStudent } from "./student-listing-modal"
import { noticeLines } from "./student-ui"

// `student/partials/listing-student/bulk-action.blade.php` + the six `listing-confirm-*` modals, driven by
// `edit-general.js` (`drawStudentData*`, `getData`) and `bulk-action-ajax.js` (`bulkActionSubmit`).
//
// Fixed legacy bug (user request, 2026-09-26): the Subkelas modal's form shared the id `stay-grades-form` with
// the Tinggal Kelas modal (included first), so it posted Tinggal Kelas. Here it posts `update-sub-grade`.

type Modal = "next" | "graduate" | "stay" | "major" | "subGrade" | "status"

type Props = {
	/** The ticked rows of the current page, in table order (`getData()`). */
	selected: ListedStudent[]
	/** Lulus replaces Naik Kelas at the highest grade (`$max_grade == $student->grade`). */
	isMaxGrade: boolean
	majors: string[]
	subGrades: string[]
	/** The table reloads after a write, which unticks everything (`resetAllcheckbox`). */
	onDone: () => void
}

const SELECT_WITH_BUTTON = "mr-[24px] mb-[16px] flex"

// `.tbr_select2_with_btn .input-group-append` (app.css 2586-2606)
const APPEND_CLASS = cn(
	"z-[3] ml-[-2px] flex w-[40px] max-w-[40px] cursor-pointer items-center justify-center rounded-r-[6px] border-0 bg-[var(--primary)] px-0 shadow-[0px_8px_10px_rgba(var(--primary-rgb),0.25)] transition-all duration-300 hover:shadow-none",
	RIPPLE_CLASS,
)

const AppendArrow = (): JSX.Element => (
	<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="block">
		<path d="M0,0H24V24H0Z" fill="none" fillRule="evenodd" />
		<path
			d="M6.262,17.648a1,1,0,1,1-1.524-1.3l8.5-10a1,1,0,0,1,1.426-.1l4.5,4a1,1,0,1,1-1.329,1.495L14.1,8.427Z"
			transform="translate(24 24) rotate(180)"
			fill="#fff"
		/>
	</svg>
)

const withPlaceholder = (placeholder: string, options: Array<{ value: string; label: string }>): Array<{ value: string; label: string }> => [
	{ value: "", label: placeholder },
	...options,
]

const StudentBulk = ({ selected, isMaxGrade, majors, subGrades, onDone }: Props): JSX.Element => {
	const bulk = useStudentBulk()
	const updateMajor = useStudentMajorUpdate()
	const updateStatus = useStudentStatusUpdate()
	const updateSubGrade = useStudentSubGradeUpdate()

	const [modal, setModal] = useState<Modal | null>(null)
	const [list, setList] = useState<ListedStudent[] | { notice: string }>([])
	const [major, setMajor] = useState("")
	const [subGrade, setSubGrade] = useState("")
	const [blocked, setBlocked] = useState("")
	// Chosen when the modal was opened (the hidden inputs legacy writes then)
	const [picked, setPicked] = useState({ major: "", subGrade: "", blocked: "" })
	const [enabled, setEnabled] = useState({ major: false, subGrade: false, status: false })
	const [submitting, setSubmitting] = useState(false)
	const timer = useRef<number | undefined>(undefined)

	const open = (which: Modal): void => {
		const plain = selected.map((row) => ({ ...row, status: null }))
		if (which === "next" || which === "graduate") setList(selected)
		if (which === "stay") setList(selected)
		if (which === "major") {
			setList(major === "" ? { notice: "Silakan pilih jurusan terlebih dahulu." } : plain)
			if (major !== "") setEnabled((value) => ({ ...value, major: true }))
		}
		if (which === "status") {
			setList(blocked === "" ? { notice: "Silakan pilih status terlebih dahulu." } : plain)
			if (blocked !== "") setEnabled((value) => ({ ...value, status: true }))
		}
		if (which === "subGrade") {
			setList(subGrade === "" ? [] : plain)
			if (subGrade !== "") setEnabled((value) => ({ ...value, subGrade: true }))
		}
		setPicked((value) => ({
			major: which === "major" && major !== "" ? major : value.major,
			subGrade: which === "subGrade" ? subGrade : value.subGrade,
			blocked: which === "status" && blocked !== "" ? blocked : value.blocked,
		}))
		setModal(which)
	}

	const ids = Array.isArray(list) ? list.map((row) => row.id) : []

	const run = (request: Promise<{ message: string }>): void => {
		setSubmitting(true)
		request
			.then((result) => {
				timer.current = window.setTimeout(() => {
					legacyNotify.success(noticeLines(result.message))
					setSubmitting(false)
					setModal(null)
					onDone()
				}, 1000)
			})
			.catch((error: unknown) => {
				setModal(null)
				setSubmitting(false)
				legacyNotify.error(legacyErrors(error).flatMap(noticeLines), "Gagal!")
			})
	}

	const confirm = (): void => {
		if (submitting || modal === null) return
		if (modal === "next" || modal === "graduate") run(bulk.mutateAsync({ action: modal, data: { ids } }))
		if (modal === "stay") run(bulk.mutateAsync({ action: "stay", data: { ids } }))
		if (modal === "subGrade") run(updateSubGrade.mutateAsync({ ids, subGrade: picked.subGrade === "" ? null : picked.subGrade }))
		if (modal === "major") run(updateMajor.mutateAsync({ ids, major: picked.major === "" ? null : picked.major }))
		if (modal === "status") run(updateStatus.mutateAsync({ ids, isBlocked: picked.blocked === "1" }))
	}

	const button = (which: Modal, variant: "secondary" | "success" | "warning", text: string, margin: string): JSX.Element => (
		<a
			role="button"
			tabIndex={0}
			onMouseDown={triggerRipple}
			onClick={() => open(which)}
			className={legacyButtonClass(variant, cn("mb-[16px] whitespace-normal", margin, RIPPLE_CLASS))}
		>
			{text}
		</a>
	)

	const selectGroup = (value: string, onChange: (value: string) => void, options: Array<{ value: string; label: string }>, which: Modal, last = false): JSX.Element => (
		<div className={cn(SELECT_WITH_BUTTON, last && "mr-0")}>
			<div className="w-[180px] max-w-[180px]">
				<LegacySelect value={value} options={options} onChange={onChange} mutedText={value === ""} className="rounded-r-none!" />
			</div>
			<a role="button" tabIndex={0} onMouseDown={triggerRipple} onClick={() => open(which)} className={APPEND_CLASS}>
				<AppendArrow />
			</a>
		</div>
	)

	const titles: Record<Modal, { title: string; label?: { text: string; variant: "secondary" | "success" | "warning" } }> = {
		next: { title: "Konfirmasi", label: { text: "Naik Kelas", variant: "success" } },
		graduate: { title: "Konfirmasi", label: { text: "Lulus", variant: "secondary" } },
		stay: { title: "Konfirmasi", label: { text: "Tinggal Kelas", variant: "warning" } },
		major: { title: "Konfirmasi ubah jurusan" },
		subGrade: { title: "Konfirmasi ubah subkelas" },
		status: { title: "Konfirmasi ubah status" },
	}
	const current = modal ?? "next"
	const subGradeContents =
		picked.subGrade === "" ? (
			<div className="text-center">Silakan pilih sub kelas terlebih dahulu.</div>
		) : (
			<>
				Pastikan data yang akan diubah ke <span className="font-semibold">subkelas {picked.subGrade}</span> sesuai dengan data yang Anda maksud.
			</>
		)

	return (
		<>
			{/* `#tbr_bulk_action.tbr_bulk_action.mb-2` — faded and inert until a row is ticked (app.css 2612-2622) */}
			<div
				className={cn(
					"mb-[8px] transition-all duration-500",
					selected.length > 0 ? "pointer-events-auto opacity-100" : "pointer-events-none cursor-default opacity-60",
				)}
			>
				<div className="mx-[-15px] flex flex-wrap">
					<div className="flex w-full flex-wrap px-[15px]">
						{isMaxGrade ? button("graduate", "secondary", "Lulus", "mr-[8px]") : button("next", "success", "Naik Kelas", "mr-[8px]")}
						{button("stay", "warning", "Tinggal Kelas", "mr-[24px]")}
						{selectGroup(major, setMajor, withPlaceholder("Jurusan", majors.map((name) => ({ value: name, label: name }))), "major")}
						{selectGroup(
							subGrade,
							setSubGrade,
							withPlaceholder("Subkelas", [{ value: "undefined", label: "Undefined" }, ...subGrades.map((label) => ({ value: label, label }))]),
							"subGrade",
						)}
						{selectGroup(
							blocked,
							setBlocked,
							withPlaceholder("Status Akun", [
								{ value: "0", label: "Active" },
								{ value: "1", label: "Deactive" },
							]),
							"status",
							true,
						)}
					</div>
				</div>
			</div>

			<StudentListingModal
				open={modal !== null}
				title={titles[current].title}
				{...(titles[current].label ? { label: titles[current].label } : {})}
				contents={current === "subGrade" ? subGradeContents : CONTENTS_KBM}
				items={list}
				confirmEnabled={current === "major" ? enabled.major : current === "status" ? enabled.status : current === "subGrade" ? enabled.subGrade : true}
				submitting={submitting}
				onCancel={() => setModal(null)}
				onConfirm={confirm}
			/>
		</>
	)
}

export default StudentBulk
