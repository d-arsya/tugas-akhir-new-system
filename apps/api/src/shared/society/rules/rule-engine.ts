import type { FieldSpec, Rule, RuleSet, SocietyUpload } from "./rule-types"
import { messageFor } from "./rule-messages"

// OWNER: AK-A. A small port of the Laravel 8.83 validator loop (`Illuminate\Validation\Validator::passes`,
// `validateAttribute`, `isValidatable`, `shouldStopValidating`) — only the rules the society requests use.
// Input is what the legacy middleware left: strings trimmed (`TrimStrings`, passwords excepted) and ""
// turned into null (`ConvertEmptyStringsToNull`). A key missing from `values` is "not present".

/** PHP `is_numeric` on an already-trimmed string. */
const NUMERIC = /^[+-]?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?$/

/** Close to egulias `RFCValidation` (Laravel's default `email`): a dot-less domain is allowed. */
const EMAIL =
	/^(?!\.)(?!.*\.\.)[A-Za-z0-9!#$%&'*+/=?^_`{|}~.-]+(?<!\.)@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)*$/

const IMPLICIT = new Set<Rule["name"]>(["required", "required_if", "required_with"])

export type EngineInput = {
	values: ReadonlyMap<string, string | null>
	files: Readonly<Record<string, SocietyUpload>>
}

/** `UploadedFile::guessExtension()` (content sniffing) ∈ jpg, jpeg, png, gif, bmp, svg, webp. */
const isImage = (file: SocietyUpload): boolean => {
	const b = file.buffer
	if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return true
	if (b.length >= 8 && b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return true
	const head = b.subarray(0, 12).toString("latin1")
	if (head.startsWith("GIF87a") || head.startsWith("GIF89a") || head.startsWith("BM")) return true
	if (head.startsWith("RIFF") && head.slice(8, 12) === "WEBP") return true
	return /<svg[\s>]/i.test(b.subarray(0, 1024).toString("utf8"))
}

const isRequiredValue = (value: string | null | SocietyUpload | undefined): boolean => {
	if (value === undefined || value === null) return false
	if (typeof value === "string") return value.trim() !== ""
	return true
}

const hasNumericRule = (spec: FieldSpec): boolean => spec.rules.some((rule) => rule.name === "numeric")

/** `getSize`: the number itself under a numeric rule, kilobytes for a file, else the string length. */
const sizeOf = (spec: FieldSpec, value: string | SocietyUpload): number => {
	if (typeof value !== "string") return value.size / 1024
	if (hasNumericRule(spec) && NUMERIC.test(value)) return Number(value)
	return Array.from(value).length
}

type Lookup = (field: string) => string | null | SocietyUpload | undefined

/** One rule against one value; true = passes. */
const passes = async (rule: Rule, spec: FieldSpec, value: string | null | SocietyUpload | undefined, get: Lookup): Promise<boolean> => {
	switch (rule.name) {
		case "nullable":
			return true
		case "required":
			return isRequiredValue(value)
		case "required_summernote":
			// `!empty($value) && $value != "<p><br></p>"` (PHP `empty("0")` is true)
			return typeof value === "string" && value !== "" && value !== "0" && value !== "<p><br></p>"
		case "prohibited":
			return false
		case "required_if": {
			const other = get(rule.other)
			if (other === undefined) return true
			return typeof other === "string" && rule.values.includes(other) ? isRequiredValue(value) : true
		}
		case "required_with":
			return rule.others.every((other) => !isRequiredValue(get(other))) ? true : isRequiredValue(value)
		case "string":
			return typeof value === "string"
		case "numeric":
			return typeof value === "string" && NUMERIC.test(value)
		case "min":
			return value !== null && value !== undefined && sizeOf(spec, value) >= rule.value
		case "max":
			return value !== null && value !== undefined && sizeOf(spec, value) <= rule.value
		case "digits":
			return typeof value === "string" && !/[^0-9]/.test(value) && value.length === rule.value
		case "digits_between":
			return typeof value === "string" && !/[^0-9]/.test(value) && value.length >= rule.min && value.length <= rule.max
		case "in":
			return typeof value === "string" && rule.values.includes(value)
		case "email":
			return typeof value === "string" && EMAIL.test(value)
		case "boolean":
			// Legacy accepts 0/1 only (form radios); "true"/"false" are accepted too for JSON-minded clients
			return typeof value === "string" && ["0", "1", "true", "false"].includes(value)
		case "confirmed":
			return value === (get(`${spec.field}_confirmation`) ?? null)
		case "image":
			return value !== null && typeof value === "object" && isImage(value)
		case "unique":
			return typeof value === "string" ? !(await rule.taken(value)) : true
	}
}

/**
 * `ValidationRuleParser::explodeRules`: a `name.*` entry is replaced by one entry per posted index, and
 * those land after every plain entry (PHP appends the new keys, then unsets the wildcard).
 */
const expandWildcards = (fields: FieldSpec[], values: ReadonlyMap<string, string | null>): FieldSpec[] => {
	const plain = fields.filter((spec) => !spec.field.endsWith(".*"))
	const expanded = fields
		.filter((spec) => spec.field.endsWith(".*"))
		.flatMap((spec) => {
			const base = spec.field.slice(0, -2)
			const pattern = new RegExp(`^${base}\\.(\\d+)$`)
			// Array.from, not a spread: SWC loose mode turns an iterator spread into `[].concat(iterator)`
			return Array.from(values.keys())
				.filter((key) => pattern.test(key))
				.map((key) => ({ ...spec, field: key }))
		})
	return [...plain, ...expanded]
}

/**
 * Runs every field of `set` in order and returns `{ field: first message }` (legacy `@error` and the
 * seam type show one message per field). Empty when everything passes.
 */
export const runRules = async (set: RuleSet, input: EngineInput): Promise<Record<string, string>> => {
	const errors: Record<string, string> = {}
	const get: Lookup = (field) => (field in input.files ? input.files[field] : input.values.has(field) ? (input.values.get(field) ?? null) : undefined)

	for (const spec of expandWildcards(set.fields, input.values)) {
		const value = get(spec.field)
		const present = value !== undefined
		const nullable = spec.rules.some((rule) => rule.name === "nullable")
		let failedImplicit = false

		for (const rule of spec.rules) {
			const implicit = IMPLICIT.has(rule.name)
			// `presentOrRuleIsImplicit` + `isNotNullIfMarkedAsNullable` + `hasNotFailedPreviousRuleIfPresenceRule`
			if (!present && !implicit) continue
			if (!implicit && nullable && value === null) continue
			if (rule.name === "unique" && spec.field in errors) continue
			// Deviation: `prohibited` fails only on a non-empty value. Legacy never renders a hidden field, so it
			// is never posted; an empty key a new client sends for one is tolerated rather than rejected.
			if (rule.name === "prohibited" && !isRequiredValue(value)) continue

			if (!(await passes(rule, spec, value, get))) {
				if (!(spec.field in errors)) errors[spec.field] = messageFor(set, spec, rule, value, get)
				if (implicit) failedImplicit = true
			}
			// `shouldStopValidating`: bail stops at the first message, a failed implicit rule always stops
			if ((spec.bail && spec.field in errors) || failedImplicit) break
		}
	}

	return errors
}
