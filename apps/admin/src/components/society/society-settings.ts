import type { SettingFormItem } from "@roja/types"

// Ports of the `app/Helpers/Helper.php` helpers the society blades call on `$setting_forms`.

export type SocietySettingLookup = {
	/** `getInputStatus($setting_forms, $id)` — a missing row is off. */
	status: (id: number) => boolean
	/** `getInputLabel($setting_forms, $id)` — `custom_name ?? default`. */
	label: (id: number) => string
	/** `formInfoText($setting_forms, $id)` — from `admin_required`. */
	info: (id: number) => "required" | "optional"
	/** `lineVisible($setting_forms, $min, $max)` — any row in the id range is on. */
	lineVisible: (minId: number, maxId: number) => boolean
}

export const societySettingLookup = (settings: readonly SettingFormItem[]): SocietySettingLookup => {
	const byId = new Map<number, SettingFormItem>()
	for (const row of settings) byId.set(row.id, row)
	const status = (id: number): boolean => byId.get(id)?.status === true
	return {
		status,
		label: (id) => byId.get(id)?.label ?? "",
		info: (id) => (byId.get(id)?.adminRequired === true ? "required" : "optional"),
		lineVisible: (minId, maxId) => {
			for (let id = minId; id <= maxId; id++) if (status(id)) return true
			return false
		},
	}
}
