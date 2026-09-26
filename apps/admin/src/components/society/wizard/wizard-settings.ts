import type { SettingFormItem, SocietyDraftStepKey, SocietyStepKey, SocietyValues } from "@roja/types"
import { SOCIETY_FIELDS, SOCIETY_STEP_GROUPS } from "@roja/utils"

// Helpers the wizard needs from the setting forms (`tbr_setting_forms`, flat and sorted by id from
// `useSocietySettings`) — ports of `app/Helpers/Helper.php` `getInputStatus`, `lineVisible` and `getGroupAllDisable`.

/** `getInputStatus($setting_forms, $id)` — a missing row is off. */
export const inputStatus = (settings: readonly SettingFormItem[], id: number): boolean =>
	settings.find((row) => row.id === id)?.status === true

/** `lineVisible($setting_forms, $min, $max)` — the `hr.tbr_divider_solid` under the step-1 header rows. */
export const lineVisible = (settings: readonly SettingFormItem[], minId: number, maxId: number): boolean => {
	for (let id = minId; id <= maxId; id++) if (inputStatus(settings, id)) return true
	return false
}

/** Accordion labels each create blade passes as `getGroupAllDisable(..., $except)`. */
const GROUP_EXCEPT: Readonly<Record<SocietyStepKey, readonly number[]>> = {
	personal: [],
	identity: [22, 29, 31, 34],
	family: [36, 51],
	guardian: [53, 61],
	attachment: [],
}

/** `getGroupAllDisable($setting_forms, '<group> data', $except)` — every field of the step is switched off. */
export const groupAllDisable = (settings: readonly SettingFormItem[], step: SocietyStepKey): boolean => {
	const group = SOCIETY_STEP_GROUPS[step]
	const except = GROUP_EXCEPT[step]
	return !settings.some((row) => row.group === group && !except.includes(row.id) && row.status)
}

// Column → setting id, from the field registry (a column belongs to exactly one field)
const FIELD_OF_COLUMN = new Map<string, { id: number; step: SocietyStepKey }>()
for (const field of SOCIETY_FIELDS) {
	const columns = [...field.columns, ...Object.values(field.columnsBySociety ?? {}).flat()]
	for (const column of columns) if (!FIELD_OF_COLUMN.has(column)) FIELD_OF_COLUMN.set(column, { id: field.id, step: field.step })
}

/**
 * What the legacy form would post: a hidden field (`status` off) is not rendered, so it is not
 * posted — and the server answers `prohibited` if it were. Keys that are not society columns (the
 * step-1 header: year, Kelas, Jalur, NISP …) always travel with step 1 and with the final save.
 */
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

/** Legacy posts the disease repeater only when setting 28 is on (the identity step renders it). */
export const diseasesVisible = (settings: readonly SettingFormItem[]): boolean => inputStatus(settings, 28)
