import type { EntityManager } from "typeorm"

import type { SocietyKind } from "@roja/types"

import { societyFileUrl } from "../files"

import { loadPrintData, type PrintData } from "./society-print-data"
import { APP_NAME, esc, printAlphabet, settingSchoolAddress } from "./society-print-format"
import { alumniOverview, familySection, guardianSection, identitySection, otherSection, personalSection } from "./society-print-sections"
import { INVOICE_BG_SRC, NO_PHOTO_SRC, printStyle } from "./society-print-style"

// OWNER: AK-A. Port of `resources/views/print/{registrant,student,alumni}.blade.php` (one renderer, per-kind
// header and overview), following `modules/admin/capabilities/capability-print.ts`. Legacy quirks kept: the
// alumni sheet letters both "Overview" and "Data Diri" "A" (`printAlphabetIcon` ignores its alumni flag), the
// alumni sub-title says "santri", the registrant "Kelas" is always "IT" and its "Lainnya" letter is the
// attachment group's, the student "Lainnya" is always "E"; gender, phone, address, NIK, KSP and KIP never print.

/** The title line under the heading, per kind. */
const heading = (data: PrintData): string => {
	const r = data.row
	const name = esc(r["fullname"])
	switch (data.society) {
		case "registrant":
			return `<h1 class="title">Detail Pendaftar</h1> <span>Nomor Pendaftaran : ${esc(r["registrant_id"])}</span>
                        <p class="text-grey mb-20">Berikut detail pendaftar dengan atas nama ${name} :</p>`
		case "student":
			return `<h1 class="title">Detail Santri</h1> <span>NISP : ${esc(r["student_nis"])}</span>
                        <p class="text-grey mb-20">Berikut detail santri dengan atas nama ${name} :</p>`
		case "alumni":
			return `<h1 class="title">Detail Alumni</h1> <span>Tahun Lulus : ${esc(r["graduate_year"])}</span>
                        <p class="text-grey mb-20">Berikut detail santri dengan atas nama ${name} :</p>`
	}
}

const body = (data: PrintData): string => {
	const alphabet = printAlphabet(data)
	const letter = (index: number): string => alphabet[index] ?? ""
	const alumni = data.society === "alumni"
	const sections = [
		alumni ? alumniOverview(data) : "",
		personalSection(data, letter(0), alumni ? "Data Diri Alumni" : "Data Diri Santri"),
		identitySection(data, letter(1)),
		familySection(data, letter(2)),
		guardianSection(data, letter(3)),
		data.society === "student" ? otherSection(data, "E") : "",
		data.society === "registrant" ? otherSection(data, letter(4)) : "",
	]
	return sections.filter((section) => section !== "").join("\n")
}

/**
 * The whole print page as an HTML string (it calls `window.print()` itself), or null when the
 * record does not exist. `id` is the registrant id, the student_grade id or the alumni id.
 */
export const renderSocietyPrintPage = async (
	manager: EntityManager,
	input: { society: SocietyKind; id: number },
): Promise<string | null> => {
	const data = await loadPrintData(manager, input.society, input.id)
	if (!data) return null

	const { row, school } = data
	const alumni = input.society === "alumni"
	const schoolName = school?.["name"] ? school["name"] : APP_NAME
	const fullname = row["fullname"] ?? "Roja"
	const logoUrl = societyFileUrl(school?.["logo"] ?? null)
	const faviconUrl = societyFileUrl(school?.["favicon"] ?? null)
	const photoUrl = societyFileUrl(row["attach_photo"] ?? null)

	const brand = logoUrl
		? `<img class="mb-1${alumni ? " invoice-logo" : ""}" style="margin-top: -10px; margin-bottom: 5px;" src="${esc(logoUrl)}" alt="${esc(school?.["name"])}">`
		: `<h2 class="tbr_brand_heading">${APP_NAME}</h2>`

	return `<!doctype html>
<html>
    <head>
        <title>${esc(schoolName)} - ${esc(fullname)}</title>
        <meta charset="UTF-8">
        <meta name="keywords" content="" />
        <meta name="description" content="" />
        <meta name="robots" content="">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="shortcut icon" href="${esc(faviconUrl)}" type="image/x-icon" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        <style rel="stylesheet">
            ${printStyle(alumni)}
        </style>
    </head>
    <body>
        <div class="container invoice-wrap" style="min-width: 816px; min-height: 1056px;">
            <div class="invoice-watermark">
                <img src="${INVOICE_BG_SRC}" alt="Invoice">
            </div>

            <div class="invoice-header">
                <div class="row clearfix">
                    <div class="col-xs-6">
                        <div class="company-info">
                            ${brand}
                            <p class="p-0 mb-0 text-default text-weight-600" style="font-size: 14px !important; letter-spacing: 1px !important;">${esc(school?.["name"] ?? APP_NAME)}</p>
                            <p class="p-0 mb-0 text-grey">Telepon : +62 ${esc(school?.["phone"])}</p>
                        </div>
                    </div>
                    <div class="col-xs-6">
                        <p class="p-0 m-0 text-right text-grey">
                            ${esc(school ? settingSchoolAddress(data, school) : "")}
                        </p>
                    </div>
                </div>
            </div>

            <div class="invoice-body" style="width: 100%; padding: 0 0 20px 100px;">
                <div class="tbr_person_wrap">
                    <img src="${photoUrl ? esc(photoUrl) : NO_PHOTO_SRC}" alt="${esc(row["fullname"])}">
                </div>
                <div class="tbr_wrap_contents">
                    <div class="tbr_wrap_title">
                        ${heading(data)}
                    </div>
${body(data)}
                </div>
            </div>
        </div>
        <script>
            window.print();
        </script>
    </body>
</html>`
}
