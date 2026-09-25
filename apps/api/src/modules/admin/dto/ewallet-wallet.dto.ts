import { createZodDto } from "nestjs-zod"
import { z } from "zod"

// Query + body schemas for Akun Dompet (legacy `EwalletController` — list, widget, export,
// setting). Owned by WS D-A.

// Empty query values mean "no filter" (legacy ConvertEmptyStringsToNull + `$request->x == 'active'`)
const optionalText = z
	.string()
	.trim()
	.optional()
	.transform((value) => (value ? value : undefined))

const activeFilter = z
	.string()
	.optional()
	.transform((value) => (value === "active" || value === "inactive" ? value : undefined))

const memberFilter = z
	.string()
	.optional()
	.transform((value) => (value === "santri" || value === "merchant" ? value : undefined))

/**
 * The sortable columns of `ewallet-student-serverside.js` (`unique_id`, `ewalletable_name`,
 * `ewalletable_type`, `total_balance`, `ewallet_transactions_count`, `is_active`), keyed by the
 * contract's row fields instead of the DataTables column index.
 */
export const EWALLET_SORT_KEYS = [
	"uniqueId",
	"ownerName",
	"ownerType",
	"storedBalance",
	"transactionCount",
	"isActive",
] as const

export const EwalletListQuerySchema = z.object({
	page: z.coerce.number().int().positive().default(1),
	// `index.blade.php` — the `#show_entry_ewallet` select2
	limit: z.coerce
		.number()
		.int()
		.refine((value) => [10, 25, 50, 100].includes(value), { message: "limit harus 10, 25, 50 atau 100" })
		.default(10),
	search: optionalText,
	orderBy: z.enum(EWALLET_SORT_KEYS).optional(),
	orderDir: z.enum(["asc", "desc"]).optional(),
	status: activeFilter,
	member: memberFilter,
})
export class EwalletListQueryDto extends createZodDto(EwalletListQuerySchema) {}
export type EwalletListFilter = z.infer<typeof EwalletListQuerySchema>

/** `ewallet.widget` and `ewallet.export` take the same two filters and nothing else. */
export const EwalletFilterQuerySchema = z.object({
	status: activeFilter,
	member: memberFilter,
})
export class EwalletFilterQueryDto extends createZodDto(EwalletFilterQuerySchema) {}
export type EwalletFilter = z.infer<typeof EwalletFilterQuerySchema>

const blank = (input: unknown): boolean => input === undefined || input === null || input === ""

// `updateSetting`: `'is_active' => 'required|boolean'` (attribute name falls back to "is active").
// The legacy radios post "1"/"0"; the port posts a real boolean.
const isActive = z.preprocess(
	(input) => {
		if (input === "1" || input === 1) return true
		if (input === "0" || input === 0) return false
		return input
	},
	z.boolean({
		error: (issue) =>
			blank(issue.input) ? "Kolom is active wajib untuk diisi." : "Is active harus bernilai true atau false",
	}),
)

export const EwalletSettingSchema = z.object({ isActive })
export class EwalletSettingDto extends createZodDto(EwalletSettingSchema) {}
