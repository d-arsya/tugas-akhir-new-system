// Port of `resources/views/print/capability.blade.php`, which `StudentCapabilityController@print`
// (882-897) renders straight into a new browser tab with `target="_blank"`.
//
// Same figures as the downloaded agreement — `$amount[] = pivot.amount` and `$total` their sum —
// but a different document: an 816×1056 portrait sheet with a pink watermark bar down the left,
// a bordered cost table, and `window.print()` on load. This one stays HTML printed by the browser,
// exactly as legacy has it; only the download becomes a real PDF (`capability-pdf.ts`). The shared
// helpers and row types live in `capability-format.ts`.

import { toAmount } from "@shared/billing/invoice-calculator"
import {
	APP_NAME,
	documentTotal,
	escapeHtml,
	familyAddress,
	numberFormat,
	schoolFullAddress,
	schoolName,
	type CapabilityDocumentData,
} from "@admin/capabilities/capability-document"
import { periodLabel } from "@admin/capabilities/capability-format"

/**
 * `public/assets/svg/etc/Invoice-Bg.svg`, transcribed byte for byte.
 *
 * The blade loads it through `asset()`, which this API does not serve; inlining it keeps the
 * document self-contained and removes the only external image the print view had. The three
 * stacked rectangles — full-height pink, then two white overlays at 15% and 20% — are what give
 * the bar its three-tone gradient, so their order and their opacities are load-bearing.
 */
const WATERMARK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="1122" viewBox="0 0 100 1122">
  <g id="Group_6517" data-name="Group 6517" transform="translate(6069 16856)">
    <rect id="Rectangle_2835" data-name="Rectangle 2835" width="100" height="1122" transform="translate(-6069 -16856)" fill="#e4007e"/>
    <rect id="Rectangle_2836" data-name="Rectangle 2836" width="100" height="902" transform="translate(-6069 -16636)" fill="#fff" opacity="0.15"/>
    <rect id="Rectangle_2837" data-name="Rectangle 2837" width="100" height="682" transform="translate(-6069 -16416)" fill="#fff" opacity="0.2"/>
  </g>
</svg>`

// Transcribed verbatim from the blade's `<style>` block (16-192), less the `ul/ol` rules (no list
// here) and the unused utility classes; bootstrap's grid rules are appended at the end.
const STYLE = `@page { size: auto; margin: 0mm 0mm 0mm 0mm; }
            @media print {
                .invoice-body { background-color: #FFFFFF !important; }
                .tbr_wrap_contents { background-color: #FFFFFF !important; }
                .tbr_label .tbr_label_block { background-color: #E4007E !important; }
                .tbr_label .tbr_label_bullet { background-color: #8DC31E !important; }
            }
            body {
                -webkit-print-color-adjust: exact !important;
                -moz-box-shadow: exact !important;
                color-adjust: exact !important;
                background-color: #EEEEEE;
                margin: 0 !important;
            }
            body, p, span, b, i {
                color: #777777 !important;
                font-family: 'Poppins', sans-serif !important;
                line-height: 21px !important;
                font-size: 13px !important;
                font-weight: 400 !important;
                letter-spacing: .3px !important;
            }
            .invoice-watermark          { position: fixed; top: 0; bottom: 0; right: auto; left: -2px; width: 100px; height: 100%; min-height: 100%; background-color: #E4007E; z-index: 1000; }
            .invoice-watermark img,
            .invoice-watermark svg      { width: 100px; height: 100%; min-height: auto; z-index: 1001; margin-left: -2px; }
            .invoice-header             { padding: 10px 5px 20px 100px; margin-bottom: 16px; }
            .invoice-header img         { margin-right: 20px; }
            .invoice-wrap               { max-width: 800px; background-color: #FFFFFF; padding: 40px 40px 80px 40px; position: relative; overflow: hidden; }
            .title {
                font-size: 24px;
                text-transform: uppercase;
                letter-spacing: 4px;
                color: #E4007E !important;
                font-weight: 600;
                text-align: center;
            }
            .table-style                      { margin-bottom: 20px; border-radius: 10px; overflow: hidden; border: 2px solid #F4F7F0; background-color: #E4007E !important; }
            .cost-table                       { width: 100%; margin-bottom: 0; }
            .cost-table thead tr              { background-color: #F4F7F0 !important; color: #FFFFFF; }
            .cost-table tbody tr              { background-color: #FFFFFF !important; }
            .cost-table tr:first-child,
            .cost-table tr:first-child th     { border-bottom: none; border-top: none; }
            .cost-table tr th                 { background-color: #E4007E !important; color: #FFFFFF !important; font-weight: normal; -webkit-print-color-adjust: exact; padding: 12px 20px; border-bottom: none !important; }
            table tr td {
                padding: 6px 16px;
                font-size: 13px !important;
                vertical-align: top !important;
                letter-spacing: .3px !important;
            }
            .parent-table tr td:first-child, .student-table tr td:first-child { min-width: 240px !important; }
            .cost-table tr td:first-child { min-width: 50px !important; padding: 12px 20px; }
            .text-default    { color: #777777 !important; }
            .text-primary    { color: #E4007E !important; }
            .text-secondary  { color: #8DC31E !important; }
            .text-danger     { color: #F8374B !important; }
            .text-warning    { color: #FFA800 !important; }
            .text-success    { color: #28AF52 !important; }
            .text-grey       { color: #ABB4BE !important; }
            .text-weight-400 { font-weight: 400 !important; }
            .text-weight-500 { font-weight: 500 !important; }
            .text-weight-600 { font-weight: 600 !important; }
            .text-weight-700 { font-weight: 700 !important; }
            .text-italic     { font-style: italic !important; }
            .text-uppercase  { text-transform: uppercase !important; }
            .pt-0  { padding-top: 0px !Important;  }
            .pb-0  { padding-bottom: 0px !Important;  }
            .mt-0  { margin-top: 0px !important; }
            .mb-0  { margin-bottom: 0px !important; }
            .mb-25 { margin-bottom: 25px !important; }
            .invoice-body {
                position: relative;
            }
            .tbr_wrap_contents {
                width: 100%;
                min-height: 300px;
                padding-left: 90px;
            }
            .tbr_brand_heading {
                color: #E4007E !important;
                font-weight: 500 !important;
                display: inline-block;
                margin-top: -5px;
            }
            /* The blade gets these from bootstrap-3.4.1.min.css, transcribed from that file */
            * { -webkit-box-sizing: border-box; -moz-box-sizing: border-box; box-sizing: border-box; }
            .container { margin-right: auto; margin-left: auto; padding-left: 15px; padding-right: 15px; }
            .row { margin-right: -15px; margin-left: -15px; }
            .row:before, .row:after, .clearfix:before, .clearfix:after { display: table; content: " "; }
            .row:after, .clearfix:after { clear: both; }
            .col-xs-6 { position: relative; min-height: 1px; padding-right: 15px; padding-left: 15px; float: left; width: 50%; }
            .text-right  { text-align: right; }
            .text-center { text-align: center; }
            .p-0 { padding: 0 !important; }
            .m-0 { margin: 0 !important; }`

/**
 * The printable agreement, plus its document title.
 *
 * `window.print()` is kept at the end of the body exactly as the blade has it: the tab opens, the
 * print dialog appears, and closing it leaves the sheet behind — which is the whole interaction
 * the Cetak button is for.
 */
export const renderCapabilityPrint = (data: CapabilityDocumentData): { body: string; contentType: string } => {
	const { student, items, school } = data
	const total = documentTotal(items)
	const name = schoolName(school)

	// `{{ $registrant->fullname ?? 'Roja' }}` — `$registrant` belongs to the PSB views and is never
	// passed here, so legacy titles every printed agreement "… - Roja". Corrected to the santri.
	const title = `${name} - ${student.fullname ?? APP_NAME}`

	const rows = items
		.map(
			(item, index) => `<tr>
                                    <td>${index + 1}</td>
                                    <td>${escapeHtml(item.name)}</td>
                                    <td>Rp ${escapeHtml(numberFormat(toAmount(item.amount)))}</td>
                                    <td>${escapeHtml(item.period === null ? "" : periodLabel(item.period))}</td>
                                </tr>`,
		)
		.join("\n                            ")

	// `@if ($setting_school->logo)` — the print view reaches the logo over HTTP, so the URL the
	// caller resolved is used as-is; without one the blade falls back to the brand heading.
	const brand = data.logoUrl
		? `<img class="mb-1" style="margin-top: -10px; margin-bottom: 5px;" src="${escapeHtml(data.logoUrl)}" alt="${escapeHtml(name)}">`
		: `<h2 class="tbr_brand_heading">${escapeHtml(APP_NAME)}</h2>`

	const body = `<!doctype html>
<html>
    <head>
        <title>${escapeHtml(title)}</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        <style rel="stylesheet">
            ${STYLE}
        </style>
    </head>
    <body>
        <div class="container invoice-wrap" style="min-width: 816px; min-height: 1056px;">
            <div class="invoice-watermark">
                ${WATERMARK_SVG}
            </div>

            <div class="invoice-header">
                <div class="row clearfix">
                    <div class="col-xs-6">
                        <div class="company-info">
                            ${brand}
                            <p class="p-0 mb-0 text-default text-weight-600" style="font-size: 14px !important; letter-spacing: 1px !important;">${escapeHtml(school?.name ?? APP_NAME)}</p>
                            <p class="p-0 mb-0 text-grey">Telepon : +62 ${escapeHtml(school?.phone)}</p>
                        </div>
                    </div>
                    <div class="col-xs-6">
                        <p class="p-0 m-0 text-right text-grey">
                            ${escapeHtml(schoolFullAddress(school))}
                        </p>
                    </div>
                </div>
            </div>

            <div class="invoice-body" style="width: 100%; padding: 0 0 20px 100px;">
                <h1 class="title mb-25">LEMBAR KESANGGUPAN BIAYA <br> PENDIDIKAN SANTRI</h1>
                <p class="text-center">Bismillahirrahmanirrahim</p>
                <br>
                <p>Yang bertanda tangan dibawah ini:</p>
                <div style="padding-left: 30px;">
                    <table class="parent-table mt-0 mb-25">
                        <tr>
                            <td class="text-weight-600 text-default">Nama</td>
                            <td class="text-default text-italic">${escapeHtml(student.fatherFullname)}</td>
                        </tr>
                        <tr>
                            <td class="text-weight-600 text-default">Alamat</td>
                            <td class="text-default text-italic">
                                ${escapeHtml(familyAddress(student))}
                            </td>
                        </tr>
                        <tr>
                            <td class="text-weight-600 text-default">Pekerjaan</td>
                            <td class="text-default text-italic">
                                ${escapeHtml(student.fatherJob)}
                            </td>
                        </tr>
                        <tr>
                            <td class="text-weight-600 text-default">Nomor Telepon</td>
                            <td class="text-default text-italic">+62 ${escapeHtml(student.fatherPhone)}</td>
                        </tr>
                    </table>
                </div>
                <p>Orang Tua atau Wali dari:</p>
                <div style="padding-left: 30px;">
                    <table class="student-table mt-0 mb-25">
                        <tr>
                            <td class="text-weight-600 text-default">Nama Santri</td>
                            <td class="text-default text-italic">${escapeHtml(student.fullname)}</td>
                        </tr>
                        <tr>
                            <td class="text-weight-600 text-default">Sekolah Asal</td>
                            <td class="text-default text-italic">${escapeHtml(student.schoolName)}</td>
                        </tr>
                    </table>
                </div>
                <p>Menyatakan bersedia dan sanggup membayar biaya administrasi pendidikan anak kami di ${escapeHtml(name)} tahun pembelajaran ${escapeHtml(student.currentAcademicYear)} dengan rincian sebagai berikut:</p>
            </div>
            <div class="invoice-body" style="width: 100%; padding: 0 0 20px 100px;">
                <div class="table-style">
                    <table class="table tbr_table table-hover cost-table" style="width: 100%; margin-top: 10px;">
                        <tbody>
                            <tr>
                                <th>No</th>
                                <th>Uraian Biaya</th>
                                <th>Kesanggupan</th>
                                <th>Periode</th>
                            </tr>
                            ${rows}
                            <tr>
                                <th></th>
                                <th>Total Biaya</th>
                                <th>Rp ${escapeHtml(numberFormat(total))}</th>
                                <th></th>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <br>
                <div>
                    <div style="margin-top: 20px; width: 280px; display: inline-flex;">
                        <div class="text-center">
                            <p class="mb-0 text-weight-600">Mengetahui</p>
                            <p class="mb-0">Mudir Pondok</p>
                            <br /><br /><br /><br />
                            <p class="mb-0">( . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ) </p>
                            <p class="mb-0">Nama Mudir Pondok</p>
                        </div>
                    </div>
                    <div style="width: 280px; float: right; display: inline-flex;">
                        <div class="text-center">
                            <p class="mb-0">Sukoharjo &nbsp; . . . . / . . . . . . . . . . . . . . . / . . . . . .</p>
                            <p class="mb-0 text-weight-600">Mengetahui</p>
                            <p class="mb-0">Orang Tua atau Wali</p>
                            <br /><br /><br /><br />
                            <p class="mb-0">( . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ) </p>
                            <p class="mb-0">Nama Orang Tua atau Wali</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <script>
            window.print();
        </script>
    </body>
</html>`

	return { body, contentType: "text/html; charset=utf-8" }
}
