import type { SettingFormItem, SocietyDraftStepKey, SocietyStepKey, SocietyValues } from "@roja/types"
import { SOCIETY_FIELDS, SOCIETY_STEP_GROUPS } from "@roja/utils"

export const inputStatus = (settings: readonly SettingFormItem[], id: number): boolean =>
	settings.find((row) => row.id === id)?.status === true

export const lineVisible = (settings: readonly SettingFormItem[], minId: number, maxId: number): boolean => {
	for (let id = minId; id <= maxId; id++) if (inputStatus(settings, id)) return true
	return false
}

const GROUP_EXCEPT: Readonly<Record<SocietyStepKey, readonly number[]>> = {
	personal: [],
	identity: [22, 29, 31, 34],
	family: [36, 51],
	guardian: [53, 61],
	attachment: [],
}

export const groupAllDisable = (settings: readonly SettingFormItem[], step: SocietyStepKey): boolean => {
	const group = SOCIETY_STEP_GROUPS[step]
	const except = GROUP_EXCEPT[step]
	return !settings.some((row) => row.group === group && !except.includes(row.id) && row.status)
}

const FIELD_OF_COLUMN = new Map<string, { id: number; step: SocietyStepKey }>()
for (const field of SOCIETY_FIELDS) {
	const columns = [...field.columns, ...Object.values(field.columnsBySociety ?? {}).flat()]
	for (const column of columns) if (!FIELD_OF_COLUMN.has(column)) FIELD_OF_COLUMN.set(column, { id: field.id, step: field.step })
}

export const postableValues = (
	values: SocietyValues,
	settings: readonly SettingFormItem[],
	step: SocietyDraftStepKey | "all",
): SocietyValues => {
	const out: SocietyValues = {}
	for (const [key, value] of Object.entries(values)) {
		const field = FIELD_OF_COLUMN.get(key)
		if (!field) {
			if (step === "all" || step === "personal") out[key] = value
			continue
		}
		if (step !== "all" && field.step !== step) continue
		if (inputStatus(settings, field.id)) out[key] = value
	}
	return out
}

export const diseasesVisible = (settings: readonly SettingFormItem[]): boolean => inputStatus(settings, 28)
