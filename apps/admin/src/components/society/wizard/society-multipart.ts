import type { SocietyDisease, SocietyMultipartDiseasesField, SocietyValues } from "@roja/types"

const DISEASES_FIELD: SocietyMultipartDiseasesField = "diseases"

export const toSocietyFormData = (
	values: SocietyValues,
	diseases: SocietyDisease[],
	files: Partial<Record<string, File>> = {},
): FormData => {
	const form = new FormData()
	for (const [name, value] of Object.entries(values)) form.append(name, value)
	form.append(DISEASES_FIELD, JSON.stringify(diseases))
	for (const [name, file] of Object.entries(files)) if (file) form.append(name, file, file.name)
	return form
}
