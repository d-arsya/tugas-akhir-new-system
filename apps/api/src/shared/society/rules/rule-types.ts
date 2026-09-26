import type { SocietyStepKey } from "@roja/types"

// OWNER: AK-A. Shapes shared by the society rule engine and the legacy request definitions.

/** A multer file, narrowed to what the rules and the uploader read. */
export type SocietyUpload = {
	fieldname: string
	originalname: string
	mimetype: string
	size: number
	buffer: Buffer
}

/** The Laravel rules the society form requests use (`resources/lang/id/validation.php` has their messages). */
export type Rule =
	| { name: "required" }
	| { name: "nullable" }
	| { name: "prohibited" }
	/** `App\Rules\RequiredSummernote` — a rule object, so not implicit: an absent key is not checked. */
	| { name: "required_summernote" }
	| { name: "string" }
	| { name: "numeric" }
	| { name: "min"; value: number }
	/** Only used on uploads here (`max:2048` kilobytes). */
	| { name: "max"; value: number }
	| { name: "digits"; value: number }
	| { name: "digits_between"; min: number; max: number }
	| { name: "in"; values: readonly string[] }
	| { name: "email" }
	| { name: "boolean" }
	| { name: "confirmed" }
	| { name: "required_with"; others: readonly string[] }
	| { name: "required_if"; other: string; values: readonly string[] }
	/** `unique:…`; `taken` answers whether another row already holds the value. */
	| { name: "unique"; taken: (value: string) => Promise<boolean> }
	| { name: "image" }

/** One `rules()` entry: the input name, its rules in order, whether `bail` is in the list. */
export type FieldSpec = {
	field: string
	rules: Rule[]
	bail?: boolean
	/** The wizard step / edit tab the field belongs to; null = not a society form field. */
	step: SocietyStepKey | null
}

/** One legacy FormRequest: `rules()` in order, `attributes()`, `messages()`. */
export type RuleSet = {
	fields: FieldSpec[]
	/** Input name (or `disease_name.*` pattern) → `:attribute` text. */
	attributes: Record<string, string>
	/** `field.rule` (or `disease_name.*.required`) → message. */
	messages: Record<string, string>
}
