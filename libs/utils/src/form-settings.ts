export type FormSetting = {
	id: number
	type: string
	helper: string | null
	group: string
	subGroup?: string | null
	sub_group?: string | null
	default: string
	customName?: string | null
	custom_name?: string | null
	status: boolean | number
	visibility: boolean | number
	registrantRequired?: boolean | number
	registrant_required?: boolean | number
	adminRequired?: boolean | number
	admin_required?: boolean | number
}

export const ACCORDION_LABEL_IDS = [22, 29, 31, 34, 36, 51, 53, 61]

export const getFieldSetting = (settings: FormSetting[] | undefined, id: number): FormSetting | undefined => {
	return settings?.find((s) => s.id === id)
}

export const isFieldVisible = (settings: FormSetting[] | undefined, id: number): boolean => {
	if (!settings || settings.length === 0) return true
	const setting = getFieldSetting(settings, id)
	if (!setting) return false

	const isStatusTrue = Boolean(setting.status)
	const isVisibilityTrue = Boolean(setting.visibility)

	if (ACCORDION_LABEL_IDS.includes(id)) {
		const settingSubGroup = setting.subGroup ?? setting.sub_group
		const childSettings = settings.filter((s) => {
			if (ACCORDION_LABEL_IDS.includes(s.id)) return false
			const sSubGroup = s.subGroup ?? s.sub_group
			if (settingSubGroup && sSubGroup) {
				return sSubGroup === settingSubGroup
			}
			return s.group === setting.group
		})
		if (childSettings.length === 0) return true
		return childSettings.some((s) => Boolean(s.status) && Boolean(s.visibility))
	}

	return isStatusTrue && isVisibilityTrue
}

export const GROUP_ID_RANGES: Record<string, number[]> = {
	"personal data": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21],
	"identity data": [22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35],
	"family data": [36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52],
	"guardian data": [53, 54, 55, 56, 57, 58, 59, 60, 61, 62],
	"attachment data": [63, 64, 65, 66, 67, 68, 69],
}

export const isGroupAllInvisible = (settings: FormSetting[] | undefined, groupOrIds: string | number[]): boolean => {
	let idsToCheck: number[] = []
	if (Array.isArray(groupOrIds)) {
		idsToCheck = groupOrIds
	} else if (GROUP_ID_RANGES[groupOrIds]) {
		idsToCheck = GROUP_ID_RANGES[groupOrIds]
	} else if (settings && settings.length > 0) {
		idsToCheck = settings.filter((s) => s.group === groupOrIds || s.subGroup === groupOrIds || s.sub_group === groupOrIds).map((s) => s.id)
	}

	if (idsToCheck.length === 0) return false
	return idsToCheck.every((id) => !isFieldVisible(settings, id))
}

export const isFieldRequired = (settings: FormSetting[] | undefined, id: number, fallback = false): boolean => {
	if (!settings) return fallback
	const setting = getFieldSetting(settings, id)
	if (!setting) return false
	const req = setting.registrantRequired ?? setting.registrant_required ?? false
	return Boolean(setting.status) && Boolean(setting.visibility) && Boolean(req)
}

export const getFieldLabel = (settings: FormSetting[] | undefined, id: number, fallback = ""): string => {
	const setting = getFieldSetting(settings, id)
	if (!setting) return fallback
	return setting.customName || setting.custom_name || setting.default || fallback
}

export const getFieldOptions = (
	settings: FormSetting[] | undefined,
	id: number,
	fallback: string[] = []
): string[] => {
	const setting = getFieldSetting(settings, id)
	if (!setting || !setting.helper) return fallback
	const options = setting.helper
		.split(",")
		.map((o) => o.trim())
		.filter(Boolean)
	return options.length > 0 ? options : fallback
}

export const getOptionValue = (optionText: string, settingId?: number): string => {
	const text = optionText.trim().toLowerCase()

	// Gender (setting 4)
	if (settingId === 4 || text.includes("laki") || text === "pria" || text === "male") {
		if (text.includes("laki") || text === "pria" || text === "male") return "male"
		if (text.includes("perempuan") || text === "wanita" || text === "female") return "female"
	}

	// Nationality (setting 7, 56)
	if (text === "wni") return "wni"
	if (text === "wna") return "wna"

	// Live with (setting 8)
	if (text.includes("orang tua") || text === "parent") return "parent"
	if (text.includes("wali") || text === "guardian") return "guardian"

	// Parent status (setting 10)
	if (text.includes("ayah") && text.includes("ibu")) return "father&mother"
	if (text.includes("yatim piatu") || text === "orphan") return "orphan"
	if (text.includes("yatim") || text === "fatherless") return "fatherless"
	if (text.includes("piatu") || text === "motherless") return "motherless"

	// Child status (setting 11)
	if (text.includes("kandung")) return "biological_child"
	if (text.includes("tiri")) return "step_child"
	if (text.includes("asuh") || text.includes("angkat")) return "adopted_child"

	// Visual condition (setting 25)
	if (text === "normal") return "normal"
	if (text.includes("kacamata") || text.includes("tidak normal") || text === "abnormal") return "abnormal"

	// Hearing condition (setting 26)
	if (text === "normal") return "normal"
	if (text.includes("kurang") || text.includes("peka") || text.includes("tidak normal") || text === "abnormal") return "abnormal"

	// Immunization (setting 27)
	if (text === "lengkap" || text === "complete") return "complete"
	if (text === "tidak lengkap" || text === "incomplete") return "incomplete"
	if (text.includes("tidak") || text === "not_at_all") return "not_at_all"

	// Reading (setting 32)
	if (text.includes("quran") || text.includes("qur'an")) return "quran"
	if (text.includes("jilid")) return "jilid"

	// Disease status
	if (text.includes("sembuh") && !text.includes("belum")) return "sembuh"
	if (text.includes("rawat") || text.includes("perawatan")) return "masa perawatan"
	if (text.includes("belum")) return "belum sembuh"

	// Blood type (setting 24)
	if (["a", "b", "ab", "o"].includes(text)) return text

	// Religion & Education or other defaults to lowercased text
	return text
}
