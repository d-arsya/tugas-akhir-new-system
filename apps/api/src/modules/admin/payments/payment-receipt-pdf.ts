// Port of `resources/views/download/transaction-download.blade.php`, the A5-landscape receipt
// `StudentInvoiceController@downloadTransaction` (822-845) renders through dompdf.
//
// The element tree below follows the blade row for row; the styles it reaches for live in
// `payment-receipt-style.ts` under the blade's own class names, so the two read side by side.
// Written with `createElement` rather than JSX because `apps/api/tsconfig.app.json` compiles
// `src/**/*.ts` with no `jsx` setting, and the receipt is not a reason to change how the whole
// API is built.
//
// Replaces the print-ready HTML the previous pass shipped as a stopgap. The *print* document
// (`payment-print.ts`, `printTransaction` → `print/transaction.blade.php`) is a different view and
// stays HTML, exactly as legacy has it.

import { createElement as h, type ComponentProps, type ReactElement } from "react"
import { Document, Image, Page, Text, View, renderToBuffer } from "@react-pdf/renderer"

import { invoiceAddress, longDateId, numberFormat, toNumber, type ReceiptData } from "@admin/payments/payment-format"
import { receiptImage, registerReceiptFonts } from "@admin/payments/payment-receipt-assets"
import { COLUMN_WIDTHS, styles } from "@admin/payments/payment-receipt-style"

/** `<th style="width: 5%|50%|5%|40%">` as the legacy render actually laid it out. */
const [COL_NO, COL_NAME, COL_RP, COL_AMOUNT] = COLUMN_WIDTHS

/**
 * The identity block is a two-column `<table>`, so its label column is as wide as its widest label
 * plus `.pr-15`. react-pdf has no table layout to work that out, so this is the width the legacy
 * render gave `Nama` — the widest of the three — measured off its value column's left edge.
 */
const IDENTITY_LABEL_WIDTH = 38.55

/** `:189` and `:197`, copied character for character. */
const DOTTED_RULE = "( . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . )"

/**
 * HTML white-space collapsing, which a PDF does not get for free.
 *
 * `SettingSchool::getSchoolInvoiceAddressAttribute()` concatenates `$prefix . " " . $name` with an
 * empty prefix, so the district and the province each arrive with a leading space and the address
 * carries two double spaces. The browser and dompdf collapse them; react-pdf keeps them, and its
 * line breaker additionally treats the run as a break inside a word and prints a hyphen — legacy's
 * second address line would come out as `Kelurahan Dukuh,-`. Collapsing first restores both the
 * spacing and dompdf's own line break.
 */
const htmlText = (value: unknown): string => String(value ?? "").replace(/\s+/g, " ").trim()

const cell = (width: string, ruled: boolean, child: ReactElement): ReactElement =>
	h(
		View,
		{ style: ruled ? [styles.cell, styles.cellRuled, { width }] : [styles.cell, { width }] },
		child,
	)

const identityRow = (label: string, value: string): ReactElement =>
	h(
		View,
		{ style: styles.identityRow },
		h(Text, { style: [styles.pr15, styles.fw600, styles.body, { width: IDENTITY_LABEL_WIDTH }] }, label),
		h(Text, { style: styles.body }, value),
	)

/** `:184-199` — `Petugas` and `Penyetor` differ only in their label and their padding class. */
const signatory = (style: (typeof styles)["pPerson1"], label: string): ReactElement =>
	h(
		View,
		{ style: styles.colXs4 },
		h(
			View,
			{ style },
			h(Text, { style: [styles.textCenter, styles.body] }, label),
			h(View, { style: styles.signatureGap }),
			h(Text, { style: [styles.textCenter, styles.body] }, DOTTED_RULE),
		),
	)

const receiptDocument = (data: ReceiptData): ReactElement<ComponentProps<typeof Document>> => {
	const { transaction, items, school } = data
	const total = items.reduce((sum, item) => sum + toNumber(item.pay), 0)

	// The blade's `<title>` reads `{{ $registrant->fullname ?? 'Roja' }}`; `$registrant` belongs to
	// the PSB views and is never passed here, so every legacy receipt is titled "… - Roja". A wrong
	// word rather than a quirk, so it names the santri the receipt is actually for.
	const title = `${school?.name ? school.name : "Roja"} - ${transaction.fullname ?? "Roja"}`

	// Pinned so regenerating a receipt produces the same bytes as the copy already on S3.
	const paidAt = transaction.paidAt === null ? null : new Date(transaction.paidAt)

	const documentProps: ComponentProps<typeof Document> =
		paidAt === null || Number.isNaN(paidAt.getTime()) ? { title } : { title, creationDate: paidAt }

	return h(
		Document,
		documentProps,
		h(
			Page,
			{ size: "A5", orientation: "landscape", style: styles.page },

			// :65-72 — the watermark and the transaction code, both absolute inside the column
			h(
				View,
				{ style: styles.row },
				h(
					View,
					{ style: styles.colXs12 },
					h(
						View,
						{ style: styles.watermark },
						h(Image, { style: styles.watermarkImage, src: receiptImage("Watermark.png") }),
					),
					h(Text, { style: styles.trxNumber }, htmlText(transaction.transactionCode)),
				),
			),

			// :74-110 — logo, school identity, santri identity
			h(
				View,
				{ style: styles.row },
				h(
					View,
					{ style: styles.colXs3 },
					h(
						View,
						{ style: styles.pLogoWrap },
						h(Image, { style: styles.logo, src: receiptImage("Dark-Logo.png") }),
					),
				),
				h(
					View,
					{ style: styles.colXs4 },
					h(
						View,
						{},
						h(Text, { style: [styles.fw700, styles.body] }, htmlText(school?.name ?? "Roja")),
						h(
							View,
							{ style: styles.textSmall },
							h(Text, { style: styles.small }, htmlText(`Telpon : +62 ${school?.phone ?? ""}`)),
							h(Text, { style: styles.small }, htmlText(invoiceAddress(school))),
						),
					),
				),
				h(
					View,
					{ style: styles.colXs5 },
					h(
						View,
						{ style: styles.pIdentity },
						identityRow("Nama", htmlText(transaction.fullname)),
						identityRow("NISP", htmlText(transaction.nis)),
						identityRow("Kelas", htmlText(`${transaction.grade ?? ""} ${transaction.subGrade ?? ""}`)),
					),
				),
			),

			// :112-116
			h(
				View,
				{ style: styles.row },
				h(View, { style: styles.colXs12 }, h(Text, { style: styles.title }, "BUKTI PEMBAYARAN")),
			),

			// :118-173 — the cost table
			h(
				View,
				{ style: styles.row },
				h(
					View,
					{ style: styles.colXs12 },
					h(
						View,
						{ style: styles.pb15 },
						h(
							View,
							{ style: styles.tableBorder },
							h(
								View,
								{ style: styles.tableRow },
								cell(COL_NO, true, h(Text, { style: styles.tableTitle }, "No")),
								cell(COL_NAME, true, h(Text, { style: styles.tableTitle }, "Uraian Biaya")),
								cell(COL_RP, true, h(Text, { style: styles.tableTitle }, "")),
								cell(COL_AMOUNT, true, h(Text, { style: styles.tableTitle }, "Biaya")),
							),
							// The cost lines are `pivot.pay` — what this transaction put against each
							// invoice. `downloadTransaction:828-830` walks `$invoices` and
							// `$transaction->studentInvoiceTransations` by position, two collections
							// loaded and ordered independently, so one invoice's payment can be printed
							// against another's name. `SELECT_RECEIPT_ITEMS_SQL` joins the pivot to the
							// invoice instead, which is what these rows are.
							...items.map((item, index) =>
								h(
									View,
									{ style: styles.tableRow, key: String(index) },
									cell(COL_NO, true, h(Text, { style: styles.body }, String(index + 1))),
									cell(COL_NAME, true, h(Text, { style: styles.body }, htmlText(item.name))),
									cell(COL_RP, true, h(Text, { style: styles.body }, "Rp")),
									cell(COL_AMOUNT, true, h(Text, { style: styles.body }, numberFormat(toNumber(item.pay)))),
								),
							),
							h(
								View,
								{ style: styles.tableRow },
								cell(COL_NO, false, h(Text, { style: styles.tableTitle }, "")),
								cell(COL_NAME, false, h(Text, { style: styles.tableTitle }, "Total Biaya")),
								cell(COL_RP, false, h(Text, { style: styles.tableTitle }, "Rp")),
								cell(COL_AMOUNT, false, h(Text, { style: styles.titleTable }, numberFormat(total))),
							),
						),
					),
				),
			),

			// :175-200 — paid-on date and the two signature blocks
			h(
				View,
				{ style: styles.row },
				h(
					View,
					{ style: styles.colXs4 },
					h(
						View,
						{ style: styles.pTrxDate },
						h(
							View,
							{ style: styles.pTrxDateInner },
							h(Text, { style: [styles.textCenter, styles.body] }, "Dibayar tanggal"),
							h(Text, { style: [styles.textCenter, styles.fw600, styles.body] }, htmlText(longDateId(transaction.paidAt))),
						),
					),
				),
				signatory(styles.pPerson1, "Petugas"),
				signatory(styles.pPerson2, "Penyetor"),
			),
		),
	)
}

/**
 * `"Kuitansi - {$studentGrade->fullname}.pdf"`.
 *
 * Legacy interpolates the name straight into `Content-Disposition`, so a santri called `A/B` gives
 * a filename with a path separator in it and a `"` in the name closes the header's quoted string
 * early. Both are stripped here; the caller still sends the name itself through RFC 6266's
 * `filename*`, which is what carries the Indonesian characters.
 */
export const receiptFileName = (fullname: string | null): string => {
	const safe = (fullname ?? "")
		// eslint-disable-next-line no-control-regex
		.replace(/[\u0000-\u001F\u007F"\\/:*?<>|]/g, " ")
		.replace(/\s+/g, " ")
		.trim()
	return safe === "" ? "Kuitansi.pdf" : `Kuitansi - ${safe}.pdf`
}

export const RECEIPT_CONTENT_TYPE = "application/pdf"

/** The receipt as PDF bytes. Deterministic for a given transaction — see `creationDate` above. */
export const renderReceiptPdf = async (data: ReceiptData): Promise<Buffer> => {
	registerReceiptFonts()
	return renderToBuffer(receiptDocument(data))
}
