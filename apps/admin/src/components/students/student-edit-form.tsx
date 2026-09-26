import { useCallback, useRef, useState, type JSX } from "react"

import type { AdminStudentDetail, AdminStudentOptions, SettingFormItem, SocietyDisease, SocietyStepKey, SocietyValues } from "@roja/types"

import LegacyCard from "@/components/legacy/legacy-card"
import { legacyNotify } from "@/components/legacy/legacy-notify"
import SocietyAccountTab from "@/components/society/society-account-tab"
import SocietyEditTabs, { type SocietyEditTab } from "@/components/society/society-edit-tabs"
import SocietyFormSection from "@/components/society/society-form-section"
import { toSocietyFormData } from "@/components/society/wizard/society-multipart"
import { diseasesVisible, postableValues } from "@/components/society/wizard/wizard-settings"
import { useStudentUpdate } from "@/hooks/use-students"
import { legacyErrors } from "@/lib/legacy-errors"

import { StudentEditActions } from "./student-edit-actions"
import { StudentWidgetInfo, StudentWidgetStatus } from "./student-edit-widgets"
import { noticeLines } from "./student-ui"

const STEPS: readonly SocietyStepKey[] = ["personal", "identity", "family", "guardian", "attachment"]
const RELOAD_MS = 1000

const SummaryIcon = (): JSX.Element => (
	<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" className="block">
		<path d="M0,0H40V40H0Z" fill="none" fillRule="evenodd" />
		<path d="M14.667,16.333a6.667,6.667,0,1,1,6.667-6.667A6.667,6.667,0,0,1,14.667,16.333Z" transform="translate(5.333 2)" fill="#e4007e" opacity="0.3" />
		<path d="M3,25c.646-7.955,7.1-12,14.971-12C25.952,13,32.508,16.822,33,25a1.145,1.145,0,0,1-1.252,1.333H4.213A1.845,1.845,0,0,1,3,25Z" transform="translate(2 8.667)" fill="#e4007e" />
	</svg>
)

const ucwords = (value: string | null): string => (value ?? "").replace(/(^|[\s\t\r\n\f\v])(\S)/g, (_, space: string, letter: string) => space + letter.toUpperCase())

const Summary = ({ detail }: { detail: AdminStudentDetail }): JSX.Element => {
	const active = detail.gradeStatus !== "inactive"
	return (
		<LegacyCard className="mb-[24px]" bodyClassName="py-[8px]">
			<div className="flex flex-wrap items-center justify-between">
				<div className="my-[8px] mr-[24px] flex items-center justify-start">
					<div className="mt-[-2px] mr-[12px] w-[40px] min-w-[40px]">
						<SummaryIcon />
					</div>
					<div className="mb-[-3px]">
						<h4 className="mt-0! mb-[4px]! text-[16px]! font-semibold! text-[var(--heading-txt-inverse)]!">{detail.fullname}</h4>
						<p className="mb-0 text-[var(--grey)]">
							<span>
								Jenjang {detail.levelName}, Kelas {detail.grade}
							</span>{" "}
							<span>
								<span
									className={`relative pl-[24px] font-medium italic before:absolute before:top-[calc(50%-4px)] before:left-[8px] before:h-[8px] before:w-[8px] before:rounded-[8px] before:content-[''] ${active ? "text-[var(--success)] before:bg-[var(--success)]" : "text-[var(--danger)] before:bg-[var(--danger)]"}`}
								>
									{active ? "Active" : "Deactive"}
								</span>
								<span className="font-medium italic">&nbsp;({ucwords(detail.gradeNote)})</span>
							</span>
						</p>
					</div>
				</div>
				<StudentEditActions detail={detail} />
			</div>
		</LegacyCard>
	)
}

type Props = { detail: AdminStudentDetail; options: AdminStudentOptions | undefined; settings: SettingFormItem[]; onReload: () => void }

const StudentEditForm = ({ detail, options, settings, onReload }: Props): JSX.Element => {
	const [values, setValues] = useState<SocietyValues>(detail.record.values)
	const [diseases, setDiseases] = useState<SocietyDisease[]>(detail.record.diseases)
	const [files, setFiles] = useState<Partial<Record<string, File>>>({})
	const [nis, setNis] = useState(detail.nis ?? "")
	const [account, setAccount] = useState<SocietyValues>({
		email: detail.email ?? "",
		password: "",
		password_confirmation: "",
		is_blocked: detail.isBlocked === true ? "1" : "0",
	})
	const [subGrade, setSubGrade] = useState(detail.subGrade ?? "")
	const [majorName, setMajorName] = useState(detail.majorName ?? "")
	const [saving, setSaving] = useState(false)
	const timer = useRef<number | undefined>(undefined)
	const update = useStudentUpdate()

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
		if (saving) return
		const payload: SocietyValues = {
			...postableValues(values, settings, "all"),
			nis,
			...account,
			level_id: detail.levelId === null ? "" : String(detail.levelId),
			...(subGrade === "" ? {} : { sub_grade: subGrade }),
			...(majorName === "" ? {} : { major_name: majorName }),
		}
		setSaving(true)
		update
			.mutateAsync({ studentGradeId: detail.id, form: toSocietyFormData(payload, diseasesVisible(settings) ? diseases : [], files) })
			.then((result) => {
				legacyNotify.success(noticeLines(result.message))
				timer.current = window.setTimeout(onReload, RELOAD_MS)
			})
			.catch((error: unknown) => {
				setSaving(false)
				legacyNotify.error(legacyErrors(error).flatMap(noticeLines), "Gagal!")
			})
	}

	const section = (step: SocietyStepKey): JSX.Element => (
		<SocietyFormSection
			society="student"
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
		...STEPS.map((step) => ({ key: step, content: section(step) })),
		{
			key: "account" as const,
			content: <SocietyAccountTab values={account} onChange={(name, value) => setAccount((current) => ({ ...current, [name]: value }))} errors={{}} />,
		},
	]

	return (
		<>
			<Summary detail={detail} />
			<div className="mx-[-15px] flex flex-wrap">
				<div className="w-full px-[15px] min-[992px]:w-1/4">
					<StudentWidgetInfo detail={detail} nis={nis} onNisChange={setNis} />
				</div>
				<div className="w-full px-[15px] min-[992px]:w-1/2">
					<SocietyEditTabs tabs={tabs} />
				</div>
				<div className="w-full px-[15px] min-[992px]:w-1/4">
					<StudentWidgetStatus
						detail={detail}
						options={options}
						subGrade={subGrade}
						onSubGradeChange={setSubGrade}
						majorName={majorName}
						onMajorChange={setMajorName}
						onSave={save}
						saving={saving}
					/>
				</div>
			</div>
		</>
	)
}

export default StudentEditForm
