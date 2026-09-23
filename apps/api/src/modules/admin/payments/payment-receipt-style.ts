// The `<style>` block of `resources/views/download/transaction-download.blade.php` (17-62), plus
// the handful of `bootstrap-3.4.1.min.css` rules the blade's grid depends on, expressed as
// react-pdf styles. Every entry keeps the blade's class name so the two can be read side by side.
//
// **Units.** `config/dompdf.php:187` sets `"dpi" => 96`, so dompdf turns one CSS px into 0.75pt.
// `px()` does the same, which is why the geometry below reads in the blade's own numbers.
//
// **Line boxes.** Measured off the legacy PDF rather than computed from the blade, because the
// `line-height: 12px` it asks for is smaller than the box dompdf actually gives a line and never
// wins. Taking flat-topped capitals on consecutive lines of the legacy render: the school's name
// steps 14.85pt at 11.5px (`PONDOK` at 44.86 under `TMQ` at 30.01), which is 1.7217× its font
// size, and `BUKTI PEMBAYARAN` at 13px sits in a 16.79pt box, the same multiple. `.text-small`,
// the one rule that sets its own `line-height`, steps 13.615pt at 11px — the `b` of `Brumbung` at
// 72.29, of `Kabupaten` at 85.91, the `h` of `Tengah` at 99.52 — a different 1.6503×.
//
// **Column widths.** The blade asks for 5% / 50% / 5% / 40%, but dompdf lays the table out `auto`,
// and the 5% columns are both narrower than their own minimum content — "NO" at 13px inside 40px
// of padding, and "Rp" at 11.5px inside the same. dompdf widens both and takes the difference out
// of the 40% column. The percentages below are the widths the legacy render actually produced,
// measured off its cell borders; writing 5% here would move every figure on the page.

import { StyleSheet } from "@react-pdf/renderer"

import { FONT_FAMILY } from "@admin/payments/payment-receipt-assets"

/** `"dpi" => 96` (`config/dompdf.php:187`): one CSS px is 72/96 pt. */
export const px = (value: number): number => (value * 72) / 96

/** What the legacy render multiplies a font size by for everything the `body` rule governs. */
const BODY_LINE_FACTOR = 1.7217
/** `.text-small` sets its own `line-height`, and lands on a different multiple. */
const SMALL_LINE_FACTOR = 1.6503
/**
 * Inside the cost table every row is 21.6pt tall — the 13px header, the 11.5px body rows and the
 * 13px footer alike — which is 3px + 14.85 + 5px + the 1px rule to within 0.05pt. So the table's
 * line box is the body's, and the 13px headings have to be told to occupy it.
 */
const TABLE_LINE_BOX = px(11.5) * BODY_LINE_FACTOR

/** Poppins' hhea ascent 1050 and descent −350 on a 1000 unit em, shared by all five faces. */
const FONT_BOX_EM = 1.4
/**
 * What is left over once the half-leading below is accounted for: react-pdf's first baseline still
 * lands 0.1635em above dompdf's. Measured on the transaction code, the one string both engines put
 * in a box whose top nothing but `position: absolute` decides — 7.5pt, with glyphs at 12.88pt in
 * the legacy render against 10.08pt here, of which 1.39pt is the half-leading below.
 */
const ASCENT_GAP_EM = 0.1635

/** How far below react-pdf's first baseline dompdf puts its own, for a given size and line box. */
const leadingShift = (fontSize: number, lineBox: number): number =>
	(lineBox - FONT_BOX_EM * fontSize) / 2 + ASCENT_GAP_EM * fontSize

/**
 * dompdf splits a line box's leading above and below its text; react-pdf drops the first baseline
 * one ascender under the top of the box and leaves all of the leading underneath. `leading()`
 * nudges the text back down with a relative offset, which moves what is drawn and nothing else —
 * the block keeps exactly the height its line boxes give it, so the rows under it do not shift.
 */
const leading = (fontSize: number, lineBox: number): { position: "relative"; top: number } => ({
	position: "relative",
	top: leadingShift(fontSize, lineBox),
})

/** Measured off the legacy render's cell borders; see the note above. */
export const COLUMN_WIDTHS = ["8.4784%", "49.8618%", "7.8540%", "33.8058%"] as const

export const styles = StyleSheet.create({
	// `@page { size: A5 landscape; margin: 30px 50px 50px 50px; }` and the `body` rule
	page: {
		paddingTop: px(30),
		paddingRight: px(50),
		paddingBottom: px(50),
		paddingLeft: px(50),
		fontFamily: FONT_FAMILY,
		fontWeight: 400,
		fontSize: px(11.5),
		lineHeight: BODY_LINE_FACTOR,
		color: "#1D2127",
	},

	// bootstrap `.row` / `.col-xs-*`, with the `.p-0` every column in this blade also carries
	row: { flexDirection: "row", marginLeft: px(-15), marginRight: px(-15) },
	colXs3: { width: "25%" },
	colXs4: { width: "33.33333333%" },
	colXs5: { width: "41.66666667%" },
	// `.col-xs-12 { min-height: 1px }`. The receipt's first row holds nothing but the watermark and
	// the transaction code, both out of flow, so that minimum is all the height it has — 1.75pt in
	// the legacy render, which is where its logo's 35.50pt top puts it, not the 0.75pt a plain px
	// conversion gives.
	colXs12: { width: "100%", position: "relative", minHeight: 1.75 },

	/** Every 11.5px run the `body` rule governs; see `leading()`. */
	body: leading(px(11.5), px(11.5) * BODY_LINE_FACTOR),
	/** And every `.text-small` run. */
	small: leading(px(11), px(11) * SMALL_LINE_FACTOR),

	textCenter: { textAlign: "center" },
	fw600: { fontWeight: 600 },
	fw700: { fontWeight: 700 },
	textSmall: { fontSize: px(11), lineHeight: SMALL_LINE_FACTOR },

	// `lineHeight` is repeated here although the page already sets the same factor: react-pdf
	// resolves an unitless line height against the font size in force where it is declared, so the
	// page's turns into a flat 14.85pt and this 13px heading would inherit the 11.5px box.
	title: {
		fontWeight: 600,
		letterSpacing: px(3),
		textAlign: "right",
		fontSize: px(13),
		lineHeight: BODY_LINE_FACTOR,
		textTransform: "uppercase",
		...leading(px(13), px(13) * BODY_LINE_FACTOR),
	},
	/**
	 * `.table-title` asks for `letter-spacing: 2px`, which the legacy PDF does not have: dompdf
	 * drops letter-spacing inside a table cell, and applies it in the ordinary block `.title` uses.
	 * Measured — in the legacy render `TOTAL BIAYA` starts at 87.58pt and its `O` at 93.49pt, one
	 * plain `T` advance apart, where 2px of tracking would have put it 1.5pt further on. Carrying
	 * the declaration over would widen every heading on the page against the document being ported.
	 */
	tableTitle: {
		fontWeight: 600,
		fontSize: px(13),
		textTransform: "uppercase",
		lineHeight: TABLE_LINE_BOX / px(13),
		...leading(px(13), TABLE_LINE_BOX),
	},
	/**
	 * The footer's total carries `class="title-table"`, which no rule defines — a transposition of
	 * `table-title`. It is still a `<th>`, so it falls back to the browser default `font-weight:
	 * bold` at the body's own 11.5px instead of the 13px uppercase of the cells beside it. Legacy
	 * prints it that way; this is a spelling slip, not a wrong word, so it stays.
	 */
	titleTable: { fontWeight: 700, ...leading(px(11.5), TABLE_LINE_BOX) },

	watermark: { position: "absolute", top: px(-25), right: px(-38) },
	// already out of flow, so its nudge goes straight into the offset the blade gives it
	trxNumber: {
		position: "absolute",
		top: px(-20) + leadingShift(px(11.5), px(11.5) * BODY_LINE_FACTOR),
		right: px(-20),
		color: "#FFFFFF",
		fontWeight: 600,
	},
	tableBorder: { borderRadius: px(8), borderWidth: px(1), borderColor: "#1D2127" },

	// `.table-summary tr th, .table-summary tr td { padding: 3px 20px 5px; }`
	tableRow: { flexDirection: "row" },
	cell: { paddingTop: px(3), paddingRight: px(20), paddingBottom: px(5), paddingLeft: px(20) },
	cellRuled: { borderBottomWidth: px(1), borderBottomColor: "#1D2127" },

	pLogoWrap: { paddingTop: px(15), paddingBottom: px(6) },
	pIdentity: { paddingTop: px(6), paddingBottom: px(9), paddingLeft: px(20) },
	pTrxDate: { paddingRight: px(90) },
	pTrxDateInner: { paddingTop: px(10), paddingBottom: px(14) },
	pPerson1: { paddingLeft: px(55) },
	pPerson2: { paddingLeft: px(55) },
	pb15: { paddingBottom: px(15) },
	pr15: { paddingRight: px(15) },

	// the identity block's two-column `<table>`: no padding of its own, so both columns shrink-wrap
	identityRow: { flexDirection: "row" },

	/** The blade's `<br /><br />` between the signatory's label and its dotted rule. */
	signatureGap: { height: px(11.5) * BODY_LINE_FACTOR * 2 },

	logo: { width: px(134), height: px(54) },
	watermarkImage: { width: px(146), height: px(47) },
})
