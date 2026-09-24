// Port of `resources/views/download/capability-download.blade.php`, the A4-portrait agreement
// `StudentCapabilityController@downloadPDF` (900-926) renders through dompdf.
//
// The element tree below follows the blade row for row; the styles it reaches for live in
// `capability-pdf-style.ts` under the blade's own class names, so the two read side by side.
// Written with `createElement` rather than JSX because `apps/api/tsconfig.app.json` compiles
// `src/**/*.ts` with no `jsx` setting, and the agreement is not a reason to change how the whole
// API is built — the same call the payment receipt makes.
//
// The *print* document (`capability-print.ts`, `@print` → `print/capability.blade.php`) is a
// different view and stays HTML, exactly as legacy has it.

import { createElement as h, type ComponentProps, type ReactElement } from "react"
import { Document, Image, Page, Text, View, renderToBuffer } from "@react-pdf/renderer"

import { toAmount } from "@shared/billing/invoice-calculator"
import {
	APP_NAME,
	documentTotal,
	familyAddress,
	numberFormat,
	rupiah,
	schoolFullAddress,
	schoolName,
	type CapabilityDocumentData,
	type CapabilityDocumentItem,
} from "@admin/capabilities/capability-document"
import { periodLabel } from "@admin/capabilities/capability-format"
import { capabilityWatermark, logoSource, registerCapabilityFonts } from "@admin/capabilities/capability-pdf-assets"
import { COLUMN_WIDTHS, LABEL_WIDTH, styles } from "@admin/capabilities/capability-pdf-style"

const [COL_NO, COL_NAME, COL_AMOUNT, COL_PERIOD] = COLUMN_WIDTHS

/**
 * HTML white-space collapsing, which a PDF does not get for free.
 *
 * Every interpolated value on this sheet arrives inside indented blade markup, and several of the
 * concatenations leave empty segments behind — a santri with no district gets `…Kelurahan Dukuh, ,
 * Sukoharjo`. The browser and dompdf collapse those runs; react-pdf keeps them, and its line
 * breaker additionally treats a long run as a break inside a word and prints a hyphen.
 */
const htmlText = (value: unknown): string => String(value ?? "").replace(/\s+/g, " ").trim()

/** `:206` and `:216`, copied character for character — 29 dots, and a trailing space after the `)`. */
const DOTTED_RULE = "( . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ) "

/** `Sukoharjo &nbsp; . . . . / …` — the entity is a real NBSP in the rendered document. */
const PLACE_LINE = "Sukoharjo \u00a0 . . . . / . . . . . . . . . . . . . . . / . . . . . ."

type PdfStyle = (typeof styles)[keyof typeof styles]

const para = (text: string, ...extra: PdfStyle[]): ReactElement =>
	h(Text, { style: [styles.para, styles.paraLead, ...extra] }, text)

/** One `<tr>` of a `.student-table`: a 240px label cell and an italic value beside it. */
const identityRow = (label: string, value: string): ReactElement =>
	h(
		View,
		{ style: styles.studentRow },
		h(
			View,
			{ style: [styles.studentCell, { width: LABEL_WIDTH }] },
			h(Text, { style: [styles.studentText, styles.studentLead, styles.fw600] }, label),
		),
		h(
			View,
			{ style: [styles.studentCell, { flexGrow: 1, flexShrink: 1, flexBasis: 0 }] },
			h(Text, { style: [styles.studentText, styles.italicLead, styles.italic] }, value),
		),
	)

const headCell = (width: string, text: string): ReactElement =>
	h(View, { style: [styles.headCell, { width }] }, h(Text, { style: styles.headText }, text))

const bodyCell = (width: string, text: string): ReactElement =>
	h(View, { style: [styles.bodyCell, { width }] }, h(Text, { style: styles.cellText }, text))

const itemRow = (item: CapabilityDocumentItem, index: number): ReactElement =>
	h(
		View,
		// `tr { page-break-inside: avoid }` is dompdf's default for rows: a row never splits across sheets
		{ style: styles.tableRow, key: String(index), wrap: false },
		bodyCell(COL_NO, String(index + 1)),
		bodyCell(COL_NAME, htmlText(item.name)),
		bodyCell(COL_AMOUNT, rupiah(toAmount(item.amount))),
		// `getStudentCostTerm(...,'translate_period')` returns the literal string `0` on a miss;
		// the scoped lookup in `capability-sql.ts` cannot miss today, and renders "" if it ever does
		bodyCell(COL_PERIOD, item.period === null ? "" : periodLabel(item.period)),
	)

/**
 * `:200-220` — the two signature blocks, identical but for the place line, the top margin and
 * which of their lines carries `.text-weight-600`. The legacy render confirms the split: only
 * "Mengetahui" is set in Poppins SemiBold on either side.
 */
type SignatureLine = { text: string; bold?: true }

const signatory = (lead: readonly SignatureLine[], trailer: string, indented: boolean): ReactElement =>
	h(
		View,
		{ style: styles.signature },
		h(
			View,
			{ style: indented ? [styles.textCenter, styles.signatureLeft] : styles.textCenter },
			...lead.map((line, index) =>
				h(
					Text,
					{
						key: String(index),
						style: line.bold
							? [styles.para, styles.paraLead, styles.textCenter, styles.mb0, styles.fw600]
							: [styles.para, styles.paraLead, styles.textCenter, styles.mb0],
					},
					line.text,
				),
			),
			h(View, { style: styles.signatureGap }),
			para(DOTTED_RULE, styles.textCenter, styles.mb0),
			para(trailer, styles.textCenter, styles.mb0),
		),
	)

/**
 * `<title>Kesanggupan</title>` — the blade's, unlike the receipt's, names no santri.
 *
 * react-pdf stamps `CreationDate` with the render time unless told otherwise, so two renders of the
 * same agreement differ by that one field. Pinning it to `approve_date` (Jakarta, as Laravel wrote
 * it) makes a stored copy and a fresh render byte-identical for every agreed capability; an unagreed
 * one has no date and is never stored, so it takes the render time.
 */
const documentProps = (data: CapabilityDocumentData): ComponentProps<typeof Document> => {
	const issued = data.approveDate === null ? null : new Date(`${data.approveDate}+07:00`)
	return issued === null || Number.isNaN(issued.getTime())
		? { title: "Kesanggupan" }
		: { title: "Kesanggupan", creationDate: issued }
}

const capabilityDocument = (data: CapabilityDocumentData): ReactElement<ComponentProps<typeof Document>> => {
	const { student, items, school } = data
	const total = documentTotal(items)
	const name = schoolName(school)
	// `@if ($setting_school->logo)` — this branch is unverified against legacy: the stored logo is
	// not reachable from the verification environment, so only the `@else` heading was measured
	const logo = data.logo === null ? null : logoSource(data.logo)

	return h(
		Document,
		documentProps(data),
		h(
			Page,
			{ size: "A4", style: styles.page },

			// :97-99 — `#watermark`, fixed to the page and repeated on every sheet
			h(Image, { fixed: true, style: styles.watermark, src: capabilityWatermark() }),

			h(
				View,
				{},
				h(
					View,
					{ style: styles.wrap },

					// :101-118 — logo or brand heading, school identity, address
					h(
						View,
						{ style: styles.header },
						h(
							View,
							{ style: styles.row },
							h(
								View,
								{ style: styles.colXs6 },
								logo
									? h(Image, { style: [styles.logo, { width: logo.width, height: logo.height }], src: logo.src })
									: h(Text, { style: styles.brand }, APP_NAME),
								h(Text, { style: styles.schoolName }, htmlText(school?.name ?? APP_NAME)),
								para(htmlText(`Telepon : +62 ${school?.phone ?? ""}`), styles.textGrey, styles.mb0),
							),
							h(
								View,
								{ style: styles.colXs6 },
								para(htmlText(schoolFullAddress(school)), styles.textRight, styles.textGrey, styles.mb0),
							),
						),
					),

					// :120-167 — the title, the two identity tables and the undertaking
					h(
						View,
						{ style: styles.bodyBlock },
						h(
							View,
							{ style: styles.block },
							h(Text, { style: styles.title }, "LEMBAR KESANGGUPAN BIAYA\nPENDIDIKAN SANTRI"),
							para("Bismillahirrahmanirrahim", styles.textCenter),
							h(View, { style: styles.lineBreak }),
							para("Yang bertanda tangan dibawah ini:"),
							h(
								View,
								{ style: styles.studentIndent },
								h(
									View,
									{ style: styles.studentTable },
									identityRow("Nama", htmlText(student.fatherFullname)),
									identityRow("Alamat", htmlText(familyAddress(student))),
									identityRow("Pekerjaan", htmlText(student.fatherJob)),
									identityRow("Nomor Telepon", htmlText(`+62 ${student.fatherPhone ?? ""}`)),
								),
							),
							para("Orang Tua atau Wali dari:"),
							h(
								View,
								{ style: styles.studentIndent },
								h(
									View,
									{ style: styles.studentTable },
									identityRow("Nama Santri", htmlText(student.fullname)),
									identityRow("Sekolah Asal", htmlText(student.schoolName)),
								),
							),
							para(
								htmlText(
									`Menyatakan bersedia dan sanggup membayar biaya administrasi pendidikan anak kami di ${name} ` +
										`tahun pembelajaran ${student.currentAcademicYear ?? ""} dengan rincian sebagai berikut:`,
								),
							),
						),
					),

					// :169-221 — the cost table and the two signature blocks
					h(
						View,
						{ style: styles.costBlock },
						h(
							View,
							{ style: styles.tableStyle },
							h(
								View,
								{ style: styles.tableRow, wrap: false },
								headCell(COL_NO, "No"),
								headCell(COL_NAME, "Uraian Biaya"),
								headCell(COL_AMOUNT, "Kesanggupan"),
								headCell(COL_PERIOD, "Periode"),
							),
							...items.map(itemRow),
							// The `<tfoot>` carries only three `<th>`; legacy's fourth column is the
							// wrapper's pink showing through, reproduced as an empty fourth cell
							h(
								View,
								{ style: styles.tableRow, wrap: false },
								headCell(COL_NO, ""),
								headCell(COL_NAME, "Total Biaya"),
								headCell(COL_AMOUNT, `Rp ${numberFormat(total)}`),
								headCell(COL_PERIOD, ""),
							),
						),
						h(View, { style: styles.lineBreak }),
						h(
							View,
							{ style: styles.signatureRow },
							signatory([{ text: "Mengetahui", bold: true }, { text: "Mudir Pondok" }], "Nama Mudir Pondok", true),
							signatory(
								[{ text: PLACE_LINE }, { text: "Mengetahui", bold: true }, { text: "Orang Tua atau Wali" }],
								"Nama Orang Tua atau Wali",
								false,
							),
						),
					),
				),
			),
		),
	)
}

export const CAPABILITY_CONTENT_TYPE = "application/pdf"

/**
 * The agreement as PDF bytes. Deterministic for an agreed capability — see `documentProps`.
 */
export const renderCapabilityPdf = async (data: CapabilityDocumentData): Promise<Buffer> => {
	registerCapabilityFonts()
	return renderToBuffer(capabilityDocument(data))
}
