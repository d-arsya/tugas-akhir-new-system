export type FormSetting = {
	id: number
	type: string
	helper: string | null
	group: string
	subGroup: string | null
	default: string
	customName: string | null
	status: boolean
	visibility: boolean
	registrantRequired: boolean
	adminRequired: boolean
}

export const getFieldSetting = (settings: FormSetting[] | undefined, id: number): FormSetting | undefined => {
	return settings?.find((s) => s.id === id)
}

export const isFieldVisible = (settings: FormSetting[] | undefined, id: number): boolean => {
	if (!settings || settings.length === 0) return true
	const setting = getFieldSetting(settings, id)
	return setting ? setting.status && setting.visibility : false
}

export const getFieldLabel = (settings: FormSetting[] | undefined, id: number, fallback = ""): string => {
	const setting = getFieldSetting(settings, id)
	if (!setting) return fallback
	return setting.customName || setting.default || fallback
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
