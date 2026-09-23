/**
 * `.tbr_academic_year_action` (app.css 3023-3043) — the pink pill the drill-down chevron sits in
 * on the Biaya Santri levels 1 and 2. `ChevronActionIcon` ships the glyph only, so the pill lives
 * here and both tables share it.
 *
 * Hover swaps the pill to `--primary` and fills the arrow white; legacy targets the SVG by id
 * (`#Rectangle_1086`, `#Path_295`), which the kit's icon does not carry, so the two shapes are
 * matched structurally instead. The shadow is the shared
 * `0px 8px 10px rgba(228,0,126,0.25)` (`--box-shadow-*` + `--rgb-primary`).
 */
export const STUDENT_COST_ACTION_CLASS =
	"inline-block rounded-[7px] bg-[#fae3f0] p-[7px] align-middle transition-all duration-300 hover:bg-[var(--primary)] hover:shadow-[0px_8px_10px_0px_rgba(228,0,126,0.25)] [&:hover_rect]:fill-white [&:hover_path:last-of-type]:fill-white"
