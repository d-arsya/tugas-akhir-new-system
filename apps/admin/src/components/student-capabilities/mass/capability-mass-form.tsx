import { useState, type JSX } from "react"
import { Link } from "@tanstack/react-router"

import type { CapabilityMassPage } from "@roja/types"

import LegacyButton from "@/components/legacy/legacy-button"
import LegacyCard from "@/components/legacy/legacy-card"
import LegacyTextarea from "@/components/legacy/legacy-textarea"
import CapabilityPublishMassModal from "@/components/student-capabilities/modals/capability-publish-mass-modal"

import MassAccountTable from "./mass-account-table"
import MassAmountEditor from "./mass-amount-editor"
import MassPageTitle from "./mass-page-title"
import MassSelectionCard from "./mass-selection-card"
import MassSpecialConditionBanner from "./mass-special-condition-banner"
import type { MassDraft } from "./use-mass-draft"

type CapabilityMassFormProps = {
	academicYearId: string
	gradeId: string
	page: CapabilityMassPage | undefined
	specialCondition?: boolean
	draft: MassDraft
	submitting: boolean
	onSubmit: (note: string) => void
}

const CapabilityMassForm = ({
	academicYearId,
	gradeId,
	page,
	specialCondition = false,
	draft,
	submitting,
	onSubmit,
}: CapabilityMassFormProps): JSX.Element => {
	const [note, setNote] = useState("")
	const [confirming, setConfirming] = useState(false)

	const send = (): void => {
		setConfirming(false)
		onSubmit(note)
	}

	return (
		<>
			<MassPageTitle academicYearId={academicYearId} gradeId={gradeId} page={page} />

			<MassSelectionCard students={page?.students ?? []} />

			{specialCondition ? <MassSpecialConditionBanner /> : null}

			<div className="mx-[-15px] mt-[24px] flex flex-wrap">
				<div className="w-full min-w-0 flex-1 px-[15px]">
					<LegacyCard>
						<MassAccountTable draft={draft} onEdit={draft.openEditor} />

						<div className="mt-[48px]">
							<LegacyTextarea
								name="note"
								id="note"
								rows={3}
								value={note}
								onChange={(event) => setNote(event.target.value)}
								placeholder="Tambahkan catatan jika diperlukan"
								className="mb-[16px]"
							/>
							<div className="text-right">
								<Link
									to="/student-capabilities/academic-years/$academicYearId/grades/$gradeId"
									params={{ academicYearId, gradeId }}
									className="mr-[8px] inline-flex min-h-[40px] cursor-pointer items-center justify-center rounded-[6px] bg-[var(--bg-btn-light-inverse)] px-[16px] py-[7.52px] text-[12px] leading-[18px] tracking-[0.5px] text-[var(--grey)]"
								>
									Batal
								</Link>{" "}
								<LegacyButton
									variant="primary"
									id="tbr_btn_create_capability"
									loading={submitting}
									disabled={draft.saveDisabled}
									onClick={() => setConfirming(true)}
								>
									Simpan
								</LegacyButton>
							</div>
						</div>
					</LegacyCard>
				</div>
			</div>

			<MassAmountEditor draft={draft} />
			<CapabilityPublishMassModal
				open={confirming}
				submitting={submitting}
				percent={submitting ? 100 : 0}
				onCancel={() => setConfirming(false)}
				onConfirm={send}
			/>
		</>
	)
}

export default CapabilityMassForm
