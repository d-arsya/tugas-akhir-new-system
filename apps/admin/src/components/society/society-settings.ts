import type { SettingFormItem } from "@roja/types"

export type SocietySettingLookup = {
	status: (id: number) => boolean
	label: (id: number) => string
	info: (id: number) => "required" | "optional"
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
