import type { EntityManager } from "typeorm"

import type { SocietyDisease, SocietyStepKey } from "@roja/types"
import { throwFieldErrors } from "../../core/errors/field-errors"

import { runRules } from "./rules/rule-engine"
import type { RuleSet, SocietyUpload } from "./rules/rule-types"
import { columnValue, isNotAColumn } from "./rules/society-output"
import type { SettingForm, SettingForms } from "./rules/society-requests"
import {
	alumniUpdateSet,
	createStepSets,
	registrantUpdateSet,
	studentUpdateSet,
	updateUploadSet,
	type VariantContext,
} from "./rules/society-variants"

export type { SocietyUpload } from "./rules/rule-types"

// OWNER: AK-A. Port of the legacy society form requests (rules, attributes, messages) on top of a small
// Laravel-validator emulation in `./rules/*`.

/**
 * The legacy form requests this validates, one per variant:
 *   registrant-create → `Register\{Personal,Identity,Family,Guardian,Attachment}Request` (+ step-1 academic_year_id / level_id / registration_path)
 *   registrant-update → `Register\UpdateRequest` (all steps for admin-registered rows, `is_blocked` only for portal rows)
 *   student-create    → `Student\{Personal,Identity,Family,Guardian,Attachment}Request` (+ grade / sub_grade / source / nis)
 *   student-update    → `Student\UpdateRequest` (+ nis digits:7 unique, email, password, is_blocked)
 *   alumni-update     → `Alumni\AlumniRequest` (Student\UpdateRequest minus academic_year_id, level_id, email, is_blocked, plus the alumni fields)
 *
 * Contract details:
 *   - `values` are trimmed (passwords excepted) and "" means empty (legacy TrimStrings + ConvertEmptyStringsToNull).
 *   - A key that is not in `values` is "not posted": its rules are skipped unless implicit (required…), and it is
 *     not in `columns` — so an edit never overwrites a column whose input was not rendered (hidden setting).
 *   - A hidden setting (`status` off) is `prohibited`: a non-empty value answers ":Attribute tidak boleh ada.".
 *     Do not post the keys of hidden fields (legacy does not render them); an empty value is tolerated.
 *   - Errors: 400 `{ message, errors: { field: firstMessage } }`, fields in legacy rule order; disease rows are
 *     keyed `disease_name.N` / `disease_status.N` (N = index in `diseases`) and come last, as in Laravel.
 *   - `columns` holds every posted field the request validated, society or not (academic_year_id, level_id,
 *     registration_path, grade, sub_grade, source, nis, email, password (raw — hash it), is_blocked (boolean),
 *     dropout_note, major_name, alumni_*); the caller routes each to its table. `date_of_birth` is `Y-m-d`.
 *   - Edit saves (`*-update`) have no attachment rules in legacy; an uploaded file must still be `image|max:2048`.
 *   - Portal registrant rows: only `is_blocked` is validated / returned, `diseases` is [] (legacy never rewrites them).
 */
export type SocietyRuleVariant = "registrant-create" | "registrant-update" | "student-create" | "student-update" | "alumni-update"

export type SocietyRuleInput = {
	variant: SocietyRuleVariant
	/** Validate one wizard step only (legacy `validate*Data`); omit for a full edit save or the final create. */
	step?: SocietyStepKey
	/** Every posted text field, keyed by input name (legacy `$request->all()`), society and non-society alike. */
	values: Record<string, string>
	diseases: SocietyDisease[]
	/** `attach_*` uploads by column. */
	files: Record<string, SocietyUpload>
	/** Row being updated (registrant id, student id, alumni id) for `unique:…,{id}` rules. */
	ignoreId?: number
	/** PSB edit of a portal-registered row (`registered_by_admin = 0`): legacy validates `is_blocked` only. */
	portalRow?: boolean
}

export type SocietyValidated = {
	/** Column → value ready for SQL: only columns this variant may write; empty optional → null. */
	columns: Record<string, string | number | boolean | null>
	diseases: SocietyDisease[]
	/** The accepted uploads by column (store them with `storeSocietyUpload`). */
	uploads: Record<string, SocietyUpload>
}

const STEPS: readonly SocietyStepKey[] = ["personal", "identity", "family", "guardian", "attachment"]
const UNTRIMMED = new Set(["password", "password_confirmation", "current_password"])

/** `SettingForm::all()` */
const loadSettings = async (manager: EntityManager): Promise<SettingForms> => {
	const rows = (await manager.query(
		`SELECT id, status, admin_required, custom_name, "default" FROM tbr_setting_forms`,
	)) as Array<{ id: string; status: boolean | null; admin_required: boolean | null; custom_name: string | null; default: string | null }>
	return new Map<number, SettingForm>(
		rows.map((row) => [
			Number(row.id),
			{ id: Number(row.id), status: row.status === true, adminRequired: row.admin_required === true, label: row.custom_name ?? row.default },
		]),
	)
}

/** TrimStrings + ConvertEmptyStringsToNull over the posted values and the disease rows. */
const normalize = (values: Record<string, string>, diseases: SocietyDisease[]): Map<string, string | null> => {
	const out = new Map<string, string | null>()
	const put = (key: string, raw: string): void => {
		const value = UNTRIMMED.has(key) ? raw : raw.trim()
		out.set(key, value === "" ? null : value)
	}
	for (const [key, raw] of Object.entries(values)) if (typeof raw === "string") put(key, raw)
	diseases.forEach((row, index) => {
		put(`disease_name.${index}`, row.name ?? "")
		put(`disease_status.${index}`, row.status ?? "")
	})
	return out
}

const onlyStep = (set: RuleSet, step: SocietyStepKey | undefined): RuleSet =>
	step ? { ...set, fields: set.fields.filter((spec) => spec.step === step) } : set

/** The request(s) one call validates, in order. */
const ruleSetsFor = (input: SocietyRuleInput, ctx: VariantContext): RuleSet[] => {
	const uploads = Object.keys(input.files)
	switch (input.variant) {
		case "registrant-create":
		case "student-create": {
			const steps = createStepSets(input.variant, ctx)
			return (input.step ? [input.step] : STEPS).map((step) => steps[step])
		}
		case "registrant-update":
			return [onlyStep(registrantUpdateSet(ctx, input.portalRow === true), input.step), onlyStep(updateUploadSet(ctx.settings, uploads), input.step)]
		case "student-update":
			return [onlyStep(studentUpdateSet(ctx), input.step), onlyStep(updateUploadSet(ctx.settings, uploads), input.step)]
		case "alumni-update":
			return [onlyStep(alumniUpdateSet(ctx), input.step), onlyStep(updateUploadSet(ctx.settings, uploads), input.step)]
	}
}

/**
 * Setting-form-driven validation with the legacy messages, in legacy `rules()` order. Throws via
 * `throwFieldErrors` (400 `{ message, errors }`) exactly like the ported Data Master forms.
 */
export const validateSocietyInput = async (manager: EntityManager, input: SocietyRuleInput): Promise<SocietyValidated> => {
	const ctx: VariantContext = { manager, settings: await loadSettings(manager), ignoreId: input.ignoreId ?? null }
	const values = normalize(input.values, input.diseases)
	const sets = ruleSetsFor(input, ctx)

	const errors: Record<string, string> = {}
	for (const set of sets) Object.assign(errors, await runRules(set, { values, files: input.files }))
	if (Object.keys(errors).length > 0) throwFieldErrors(errors)

	const fields = sets.flatMap((set) => set.fields)
	const columns: SocietyValidated["columns"] = {}
	const uploads: SocietyValidated["uploads"] = {}
	for (const { field } of fields) {
		if (field.startsWith("attach_")) {
			const file = input.files[field]
			if (file) uploads[field] = file
			continue
		}
		if (isNotAColumn(field) || !values.has(field)) continue
		columns[field] = columnValue(input.variant, field, values.get(field) ?? null)
	}

	const validatesDiseases = fields.some((spec) => spec.field === "disease_name.*")
	const diseases = validatesDiseases
		? input.diseases.map((row, index) => ({
				name: values.get(`disease_name.${index}`) ?? "",
				status: values.get(`disease_status.${index}`) ?? "",
			}))
		: []

	return { columns, diseases, uploads }
}

/**
 * Turns a multer body + files into `values` / `diseases` / `files` (the multipart convention in
 * `libs/types/src/admin-society.ts`: text fields by name, `diseases` as a JSON string, files by column).
 * A malformed `diseases` field reads as no rows.
 */
export const readSocietyMultipart = (
	body: Record<string, unknown>,
	files: Record<string, SocietyUpload[] | undefined> | undefined,
): Pick<SocietyRuleInput, "values" | "diseases" | "files"> => {
	const values: Record<string, string> = {}
	for (const [key, value] of Object.entries(body ?? {})) {
		if (key === "diseases") continue
		if (typeof value === "string") values[key] = value
		else if (typeof value === "number" || typeof value === "boolean") values[key] = String(value)
	}

	let parsed: unknown = body?.["diseases"]
	if (typeof parsed === "string") {
		try {
			parsed = JSON.parse(parsed)
		} catch {
			parsed = []
		}
	}
	const diseases: SocietyDisease[] = Array.isArray(parsed)
		? parsed
				.filter((row): row is Record<string, unknown> => typeof row === "object" && row !== null)
				.map((row) => ({
					name: typeof row["name"] === "string" ? row["name"] : "",
					status: typeof row["status"] === "string" ? row["status"] : "",
				}))
		: []

	const uploads: Record<string, SocietyUpload> = {}
	for (const [key, list] of Object.entries(files ?? {})) {
		const first = list?.[0]
		if (first) uploads[key] = first
	}

	return { values, diseases, files: uploads }
}
