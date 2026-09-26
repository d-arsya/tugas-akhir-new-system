// ── Akademik: the shared "society" form (santri, pendaftar, alumni) ─────────────────────────
//
// Legacy renders one setting-form-driven form (`tbr_setting_forms`, ids 1–69) for three record
// kinds: the PSB wizard + edit page, the Santri wizard + edit page and the Alumni detail page.
// These types are the seam between the workstreams: the form UI (owner AK-P), the wizard shell
// (owner AK-S) and the server rules / print / record loader (owner AK-A). The per-field registry
// (which columns a field writes, its option values) is `SOCIETY_FIELDS` in `@roja/utils`.
//
// Lead-owned and frozen: ask the lead before changing anything here.

/** The three legacy record kinds; also the `tbr_disease_histories.society` values. */
export type SocietyKind = "registrant" | "student" | "alumni"

/** Wizard steps and edit tabs, in legacy order. */
export type SocietyStepKey = "personal" | "identity" | "family" | "guardian" | "attachment"

/** The steps the wizard validates on "Selanjutnya"; attachments are validated by the final save. */
export type SocietyDraftStepKey = Exclude<SocietyStepKey, "attachment">

/**
 * Form values keyed by the legacy input name, which is also the DB column. Everything is a
 * string, as a form posts it: dates `YYYY-MM-DD`, codes and ids as digits, an empty input "".
 */
export type SocietyValues = Record<string, string>

/** One `tbr_disease_histories` row as the form edits it (legacy `disease_name[]` / `disease_status[]`). */
export type SocietyDisease = { name: string; status: string }

/** A record as the edit / detail pages load it. */
export type SocietyRecord = {
	values: SocietyValues
	diseases: SocietyDisease[]
	/**
	 * `attach_*` column → absolute URL for display, `null` when empty. Legacy rows hold a relative
	 * public-disk key (`2023/11/06/<md5>.jpeg`); PSB-portal rows may hold a full URL already.
	 */
	attachmentUrls: Record<string, string | null>
}

/** Field errors keyed by input name, first message per field (legacy `@error` shows one). */
export type SocietyFieldErrors = Record<string, string>

/** What the wizard keeps between steps (legacy session `*-data`). Attachments are never drafted. */
export type SocietyDraft = {
	values: SocietyValues
	diseases: SocietyDisease[]
}

/**
 * Body of a wizard step check (`POST …/create/validate/:step`). The server answers 200 with
 * `{ message: "OK" }` or a 400 field-error body (`{ message, errors }`), like `throwFieldErrors`.
 */
export type SocietyStepCheckDto = SocietyDraft

/**
 * Multipart convention for the final wizard save and the edit saves:
 *   - every value of `SocietyValues` as its own text field, under its input name;
 *   - `diseases` as one text field holding `JSON.stringify(SocietyDisease[])`;
 *   - each chosen `attach_*` file as a file field under its column name.
 * The server rules (`validateSocietyInput`) read exactly this shape. (`libs/types` holds types
 * only, so the field name `diseases` is a convention, not an exported constant.)
 */
export type SocietyMultipartDiseasesField = "diseases"
