import { useEffect, useRef, useState, type JSX } from "react"
import { useNavigate } from "@tanstack/react-router"

import type { AdminStudentDetail } from "@roja/types"
import { cn } from "@roja/utils"

import LegacyButton, { legacyButtonClass } from "@/components/legacy/legacy-button"
import LegacyConfirmIcon from "@/components/legacy/legacy-confirm-icon"
import { LegacyModalOverlay } from "@/components/legacy/legacy-modal"
import { legacyNotify } from "@/components/legacy/legacy-notify"
import LegacyTextarea from "@/components/legacy/legacy-textarea"
import { useStudentBulk, useStudentDropout } from "@/hooks/use-students"
import { legacyErrors } from "@/lib/legacy-errors"
import { RIPPLE_CLASS, triggerRipple } from "@/lib/ripple"

import { noticeLines, StudentLabel, type StudentLabelVariant } from "./student-ui"

type Action = "graduate" | "next" | "stay" | "dropout"

const ACTION: Record<Action, { label: string; variant: StudentLabelVariant; becomes: string }> = {
	graduate: { label: "Lulus", variant: "secondary", becomes: "lulus" },
	next: { label: "Naik Kelas", variant: "success", becomes: "naik kelas" },
	stay: { label: "Tinggal Kelas", variant: "warning", becomes: "tinggal kelas" },
	dropout: { label: "Keluar", variant: "danger", becomes: "keluar" },
}

const REDIRECT_MS = 1000

const visibleActions = (detail: AdminStudentDetail): Action[] => {
	if (detail.gradeStatus !== "active") return []
	const note = detail.gradeNote
	const actions: Action[] = []
	if (detail.maxGrade === detail.grade) {
		if (note !== "lulus") actions.push("graduate")
	} else if (note !== "naik kelas" && note !== "keluar") actions.push("next")
	if (note !== "tinggal kelas" && note !== "keluar") actions.push("stay")
	actions.push("dropout")
	return actions
}

const BUTTON_VARIANT = { graduate: "secondary", next: "success", stay: "warning", dropout: "danger" } as const

export const StudentEditActions = ({ detail }: { detail: AdminStudentDetail }): JSX.Element => {
	const navigate = useNavigate()
	const bulk = useStudentBulk()
	const dropout = useStudentDropout()
	const [open, setOpen] = useState<Action | null>(null)
	const [note, setNote] = useState("")
	const [submitting, setSubmitting] = useState(false)
	const timer = useRef<number | undefined>(undefined)

	useEffect(() => () => window.clearTimeout(timer.current), [])

	const leaveToRoster = (): void => {
		const { academicYearId, grade, levelId } = detail
		if (academicYearId === null) {
			void navigate({ to: "/students" })
		} else if (grade === null || levelId === null) {
			void navigate({ to: "/students/academic-years/$academicYearId", params: { academicYearId: String(academicYearId) } })
		} else {
			void navigate({
				to: "/students/academic-years/$academicYearId/grades/$grade/levels/$levelId",
				params: { academicYearId: String(academicYearId), grade: String(grade), levelId: String(levelId) },
			})
		}
	}

	const confirm = (): void => {
		if (open === null || submitting) return
		setSubmitting(true)
		const ids = [detail.id]
		const request =
			open === "dropout" ? dropout.mutateAsync({ ids, dropoutNote: note }) : bulk.mutateAsync({ action: open, data: { ids } })
		request
			.then((result) => {
				legacyNotify.success(noticeLines(result.message))
				timer.current = window.setTimeout(leaveToRoster, REDIRECT_MS)
			})
			.catch((error: unknown) => {
				setSubmitting(false)
				legacyNotify.error(legacyErrors(error).flatMap(noticeLines), "Gagal!")
			})
	}

	const current = open ?? "dropout"
	return (
		<>
			<div className="my-[8px] flex flex-wrap">
				{visibleActions(detail).map((action) => (
					<a
						key={action}
						role="button"
						tabIndex={0}
						onMouseDown={triggerRipple}
						onClick={() => {
							setNote("")
							setOpen(action)
						}}
						className={legacyButtonClass(
							BUTTON_VARIANT[action],
							cn("my-[4px] whitespace-normal", action === "dropout" ? "mr-0" : "mr-[8px]", action === "graduate" && "mb-0", RIPPLE_CLASS),
						)}
					>
						{ACTION[action].label}
					</a>
				))}
			</div>

			<LegacyModalOverlay open={open !== null} maxWidth="500px">
				<section>
					<div className="rounded-[20px] bg-[var(--bg-secondary)] p-[30px] shadow-[0px_8px_30px_0px_rgba(0,0,0,0.08)]">
						<div className="mb-[14px] text-center">
							<LegacyConfirmIcon variant="warning" />
						</div>
						<div className="mb-[26px] text-center">
							<div className="mb-[12px] text-[20px] leading-[22.4px] font-bold text-[var(--heading-txt-inverse)]">
								Konfirmasi{" "}
								<StudentLabel variant={ACTION[current].variant} size="base" className="top-[-3px] left-[3px] text-[12px] font-medium">
									{ACTION[current].label}
								</StudentLabel>
							</div>
							Santri atas nama <span className="font-semibold">{detail.fullname}</span> akan diubah{" "}
							<span className="font-semibold">keterangan KBM</span> nya menjadi {ACTION[current].becomes}.
							{current === "dropout" ? (
								<div className="mt-[24px] mb-[16px] px-0 pb-[4px] md:px-[16px]">
									<LegacyTextarea
										name="dropout_note"
										id="dropout_note"
										rows={3}
										spellCheck={false}
										autoComplete="off"
										placeholder="Silakan tulis alasan kenapa dia dikeluarkan"
										value={note}
										onChange={(event) => setNote(event.target.value)}
										className="resize-none"
									/>
								</div>
							) : null}
						</div>
						<div className="mb-[4px] text-center">
							<LegacyButton variant="light" className="mr-[8px]" onClick={() => setOpen(null)}>
								Batal
							</LegacyButton>{" "}
							<LegacyButton variant="warning" loading={submitting} onClick={confirm}>
								Ya, data benar
							</LegacyButton>
						</div>
					</div>
				</section>
			</LegacyModalOverlay>
		</>
	)
}
