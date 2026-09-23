import { useEffect, type JSX } from "react"
import { useNavigate } from "@tanstack/react-router"

import type { AcademicYearDeleteTarget } from "@roja/types"

import LegacyDeletePage from "@/components/legacy/legacy-delete-page"
import { useAcademicYearDeleteStep } from "@/hooks/use-academic-year-delete"
import type { LegacyDeletePageSubmit } from "@/hooks/use-legacy-delete-page"

/**
 * The body every `academic-year/delete/*.blade.php` shares. Legacy renders four separate
 * blades that differ only in the heading, the "Oops…" sentence and whether the button carries
 * `tbr_bulk_action opacity`, so they collapse into one card over the frozen `LegacyDeletePage`.
 */
type AcademicYearDeleteCardProps = {
	academicYearId: number
	step: AcademicYearDeleteTarget
	/** The delegate heading's noun: "pendaftar", "santri", "alumni". Unused by the plain delete. */
	noun?: string
	/** The sentence shown instead of the warning while the step is locked. */
	lockedText?: string
	submit: LegacyDeletePageSubmit<void>
}

const BACK_TO = "/academic-years"

const Danger = ({ children }: { children: string }): JSX.Element => (
	<span className="font-bold text-[var(--danger)]">{children}</span>
)

const AcademicYearDeleteCard = ({
	academicYearId,
	step,
	noun,
	lockedText,
	submit,
}: AcademicYearDeleteCardProps): JSX.Element | null => {
	const navigate = useNavigate()
	const { data } = useAcademicYearDeleteStep(academicYearId, step)

	// The destroy icon picked this page when the list rendered; if the rows moved since, the
	// server names the step that does apply and we walk there instead of showing a stale form.
	useEffect(() => {
		if (data?.redirect) void navigate({ to: data.redirect, replace: true })
	}, [data?.redirect, navigate])

	if (!data || data.redirect) return null

	const year = data.year ?? ""
	const locked = data.locked

	return (
		<LegacyDeletePage
			backTo={BACK_TO}
			heading={
				step === "delete" ? (
					<>
						{/* `.tbr_text-danger` only — no bold on the plain delete heading */}
						Yakinkah menghapus tahun ajaran <span className="text-[var(--danger)]">{year}</span>?
					</>
				) : (
					<>
						Data {noun} akan dipindahkan ke{" "}
						<span className="font-bold text-[var(--primary)]">Archive</span>
					</>
				)
			}
			description={
				step === "delete" ? (
					"Data akan dihapus dari database secara permanen. Anda tidak akan bisa mengembalikannya lagi."
				) : locked && lockedText ? (
					<>
						{lockedText} <Danger>{year}</Danger>
					</>
				) : (
					<>
						Tahun ajaran <Danger>{year}</Danger> akan dihapus secara permanen. Anda tidak akan bisa
						mengembalikannya lagi.
					</>
				)
			}
			locked={locked}
			loading={submit.submitting}
			onConfirm={() => submit.submit()}
		/>
	)
}

export default AcademicYearDeleteCard
