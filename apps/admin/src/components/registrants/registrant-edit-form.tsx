import { useCallback, useState, type JSX } from "react"

import type { AdminRegistrantDetail, SettingFormItem, SocietyDisease, SocietyStepKey, SocietyValues } from "@roja/types"
import { SOCIETY_FIELDS } from "@roja/utils"

import SocietyAccountTab from "@/components/society/society-account-tab"
import SocietyEditTabs, { type SocietyEditTab } from "@/components/society/society-edit-tabs"
import SocietyFormSection from "@/components/society/society-form-section"
import { societySettingLookup } from "@/components/society/society-settings"
import { toSocietyFormData } from "@/components/society/wizard/society-multipart"
import { useUpdateRegistrant, useUpdateRegistrantStatus } from "@/hooks/use-registrants-write"

import RegistrantConfirmModal, { type ApprovalKind } from "./registrant-confirm-modal"
import type { RegistrantStepModal } from "./registrant-progress"
import { DataValidationModal, TestModal } from "./registrant-status-modals"
import RegistrantWidgetInfo from "./registrant-widget-info"
import RegistrantWidgetStatus from "./registrant-widget-status"

// `registrant/edit.blade.php`: `form#main-form` over three columns — widget-info (col-lg-3), the six
// tabs (col-lg-6) and widget-status (col-lg-3) — plus the seven status modals. `update.js` posts the whole
// form (disabled inputs are not posted); a portal-registered row is read-only except its status radios.

const STEPS: readonly SocietyStepKey[] = ["personal", "identity", "family", "guardian", "attachment"]

/** What the blade form posts: every rendered input — a hidden setting (status off) is not rendered. */
const postedValues = (values: SocietyValues, settings: readonly SettingFormItem[]): SocietyValues => {
	const lookup = societySettingLookup(settings)
	const out: SocietyValues = {}
	for (const field of SOCIETY_FIELDS) {
		if (field.table || !lookup.status(field.id)) continue
		for (const column of field.columns) out[column] = values[column] ?? ""
	}
	return out
}

type RegistrantEditFormProps = { detail: AdminRegistrantDetail; settings: SettingFormItem[] }

const RegistrantEditForm = ({ detail, settings }: RegistrantEditFormProps): JSX.Element => {
	const portalRow = !detail.registeredByAdmin
	const [values, setValues] = useState<SocietyValues>(detail.record.values)
	const [diseases, setDiseases] = useState<SocietyDisease[]>(detail.record.diseases)
	const [files, setFiles] = useState<Partial<Record<string, File>>>({})
	const [account, setAccount] = useState<SocietyValues>({
		email: detail.email ?? "",
		password: "",
		password_confirmation: "",
		is_blocked: detail.isBlocked ? "1" : "0",
	})
	const [levelId, setLevelId] = useState(detail.levelId === null ? "" : String(detail.levelId))
	const [stepModal, setStepModal] = useState<RegistrantStepModal | null>(null)
	const [resultModal, setResultModal] = useState<ApprovalKind | null>(null)

	const update = useUpdateRegistrant(detail.id, () => setFiles({}))
	const status = useUpdateRegistrantStatus(detail.id, () => {
		setStepModal(null)
		setResultModal(null)
	})

	const onChange = useCallback((name: string, value: string) => setValues((current) => ({ ...current, [name]: value })), [])
	const onFileChange = useCallback(
		(name: string, file: File | null) =>
			setFiles((current) => {
				const next = { ...current }
				if (file) next[name] = file
				else delete next[name]
				return next
			}),
		[],
	)

	const save = (): void => {
		if (portalRow) {
			update.submit(toSocietyFormData({ is_blocked: account["is_blocked"] ?? "0" }, []))
			return
		}
		const lookup = societySettingLookup(settings)
		const payload: SocietyValues = {
			...postedValues(values, settings),
			// widget-status: the level select and the two hidden inputs
			level_id: levelId,
			registration_path: detail.registrationPath ?? "",
			academic_year_id: detail.academicYearId === null ? "" : String(detail.academicYearId),
			...account,
		}
		update.submit(toSocietyFormData(payload, lookup.status(28) ? diseases : [], files))
	}

	const section = (step: SocietyStepKey): JSX.Element => (
		<SocietyFormSection
			society="registrant"
			step={step}
			layout="stacked"
			settings={settings}
			values={values}
			onChange={onChange}
			diseases={diseases}
			onDiseasesChange={setDiseases}
			files={files}
			onFileChange={onFileChange}
			attachmentUrls={detail.record.attachmentUrls}
			errors={{}}
			disabled={portalRow}
		/>
	)

	const tabs: SocietyEditTab[] = [
			...STEPS.map((step) => ({ key: step, content: section(step) })),
			{
				key: "account" as const,
				content: (
					<SocietyAccountTab
						values={account}
						onChange={(name, value) => setAccount((current) => ({ ...current, [name]: value }))}
						errors={{}}
						disabled={portalRow}
					/>
				),
			},
	]

	return (
		<>
			<div className="mx-[-15px] flex flex-wrap">
				<div className="w-full px-[15px] min-[992px]:w-1/4">
					<RegistrantWidgetInfo detail={detail} />
				</div>
				<div className="w-full px-[15px] min-[992px]:w-1/2">
					<SocietyEditTabs tabs={tabs} />
				</div>
				<div className="w-full px-[15px] min-[992px]:w-1/4">
					<RegistrantWidgetStatus
						detail={detail}
						levelId={levelId}
						onLevelChange={setLevelId}
						onOpenStep={setStepModal}
						onPickResult={setResultModal}
						onSave={save}
						saving={update.submitting}
					/>
				</div>
			</div>

			<RegistrantConfirmModal
				kind={resultModal}
				fullname={detail.fullname}
				registrantId={detail.registrantId}
				submitting={status.submitting}
				onCancel={() => setResultModal(null)}
				onConfirm={(kind) => status.submit({ approval_status: kind })}
			/>
			<TestModal
				open={stepModal === "regular"}
				kind="regular"
				detail={detail}
				submitting={status.submitting}
				onCancel={() => setStepModal(null)}
				onSubmit={status.submit}
			/>
			<TestModal
				open={stepModal === "indent"}
				kind="indent"
				detail={detail}
				submitting={status.submitting}
				onCancel={() => setStepModal(null)}
				onSubmit={status.submit}
			/>
			<DataValidationModal
				open={stepModal === "validation"}
				detail={detail}
				submitting={status.submitting}
				onCancel={() => setStepModal(null)}
				onSubmit={status.submit}
			/>
		</>
	)
}

export default RegistrantEditForm
