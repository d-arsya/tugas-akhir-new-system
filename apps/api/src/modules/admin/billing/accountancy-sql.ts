// Raw SQL behind the Akun page and its two delete pages — legacy `AccountancyController`
// + `app/Http/Services/AccountancyService.php`.
//
// `tbr_accountancies.parent_id` is a **varchar(191)** holding a numeric string, not a foreign
// key: this schema has none at all. Every link below therefore compares it as text, exactly
// as Eloquent's `childs()` / `parent()` (`hasMany(self, 'parent_id', 'id')`) do.
//
// Legacy walked the tree with a per-node lazy load — `$item->childs` inside a recursive
// `getChild()`, one query per node (N+1) — and carried the depth in a controller property.
// The port does it in one recursive CTE. The two are byte-identical on order and depth; see
// the note on `ACCOUNTANCY_TREE_SQL`.

export type AccountancyTreeSqlRow = {
	id: string
	name: string | null
	group: "income" | "expense" | null
	/** Depth-first pre-order depth, root = 0. `int4` — pg hands this back as a number. */
	level: number
	hasChildren: boolean
}

export type AccountancySqlRow = {
	id: string
	name: string | null
	is_parent: boolean | null
	/** varchar — a numeric string, `null` for a root. */
	parent_id: string | null
	group: "income" | "expense" | null
	is_student_cost: boolean | null
	note: string | null
	hasChildren: boolean
}

export type AccountancyOptionSqlRow = { id: string; name: string | null }

/** `EXISTS` beats `count(*)` here: legacy only ever asked `$account->childs->count() > 0`. */
const HAS_CHILDREN = `EXISTS (SELECT 1 FROM tbr_accountancies k WHERE k.parent_id = a.id::text)`

/**
 * The whole tree, flattened depth-first pre-order, one row per account.
 *
 * Roots are `is_parent = 1 AND parent_id IS NULL` — legacy's `list()` filter verbatim. An
 * account created as a root through the legacy form stored `parent_id = ''` (see the DTO)
 * and was excluded by that filter forever; the port writes NULL, so it shows up.
 *
 * `path` does two jobs. Ordering by it is depth-first pre-order with siblings ordered by id
 * (a parent's array is a prefix of each child's, and Postgres compares arrays element-wise),
 * and `NOT (c.id = ANY (t.path))` makes the walk terminate even if `parent_id` were ever
 * pointed into a loop — with no foreign keys, nothing else would.
 *
 * ⚠️ On the depth: `AccountancyService`'s walker decrements its counter once per *call*
 * rather than per sibling, which looks like it should drift once a tree branches. It does
 * not. Every recursive call is preceded by exactly one `$this->level++` and ends with
 * exactly one `$this->level--`, so the pair cancels and each node is emitted at its true
 * depth; the only unbalanced decrement is the one closing the top-level call, which leaves
 * the property at -1 after the walk and is never read. Verified against a transcription of
 * the PHP on a synthetic five-level, multi-branch tree — including the pop-three-levels
 * case — row for row: identical order, identical level.
 */
export const ACCOUNTANCY_TREE_SQL = `WITH RECURSIVE tree AS (
		SELECT a.id, a.name, a."group", 0 AS level, ARRAY[a.id] AS path
		FROM tbr_accountancies a
		WHERE a.is_parent = true AND a.parent_id IS NULL
		UNION ALL
		SELECT c.id, c.name, c."group", t.level + 1, t.path || c.id
		FROM tbr_accountancies c
		JOIN tree t ON c.parent_id = t.id::text
		WHERE NOT (c.id = ANY (t.path))
	)
	SELECT t.id, t.name, t."group", t.level,
		EXISTS (SELECT 1 FROM tbr_accountancies k WHERE k.parent_id = t.id::text) AS "hasChildren"
	FROM tree t
	ORDER BY t.path`

/** Route-model binding, plus the child count that decides which delete page the row links to. */
export const ACCOUNTANCY_BY_ID_SQL = `SELECT a.id, a.name, a.is_parent, a.parent_id, a."group",
		a.is_student_cost, a.note, ${HAS_CHILDREN} AS "hasChildren"
	FROM tbr_accountancies a
	WHERE a.id = $1`

/**
 * Every descendant of one account — `showDelegateChild`'s `$this->getChild($accountancy->childs)`,
 * whose flattened output it plucks ids from. Self is not included, matching legacy.
 *
 * $1 = the account id **as text**, because `parent_id` is varchar.
 */
export const ACCOUNTANCY_DESCENDANTS_SQL = `WITH RECURSIVE sub AS (
		SELECT c.id, ARRAY[c.id] AS path
		FROM tbr_accountancies c
		WHERE c.parent_id = $1
		UNION ALL
		SELECT g.id, s.path || g.id
		FROM tbr_accountancies g
		JOIN sub s ON g.parent_id = s.id::text
		WHERE NOT (g.id = ANY (s.path))
	)
	SELECT sub.id FROM sub`

/**
 * `showDelegateChild`'s candidate list, child branch: every non-root except this account and its own descendants —
 * legacy's `whereNotIn('id', collect($this->datatable_data)->pluck('id'))`, which is what stops
 * the user re-parenting a subtree into itself.
 *
 * $1 = id (bigint), $2 = the same id as text, for the varchar `parent_id` seed.
 */
export const ACCOUNTANCY_CHILD_CANDIDATES_SQL = `WITH RECURSIVE sub AS (
		SELECT c.id, ARRAY[c.id] AS path
		FROM tbr_accountancies c
		WHERE c.parent_id = $2
		UNION ALL
		SELECT g.id, s.path || g.id
		FROM tbr_accountancies g
		JOIN sub s ON g.parent_id = s.id::text
		WHERE NOT (g.id = ANY (s.path))
	)
	SELECT a.id, a.name
	FROM tbr_accountancies a
	WHERE a.parent_id IS NOT NULL AND a.id <> $1 AND a.id NOT IN (SELECT sub.id FROM sub)
	ORDER BY a.id`
