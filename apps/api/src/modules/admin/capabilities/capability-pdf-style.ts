// The `<style>` block of `resources/views/download/capability-download.blade.php` (17-93), plus the
// `bootstrap-3.4.1.min.css` rules the blade's grid and headings depend on, expressed as react-pdf
// styles. Every entry keeps the blade's class name so the two read side by side.
//
// **Units.** `config/dompdf.php:187` sets `"dpi" => 96`, so one CSS px is 0.75pt. `px()` does the
// same, which is why the geometry below reads in the blade's own numbers.
//
// **Line boxes.** Not derived — measured off a real dompdf render of capability 1611, produced by
// driving the legacy `vendor/dompdf` build directly (see the report). Two constants fall out of it
// and reproduce every baseline on both pages to within 0.02pt:
//
//   1. dompdf multiplies the **declared** `line-height` by `font_height_ratio` (1.1) times the
//      font's own height, `(Ascender 1050 + Descender 350 + FontHeightOffset 100) / 1000 = 1.5`.
//      So a line box is `line-height × 1.65`, independent of the text's own size: the blade's
//      `body { line-height: 15px }` gives 18.5625pt in every `<td>`, its `p { line-height: 21px }`
//      gives 25.9875pt in every paragraph, and bootstrap's `h1 { line-height: 1.1 }` gives
//      27.225pt in the title and 40.8375pt in the brand heading.
//   2. The baseline sits at 79.95% of the line box below its top, again regardless of font size.
//
// Checked against four independent anchors in the legacy render: the brand heading's baseline
// (792.12 predicted 792.14), the school name below it (755.67 / 755.67), a cost-table cell
// (115.46 / 115.46) and the signature block past a `<br/><br/><br/><br/>` run (420.90 / 420.90).
//
// **Column widths.** dompdf lays the cost table out `auto`, so its four columns are content-
// dependent. The percentages below are the widths the legacy render actually produced for a
// six-line agreement — 62.52 / 145.10 / 147.35 / 104.03 of 459.00pt — since react-pdf has no auto
// table layout to work them out for itself.

import { StyleSheet } from "@react-pdf/renderer"

import { FONT_FAMILY, ITALIC_FAMILY } from "@admin/capabilities/capability-pdf-assets"

/** `"dpi" => 96` (`config/dompdf.php:187`): one CSS px is 72/96 pt. */
export const px = (value: number): number => (value * 72) / 96

/** `font_height_ratio` (1.1) × the font's own 1.5em height — what dompdf scales `line-height` by. */
const LINE_FACTOR = 1.65

/** A line box, from the CSS `line-height` in px that produced it. */
const box = (lineHeightPx: number): number => px(lineHeightPx) * LINE_FACTOR

/** Measured: dompdf's baseline sits this far down its line box, whatever the text's size. */
const BASELINE = 0.7995
/** Where react-pdf puts its first baseline: Poppins' hhea ascent, 1050 on a 1000 unit em. */
const ASCENT = 1.05

/**
 * dompdf splits a line box's leading above and below its text; react-pdf drops the first baseline
 * one ascender under the top of the box and leaves all of the leading underneath. `leading()`
 * nudges the text back down with a relative offset, which moves what is drawn and nothing else —
 * the block keeps exactly the height its line boxes give it, so the rows under it do not shift.
 */
const leading = (fontSize: number, lineBox: number, adjust = 0): { position: "relative"; top: number } => ({
	position: "relative",
	top: BASELINE * lineBox - ASCENT * fontSize + adjust,
})

/** `body { line-height: 15px }` — every `<td>` and every bare `<br>`. */
export const BODY_BOX = box(15)
/** `p, span, b, i { line-height: 21px !important }`. */
export const PARA_BOX = box(21)
/** bootstrap `h1 { line-height: 1.1 }` at the `.title`'s own 20px. */
const TITLE_BOX = px(20) * 1.1 * LINE_FACTOR
/** bootstrap `h2 { font-size: 30px; line-height: 1.1 }`. */
const BRAND_BOX = px(30) * 1.1 * LINE_FACTOR

/** The four cost-table columns, as the legacy render laid them out. */
export const COLUMN_WIDTHS = ["13.6209%", "31.6122%", "32.1024%", "22.6645%"] as const

/** `.student-table tr td:first-child { width: 240px }` plus its own 2×16px padding. */
export const LABEL_WIDTH = px(240 + 32)

export const styles = StyleSheet.create({
	// `@page { size: auto; margin: 0mm }` with `"default_paper_size" => "a4"`, and
	// `body { font-family: Poppins; line-height: 15px; font-size: 14px; color: #444444; margin-top: 1cm }`
	/**
	 * `body { margin-top: 1cm }` repeats on every sheet in the legacy render (page 2's table resumes
	 * at 813.54, i.e. 28.35pt down), so it is page padding here rather than a margin on the flow.
	 *
	 * The bottom is measured, not declared. `@page` has no margin, yet dompdf moved the third item
	 * row to page 2 when it would have ended at 65.43pt — it reserves the trailing
	 * `.table-style` margin, `.invoice-body` padding and `.invoice-wrap` padding (20 + 20 + 60px =
	 * 75pt) below a breaking table. One sample bounds it between 65.43 and 101.99pt.
	 */
	page: {
		paddingTop: 28.35,
		paddingBottom: px(20 + 20 + 60),
		fontFamily: FONT_FAMILY,
		fontWeight: 400,
		fontSize: px(14),
		color: "#444444",
	},

	// `#watermark { position: fixed; top: 0; bottom: 0; left: 0; width: 100px; height: 1130px }`.
	// Fixed to the page, so it starts above the body's top margin and repeats on every sheet.
	watermark: { position: "absolute", top: 0, left: 0, width: px(100), height: px(1130) },

	// `.invoice-wrap { min-width: 730px; min-height: 987px; padding: 0 40px 60px }`
	wrap: { paddingLeft: px(40), paddingRight: px(40), paddingBottom: px(60) },
	// `.invoice-header { padding: 0 70px 20px 100px; margin-top: -10px; margin-bottom: 10px }`
	header: {
		marginTop: px(-10),
		marginBottom: px(10),
		paddingLeft: px(100),
		paddingRight: px(70),
		paddingBottom: px(20),
	},
	// `.invoice-body { padding: 0 0 20px 100px }`
	bodyBlock: { paddingLeft: px(100), paddingBottom: px(20) },
	/**
	 * The cost block's `style="padding-right: 18px !important"`. The legacy render gives the table
	 * 459.00pt starting at x 105.00, i.e. 1.28pt of right padding rather than the 13.5pt the
	 * declaration asks for — dompdf does not honour `!important` in an inline style here. Measured,
	 * because the number decides every column edge on the page.
	 */
	costBlock: { paddingLeft: px(100), paddingBottom: px(20), paddingRight: 1.28 },

	// bootstrap `.row` / `.col-xs-6` / `.clearfix`
	row: { flexDirection: "row", marginLeft: px(-15), marginRight: px(-15) },
	block: { marginLeft: px(-15), marginRight: px(-15) },
	colXs6: { width: "50%", paddingLeft: px(15), paddingRight: px(15) },

	/** Every 13px run the `p, span, b, i` rule governs. */
	para: {
		fontSize: px(13),
		lineHeight: PARA_BOX / px(13),
		color: "#777777",
		letterSpacing: px(0.3),
		// bootstrap `p { margin: 0 0 10px }`; the header and signature paragraphs cancel it with `.mb-0`
		marginBottom: px(10),
	},
	mb0: { marginBottom: 0 },
	paraLead: leading(px(13), PARA_BOX),

	textCenter: { textAlign: "center" },
	textRight: { textAlign: "right" },
	textGrey: { color: "#ABB4BE" },
	fw600: { fontWeight: 600 },

	/** `<h2 class="tbr_brand_heading">` — bootstrap's 30px/500, pulled up 5px, in the body's colour. */
	brand: {
		marginTop: px(-5),
		marginBottom: px(10),
		fontSize: px(30),
		fontWeight: 500,
		lineHeight: BRAND_BOX / px(30),
		color: "#444444",
		...leading(px(30), BRAND_BOX),
	},
	/** The logo `@if` branch: `<img class="mb-1">` at its own size, 10px below. */
	logo: { marginBottom: px(10) },

	/**
	 * `style="font-size: 14px !important; letter-spacing: 1px !important"` over `.text-weight-600`.
	 *
	 * The tracking is dropped on purpose. Measured: dompdf breaks and aligns lines on the width
	 * **without** letter-spacing and only then draws with it, so the school's 29-character first line
	 * (178.83pt bare, 200.58pt tracked) fits the 192.64pt column in legacy and wraps the name onto two
	 * lines. react-pdf breaks on the drawn width, so keeping 1px here wraps it onto three and pushes
	 * every row below it down by 25.99pt. Identical line breaks matter more than 0.75pt of tracking.
	 */
	schoolName: {
		fontSize: px(14),
		lineHeight: PARA_BOX / px(14),
		fontWeight: 600,
		color: "#777777",
		...leading(px(14), PARA_BOX),
	},

	/**
	 * `.title` — 20px, 4px tracking, uppercase, centred, pink. Its `class="title mb-25"` names a rule
	 * the **download** blade never defines (only `.mb-0`…`.mb-4` exist there), so bootstrap's h1
	 * margins apply: 10px below. Above, the legacy render sits 1.00pt lower than bootstrap's 20px
	 * predicts; measured, and kept.
	 */
	title: {
		marginTop: px(20) + 1,
		marginBottom: px(10),
		fontSize: px(20),
		fontWeight: 600,
		letterSpacing: px(4),
		textAlign: "center",
		textTransform: "uppercase",
		color: "#E4007E",
		lineHeight: TITLE_BOX / px(20),
		...leading(px(20), TITLE_BOX),
	},

	/** A bare `<br>` between blocks: one line box of the enclosing `body { line-height: 15px }`. */
	lineBreak: { height: BODY_BOX },

	// `.student-table tr td { padding: 6px 16px; font-size: 13px !important; vertical-align: top }`
	/** `class="student-table mt-0 mb-25"` — neither utility exists in this blade, and a bare `<table>` has no margin. */
	studentTable: {},
	studentIndent: { paddingLeft: px(30) },
	studentRow: { flexDirection: "row" },
	studentCell: { paddingTop: px(6), paddingBottom: px(6), paddingLeft: px(16), paddingRight: px(16) },
	studentText: { fontSize: px(13), lineHeight: BODY_BOX / px(13), letterSpacing: px(0.3), color: "#777777" },
	studentLead: leading(px(13), BODY_BOX),
	/** `.text-italic` — Helvetica-Oblique in the legacy render, because Poppins has no cached italic. */
	italic: { fontFamily: ITALIC_FAMILY, fontStyle: "italic" },
	/**
	 * Helvetica's baseline sits 5.69pt higher than Poppins' in the same dompdf line box (its ascent
	 * is far smaller), so the italic value cell reads visibly above its label in legacy. Measured.
	 */
	italicLead: leading(px(13), BODY_BOX, -4.24),

	// `.table-style { margin-bottom: 20px; border-radius: 10px; overflow: hidden; background-color: #E4007E }`
	/**
	 * The wrapper's pink is carried by the `<th>` cells instead of the wrapper itself. Where the table
	 * breaks across sheets, react-pdf stretches the wrapper's fragment down to the page's bottom limit
	 * and paints its background there — a ~27pt pink band under the last row that the legacy render
	 * does not have. Every cell is opaque, so moving the colour changes nothing else.
	 */
	tableStyle: { marginBottom: px(20), borderRadius: px(10), overflow: "hidden" },
	tableRow: { flexDirection: "row" },
	// `table tr th { background-color: #E4007E; color: #FFFFFF; font-weight: normal; padding: 12px 20px }`
	headCell: {
		paddingTop: px(12),
		paddingBottom: px(12),
		paddingLeft: px(20),
		paddingRight: px(20),
		backgroundColor: "#E4007E",
	},
	headText: { fontSize: px(14), color: "#FFFFFF", lineHeight: BODY_BOX / px(14), ...leading(px(14), BODY_BOX) },
	// `.cost-table tr td { padding: 12px 20px; border-bottom: 1px #ddd solid }`
	bodyCell: {
		paddingTop: px(12),
		paddingBottom: px(12),
		paddingLeft: px(20),
		paddingRight: px(20),
		backgroundColor: "#FFFFFF",
		borderBottomWidth: px(1),
		borderBottomColor: "#dddddd",
	},
	cellText: { fontSize: px(14), color: "#444444", lineHeight: BODY_BOX / px(14), ...leading(px(14), BODY_BOX) },

	// The two signature columns: `style="width: 280px"`, the left one 35px lower
	signature: { width: px(280) },
	/**
	 * `<div class="row">` around the two blocks, the second `float: right`. Measured: in this row
	 * dompdf applies neither of bootstrap's -15px margins — the left block is centred on x 210.00
	 * and the right one on 459.00, flush with the cost table's own edges — so the row here is a
	 * plain space-between line across the cost block.
	 */
	signatureRow: { flexDirection: "row", justifyContent: "space-between" },
	signatureLeft: { marginTop: px(35) },
	signatureGap: { height: BODY_BOX * 4 },
})
