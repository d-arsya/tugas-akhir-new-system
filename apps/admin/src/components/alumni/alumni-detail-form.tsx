import { useCallback, useState, type FormEvent, type JSX } from "react"

import type { AdminAlumniDetail, SettingFormItem, SocietyDisease, SocietyStepKey, SocietyValues } from "@roja/types"
import { SOCIETY_FIELDS } from "@roja/utils"

import SocietyEditTabs, { type SocietyEditTab } from "@/components/society/society-edit-tabs"
import SocietyFormSection from "@/components/society/society-form-section"
import { societySettingLookup } from "@/components/society/society-settings"
import { toSocietyFormData } from "@/components/society/wizard/society-multipart"
import { useUpdateAlumni } from "@/hooks/use-alumni"
import { useLegacySubmit } from "@/hooks/use-legacy-submit"

import AlumniTab from "./alumni-tab"
import { AlumniWidgetInfo, AlumniWidgetStatus } from "./alumni-widgets"

const STEPS: readonly SocietyStepKey[] = ["personal", "identity", "family", "guardian", "attachment"]

const ALUMNI_INPUTS = [
	"alumni_talent",
	"advanced_study",
	"profession",
	"marriage_status",
	"alumni_phone",
	"alumni_email",
	"alumni_province_id",
	"alumni_regency_id",
	"alumni_district_id",
	"alumni_village",
	"alumni_street",
	"alumni_rt",
	"alumni_rw",
	"alumni_sub_village",
] as const

const SUMMERNOTES = new Set(["alumni_talent", "advanced_study", "profession", "learning_achievment", "gift"])
const isEmptySummernote = (html: string): boolean => /^(<p>)?(<br\s*\/?>)?(<\/p>)?$/i.test(html.trim())

const postedValues = (values: SocietyValues, settings: readonly SettingFormItem[]): SocietyValues => {
	const lookup = societySettingLookup(settings)
	const out: SocietyValues = {}
	for (const name of ALUMNI_INPUTS) out[name] = values[name] ?? ""
	for (const field of SOCIETY_FIELDS) {
		if (field.table || field.widget === "image" || !lookup.status(field.id)) continue
		for (const column of field.columns) out[column] = values[column] ?? ""
	}
	for (const name of Object.keys(out)) if (SUMMERNOTES.has(name) && isEmptySummernote(out[name] ?? "")) out[name] = ""
	if (out["marriage_status"] === "") delete out["marriage_status"]
	return out
}

type AlumniDetailFormProps = {
	detail: AdminAlumniDetail
	settings: SettingFormItem[]
	onSaved: () => void
}

const AlumniDetailForm = ({ detail, settings, onSaved }: AlumniDetailFormProps): JSX.Element => {
	const [values, setValues] = useState<SocietyValues>(() => ({ ...detail.record.values, ...detail.alumni }))
	const [diseases, setDiseases] = useState<SocietyDisease[]>(detail.record.diseases)
	const [files, setFiles] = useState<Partial<Record<string, File>>>({})
	const update = useUpdateAlumni()

	const save = useLegacySubmit({
		mutationFn: (form: FormData) => update.mutateAsync({ alumniId: detail.id, form }),
		onDone: onSaved,
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

	const submit = (event: FormEvent<HTMLFormElement>): void => {
		event.preventDefault()
		const lookup = societySettingLookup(settings)
		save.submit(toSocietyFormData(postedValues(values, settings), lookup.status(28) ? diseases : [], files))
	}

	const section = (step: SocietyStepKey): JSX.Element => (
		<SocietyFormSection
			society="alumni"
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
		/>
	)

	const tabs: SocietyEditTab[] = [
		{ key: "alumni", content: <AlumniTab values={values} onChange={onChange} /> },
		...STEPS.map((step) => ({ key: step, content: section(step) })),
	]

	return (
		// noValidate: required inputs in hidden tabs would block the save silently; the server validates
		<form onSubmit={submit} noValidate>
			<div className="mx-[-15px] flex flex-wrap">
				<div className="w-full px-[15px] min-[992px]:w-1/4">
					<AlumniWidgetInfo detail={detail} />
				</div>
				<div className="w-full px-[15px] min-[992px]:w-1/2">
					<SocietyEditTabs tabs={tabs} />
				</div>
				<div className="w-full px-[15px] min-[992px]:w-1/4">
					<AlumniWidgetStatus detail={detail} saving={save.submitting} />
				</div>
			</div>
		</form>
	)
}

export default AlumniDetailForm
