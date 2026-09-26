import type { SocietyDisease, SocietyDraftStepKey, SocietyValues } from "@roja/types"

export type WizardSociety = "registrant" | "student"

export type WizardDraftState = {
	steps: Partial<Record<SocietyDraftStepKey, SocietyValues>>
	diseases: SocietyDisease[]
	locked: string[]
}

export const LEGACY_STEP_DEFAULTS: Readonly<Partial<Record<SocietyDraftStepKey, SocietyValues>>> = {
	personal: { gender: "male", nationality: "wni", live_with: "parent" },
	identity: { visual_condition: "normal", hearing_condition: "normal", reading: "jilid" },
}

const STORAGE_PREFIX = "roja-admin:society-wizard"

const storageKey = (userId: number | string, society: WizardSociety): string => `${STORAGE_PREFIX}:${userId}:${society}`

export const emptyDraft = (): WizardDraftState => ({ steps: {}, diseases: [], locked: [] })

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value)

const toValues = (value: unknown): SocietyValues => {
	if (!isRecord(value)) return {}
	const out: SocietyValues = {}
	for (const [key, entry] of Object.entries(value)) if (typeof entry === "string") out[key] = entry
	return out
}

const STEP_KEYS: readonly SocietyDraftStepKey[] = ["personal", "identity", "family", "guardian"]

const parseDraft = (raw: string | null): WizardDraftState => {
	if (raw === null) return emptyDraft()
	const parsed: unknown = JSON.parse(raw)
	if (!isRecord(parsed)) return emptyDraft()

	const steps: WizardDraftState["steps"] = {}
	const storedSteps = isRecord(parsed.steps) ? parsed.steps : {}
	for (const step of STEP_KEYS) if (isRecord(storedSteps[step])) steps[step] = toValues(storedSteps[step])

	const diseases = Array.isArray(parsed.diseases)
		? parsed.diseases.filter(isRecord).map((row) => ({
				name: typeof row.name === "string" ? row.name : "",
				status: typeof row.status === "string" ? row.status : "",
			}))
		: []
	const locked = Array.isArray(parsed.locked) ? parsed.locked.filter((key): key is string => typeof key === "string") : []

	return { steps, diseases, locked }
}

export const readDraft = (userId: number | string, society: WizardSociety): WizardDraftState => {
	try {
		return parseDraft(window.localStorage.getItem(storageKey(userId, society)))
	} catch {
		return emptyDraft()
	}
}

export const writeDraft = (userId: number | string, society: WizardSociety, draft: WizardDraftState): void => {
	try {
		window.localStorage.setItem(storageKey(userId, society), JSON.stringify(draft))
	} catch {
		// Storage full or blocked: the in-memory draft still drives the page
	}
}

export const clearDraft = (userId: number | string, society: WizardSociety): void => {
	try {
		window.localStorage.removeItem(storageKey(userId, society))
	} catch {
		// Storage blocked: nothing to clear
	}
}

export const stepValues = (
	draft: WizardDraftState,
	step: SocietyDraftStepKey,
	extraDefaults?: Partial<Record<SocietyDraftStepKey, SocietyValues>>,
): SocietyValues => ({
	...LEGACY_STEP_DEFAULTS[step],
	...extraDefaults?.[step],
	...draft.steps[step],
})

export const mergedValues = (
	draft: WizardDraftState,
	extraDefaults?: Partial<Record<SocietyDraftStepKey, SocietyValues>>,
): SocietyValues =>
	STEP_KEYS.reduce<SocietyValues>((all, step) => ({ ...all, ...stepValues(draft, step, extraDefaults) }), {})
