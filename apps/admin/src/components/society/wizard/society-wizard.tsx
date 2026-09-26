import { useEffect, useMemo, useRef, useState, type FormEvent, type JSX, type ReactNode } from "react"
import { useNavigate } from "@tanstack/react-router"

import type {
	SettingFormItem,
	SocietyDisease,
	SocietyDraft,
	SocietyDraftStepKey,
	SocietyFieldErrors,
	SocietyStepKey,
	SocietyValues,
} from "@roja/types"

import AdminPageTitle from "@/components/layout/admin-page-title"
import { legacyNotify } from "@/components/legacy/legacy-notify"
import SocietyFormSection from "@/components/society/society-form-section"
import { useSocietySettings } from "@/hooks/use-society-settings"
import { legacyErrors } from "@/lib/legacy-errors"
import useAuthStore from "@/stores/auth.store"

import { clearDraft, mergedValues, readDraft, stepValues, writeDraft, type WizardDraftState } from "./wizard-draft"
import { fieldErrorsOf, setPendingErrors, takePendingErrors } from "./wizard-errors"
import { WIZARD_STEPS, WizardBody, WizardFooter, WizardGroupDisabledAlert, WizardStepper } from "./wizard-frame"
import { diseasesVisible, groupAllDisable, postableValues } from "./wizard-settings"

// OWNER: AK-S. The legacy 5-step create wizard shared by Santri and PSB —
// `resources/views/{student,registrant}/create/data/*.blade.php` + `partials/{wizard,page-header}.blade.php`,
// `public/assets/css/wizard.css`, `public/assets/js/registrant/{save-data-to-session,submit-data,submit-data-with-file}.js`
// and the `Student\*` / `Registrant\*` wizard controllers.

export type SocietyWizardStepOneContext = {
	values: SocietyValues
	onChange: (name: string, value: string) => void
	errors: SocietyFieldErrors
	/** Every setting-form row sorted by id (`lineVisible($setting_forms, 1, 21)` decides the divider). */
	settings: SettingFormItem[]
	/** Keys shown disabled (Santri "Tambah" from a roster: `$personal_data->disabled`). */
	locked: ReadonlySet<string>
}

export type SocietyWizardProps = {
	society: "registrant" | "student"
	/** The step this route renders (one route per step, as legacy `/create/{personal,identity,…}`). */
	step: SocietyStepKey
	/** Page title, e.g. "Tambah Santri" / "Tambah PSB". */
	title: string
	/** Route path of each step, for the stepper and Kembali / Selanjutnya. */
	stepPath: (step: SocietyStepKey) => string
	/** The society-specific rows at the top of step 1 (year, Kelas / Jenjang, Jalur …); their values live in the draft. */
	renderStepOneHeader: (context: SocietyWizardStepOneContext) => ReactNode
	/** Legacy `validate*Data`: resolves when the step passes; rejects with the API error (400 field errors). */
	validateStep: (step: SocietyDraftStepKey, draft: SocietyDraft) => Promise<void>
	/** Final save (legacy `AttachmentController::validateAttachmentData`): resolves to the path to open next. */
	submit: (draft: SocietyDraft, files: Partial<Record<string, File>>) => Promise<string>
	/** Values forced into the draft and shown locked (Santri "Tambah" from a class roster). */
	lockedValues?: SocietyValues
	/** Extra session defaults per step (e.g. Santri `sub_grade = "undefined"`), under what the admin typed. */
	stepDefaults?: Partial<Record<SocietyDraftStepKey, SocietyValues>>
}

// `submit-data.js`: `setTimeout(() => window.location = redirect, 1000)` after a passing step
const NEXT_STEP_DELAY_MS = 1000

const BREADCRUMB = {
	student: { label: "Santri", to: "/students" },
	registrant: { label: "PSB", to: "/registrants" },
} as const

const isDraftStep = (step: SocietyStepKey): step is SocietyDraftStepKey => step !== "attachment"

/** The legacy 5-step create wizard shared by Santri and PSB, with the draft kept like the legacy session. */
export default function SocietyWizard({
	society,
	step,
	title,
	stepPath,
	renderStepOneHeader,
	validateStep,
	submit,
	lockedValues,
	stepDefaults,
}: SocietyWizardProps): JSX.Element {
	const navigate = useNavigate()
	const userId = useAuthStore((state) => state.user?.id ?? 0)
	const { data: settingRows } = useSocietySettings()
	const settings = useMemo(() => settingRows ?? [], [settingRows])

	const index = WIZARD_STEPS.indexOf(step)
	const previous = index > 0 ? WIZARD_STEPS[index - 1] : undefined

	// Legacy `StudentController::create:359`: forget the personal session only, then seed it with the
	// defaults, the roster's year / Kelas / Jenjang and `disabled => true`. Other steps keep their draft.
	const [draft, setDraft] = useState<WizardDraftState>(() => {
		const stored = readDraft(userId, society)
		if (!lockedValues) return stored
		const seeded: WizardDraftState = {
			...stored,
			steps: { ...stored.steps, personal: { ...stepValues({ ...stored, steps: {} }, "personal", stepDefaults), ...lockedValues } },
			locked: Object.keys(lockedValues),
		}
		writeDraft(userId, society, seeded)
		return seeded
	})
	const draftRef = useRef(draft)
	// The page keeps its disabled inputs after the first autosave drops the flag from the session
	const [locked] = useState<ReadonlySet<string>>(() => new Set(draft.locked))
	const [errors, setErrors] = useState<SocietyFieldErrors>(() => takePendingErrors(society, step))
	const [files, setFiles] = useState<Partial<Record<string, File>>>({})
	const [submitting, setSubmitting] = useState(false)
	// Legacy `validatePreviousData()` runs before the page renders; until it answers the body stays empty
	const [ready, setReady] = useState(previous === undefined)
	const timer = useRef<number | undefined>(undefined)

	useEffect(() => () => window.clearTimeout(timer.current), [])

	const commit = (next: WizardDraftState): void => {
		draftRef.current = next
		setDraft(next)
		writeDraft(userId, society, next)
	}

	const stepDraft = (key: SocietyDraftStepKey, source: WizardDraftState): SocietyDraft => ({
		values: postableValues(stepValues(source, key, stepDefaults), settings, key),
		diseases: key === "identity" && diseasesVisible(settings) ? source.diseases : [],
	})

	const showFailure = (error: unknown): void => {
		const fields = fieldErrorsOf(error)
		if (fields) setErrors(fields)
		else legacyNotify.error(legacyErrors(error))
	}

	// `*Controller::validatePreviousData()` — the previous step's session must pass its own request
	useEffect(() => {
		if (previous === undefined || !isDraftStep(previous) || settings.length === 0) return undefined
		let alive = true
		validateStep(previous, stepDraft(previous, draftRef.current))
			.then(() => {
				if (alive) setReady(true)
			})
			.catch((error: unknown) => {
				if (!alive) return
				const fields = fieldErrorsOf(error)
				if (fields) {
					setPendingErrors(society, previous, fields)
					void navigate({ to: stepPath(previous) as never, replace: true })
					return
				}
				legacyNotify.error(legacyErrors(error))
				setReady(true)
			})
		return () => {
			alive = false
		}
		// Once per page visit (after the setting forms load), as legacy checks on the GET of the step
	}, [previous, settings.length])

	// `save-data-to-session.js` posts the step's whole form on every keyup / select / radio / disease
	// change; the port writes the draft on every change
	const onChange = (name: string, value: string): void => {
		if (!isDraftStep(step) || locked.has(name)) return
		const current = draftRef.current
		commit({
			...current,
			steps: { ...current.steps, [step]: { ...stepValues(current, step, stepDefaults), [name]: value } },
			locked: step === "personal" ? [] : current.locked,
		})
	}

	const onDiseasesChange = (diseases: SocietyDisease[]): void => commit({ ...draftRef.current, diseases })

	const onFileChange = (name: string, file: File | null): void =>
		setFiles((current) => {
			const next = { ...current }
			if (file) next[name] = file
			else delete next[name]
			return next
		})

	const onSubmit = (event: FormEvent<HTMLFormElement>): void => {
		event.preventDefault()
		if (submitting) return
		setSubmitting(true)

		// `submit-data-with-file.js`: the final save goes straight to the returned `redirect`
		if (!isDraftStep(step)) {
			const current = draftRef.current
			const payload: SocietyDraft = {
				values: postableValues(mergedValues(current, stepDefaults), settings, "all"),
				diseases: diseasesVisible(settings) ? current.diseases : [],
			}
			submit(payload, files)
				.then((path) => {
					clearDraft(userId, society)
					void navigate({ to: path as never })
				})
				.catch((error: unknown) => {
					setSubmitting(false)
					const fields = fieldErrorsOf(error)
					setErrors(fields ?? {})
					// Errors of fields that live on other steps cannot show under an input here
					const elsewhere = fields ? Object.keys(fields).some((key) => !key.startsWith("attach_")) : true
					if (elsewhere) legacyNotify.error(legacyErrors(error))
				})
			return
		}

		setErrors({})
		const next = WIZARD_STEPS[index + 1] ?? step
		validateStep(step, stepDraft(step, draftRef.current))
			.then(() => {
				timer.current = window.setTimeout(() => void navigate({ to: stepPath(next) as never }), NEXT_STEP_DELAY_MS)
			})
			.catch((error: unknown) => {
				setSubmitting(false)
				showFailure(error)
			})
	}

	const values = isDraftStep(step) ? stepValues(draft, step, stepDefaults) : {}
	const crumb = BREADCRUMB[society]

	return (
		<>
			<AdminPageTitle title={title} breadcrumbs={[{ label: "Akademik", to: crumb.to }, crumb, { label: "Tambah" }]} />

			{/* `.row.justify-content-center > .col-xl-10.col-lg-10.col-md-12.col-sm-12.col-12` */}
			<div className="mx-[-15px] flex flex-wrap justify-center">
				<div className="w-full px-[15px] min-[992px]:max-w-[83.333333%] min-[992px]:flex-[0_0_83.333333%]">
					<div className="relative block min-h-[10px] w-full overflow-hidden rounded-[12px] bg-transparent shadow-[0px_8px_30px_0px_rgba(0,0,0,0.08)]">
						<form onSubmit={onSubmit} autoComplete="off" noValidate>
							<WizardStepper step={step} />
							<WizardBody>
								{ready ? (
									<>
										{step !== "personal" && settings.length > 0 && groupAllDisable(settings, step) ? <WizardGroupDisabledAlert /> : null}
										{step === "personal" ? renderStepOneHeader({ values, onChange, errors, settings, locked }) : null}
										<SocietyFormSection
											society={society}
											step={step}
											layout="horizontal"
											settings={settings}
											values={values}
											onChange={onChange}
											diseases={draft.diseases}
											onDiseasesChange={onDiseasesChange}
											files={files}
											onFileChange={onFileChange}
											errors={errors}
										/>
									</>
								) : null}
							</WizardBody>
							<WizardFooter previous={previous === undefined ? null : stepPath(previous)} submitting={submitting} />
						</form>
					</div>
				</div>
			</div>
		</>
	)
}
