import type { FieldSpec, Rule, RuleSet, SocietyUpload } from "./rule-types"

// OWNER: AK-A. Laravel 8.83 `FormatsMessages` for the society rules: custom `messages()` first (with `*`
// patterns), else `resources/lang/id/validation.php` (verbatim, incl. the missing period of `boolean`),
// then `makeReplacements` (`:attribute` / `:Attribute`, `:min`, `:max`, `:digits`, `:values`, `:other`, `:value`).

const LANG: Record<string, string> = {
	required: "Kolom :attribute wajib untuk diisi.",
	prohibited: ":Attribute tidak boleh ada.",
	string: ":Attribute harus berupa string.",
	numeric: ":Attribute harus berupa angka.",
	"min.numeric": ":Attribute minimal bernilai :min.",
	"min.file": ":Attribute minimal berukuran :min kilobita.",
	"min.string": ":Attribute minimal berisi :min karakter.",
	"max.numeric": ":Attribute maksimal bernilai :max.",
	"max.file": ":Attribute maksimal berukuran :max kilobita.",
	"max.string": ":Attribute maksimal berisi :max karakter.",
	digits: ":Attribute harus terdiri dari :digits angka.",
	digits_between: ":Attribute harus terdiri dari :min sampai :max digit.",
	in: ":Attribute yang dipilih tidak valid.",
	email: ":Attribute harus berupa alamat surel yang valid.",
	boolean: ":Attribute harus bernilai true atau false",
	confirmed: "Konfirmasi :attribute tidak cocok.",
	required_with: ":Attribute wajib diisi bila terdapat :values.",
	required_if: ":Attribute wajib diisi bila :other adalah :value.",
	unique: ":Attribute sudah ada sebelumnya.",
	image: ":Attribute harus berupa gambar.",
}

/** `Str::ucfirst` */
const ucfirst = (text: string): string => text.charAt(0).toUpperCase() + text.slice(1)

/** Laravel's `*` source keys: `*` matches one dot-free segment. */
const matchesPattern = (pattern: string, key: string): boolean => {
	if (!pattern.includes("*")) return pattern === key
	const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, "([^.]*)")
	return new RegExp(`^${escaped}$`, "u").test(key)
}

const lookup = (source: Record<string, string>, key: string): string | undefined => {
	if (key in source) return source[key]
	const pattern = Object.keys(source).find((candidate) => candidate.includes("*") && matchesPattern(candidate, key))
	return pattern === undefined ? undefined : source[pattern]
}

/** `getDisplayableAttribute`: `attributes()` (exact, then the `*` form), else snake → spaces. */
export const attributeFor = (set: RuleSet, field: string): string => {
	const custom = lookup(set.attributes, field)
	if (custom !== undefined) return custom
	return field.replace(/_/g, " ")
}

/** `getDisplayableValue` for `:value` of `required_if`. */
const displayableValue = (value: string | null | SocietyUpload | undefined): string => {
	if (value === null || value === undefined) return "empty"
	return typeof value === "string" ? value : value.originalname
}

const sizeType = (spec: FieldSpec, value: string | null | SocietyUpload | undefined): "numeric" | "file" | "string" => {
	if (spec.rules.some((rule) => rule.name === "numeric")) return "numeric"
	if (value !== null && value !== undefined && typeof value === "object") return "file"
	return "string"
}

type Lookup = (field: string) => string | null | SocietyUpload | undefined

/** The message for `rule` failing on `spec.field`, with every placeholder replaced. */
export const messageFor = (
	set: RuleSet,
	spec: FieldSpec,
	rule: Rule,
	value: string | null | SocietyUpload | undefined,
	get: Lookup,
): string => {
	// A rule object (`RequiredSummernote`) answers with its own `message()`, never with `messages()`
	const ruleKey = rule.name === "required_summernote" ? "required" : rule.name
	const custom = rule.name === "required_summernote" ? undefined : lookup(set.messages, `${spec.field}.${ruleKey}`)
	const template =
		custom ??
		(rule.name === "min" || rule.name === "max" ? LANG[`${rule.name}.${sizeType(spec, value)}`] : LANG[ruleKey]) ??
		`validation.${ruleKey}`

	const attribute = attributeFor(set, spec.field)
	let message = template
		.replaceAll(":attribute", attribute)
		.replaceAll(":ATTRIBUTE", attribute.toUpperCase())
		.replaceAll(":Attribute", ucfirst(attribute))

	switch (rule.name) {
		case "min":
			message = message.replaceAll(":min", String(rule.value))
			break
		case "max":
			message = message.replaceAll(":max", String(rule.value))
			break
		case "digits":
			message = message.replaceAll(":digits", String(rule.value))
			break
		case "digits_between":
			message = message.replaceAll(":min", String(rule.min)).replaceAll(":max", String(rule.max))
			break
		case "required_with":
			message = message.replaceAll(":values", rule.others.map((other) => attributeFor(set, other)).join(" / "))
			break
		case "required_if":
			message = message
				.replaceAll(":other", attributeFor(set, rule.other))
				.replaceAll(":value", displayableValue(get(rule.other)))
			break
		default:
			break
	}

	return message
}
