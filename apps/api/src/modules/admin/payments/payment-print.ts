// Port of `resources/views/print/transaction.blade.php`, which
// `StudentInvoiceController@printTransaction` (750-770) renders straight into a new browser tab.
//
// Same figures as the downloaded receipt — `$amount[] = pivot.pay` and `$total_amount` their sum
// — but a different document: A5 landscape via paper.css, a pink watermark bar down the left, one
// borderless cost table, and `window.print()` on load. This one stays HTML printed by the
// browser, which is what legacy does; only the download became a real PDF
// (`payment-receipt-pdf.ts`). The shared helpers and the row types live in `payment-format.ts`.

import {
	escapeHtml,
	invoiceAddress,
	longDateId,
	numberFormat,
	toNumber,
	type ReceiptData,
} from "@admin/payments/payment-format"

// Transcribed verbatim from the blade's `<style>` block (lines 18-223). The rules that only serve
// the Kesanggupan print view it was copied from (`.tbr_label*`, `.tbr_data*`, `ul/ol`,
// `.parent-table`) are dropped, since this document has no such elements.
const STYLE = `@page { size: A5 landscape; margin-bottom: 20mm; }
            @media print {
                .invoice-body { background-color: #FFFFFF !important; }
                .tbr_wrap_contents { background-color: #FFFFFF !important; }
                table { page-break-after:auto }
                tr    { page-break-inside:avoid; page-break-after:auto }
                td    { page-break-inside:avoid; page-break-after:auto }
            }
            body {
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
                background-color: #EEEEEE;
                margin: 0 !important;
            }
            body, p, span, b, i {
                color: #000000 !important;
                font-family: 'Poppins SemiBold', sans-serif !important;
                line-height: 21px !important;
                font-size: 13px !important;
                font-weight: 400 !important;
                letter-spacing: .3px !important;
            }
            .invoice-header img         { margin-right: 20px; }
            .invoice-wrap               { background-color: #FFFFFF; padding: 40px 40px 40px 40px; position: relative; overflow: hidden; }
            .title {
                font-size: 24px;
                text-transform: uppercase;
                letter-spacing: 4px;
                color: #000000 !important;
                font-weight: 600;
                text-align: right;
            }
            .table-style                { margin-bottom: 20px; border-radius: 10px; overflow: hidden; border: 1px solid #000000; background-color: #ffffff; }
            table                       { width: 100%; margin-bottom: 0; page-break-after:auto}
            table tbody tr              { background-color: #FFFFFF !important; page-break-inside:avoid; page-break-after:auto}
            .cost-table                 { margin: 1rem 0 1rem 0 }
            .cost-table tbody tr:not(:last-child) td     { border-bottom: 1px solid #000000}
            table tr th                 { background-color: #ffffff !important; color: #000000; font-weight: normal; -webkit-print-color-adjust: exact; padding: 5px 20px; }
            .cost-table tr td           { padding: 5px 20px; }
            .student-table tr td:first-child { min-width: 20px !important; }
            .cost-table tr td:first-child { min-width: 50px !important; padding: 5px 20px; }
            .text-default    { color: #000000 !important; }
            .text-weight-600 { font-weight: 600 !important; }
            .text-italic     { font-style: italic !important; }
            .p-0  { padding: 0px !important; }
            .m-0  { margin: 0px !important; }
            .mt-0 { margin-top: 0px !important; }
            .mb-0 { margin-bottom: 0px !important; }
            .mb-25 { margin-bottom: 25px !important; }
            .text-center { text-align: center; }
            .invoice-body { position: relative; }
            .tbr_brand_heading { margin-top: 40px; color: #000000 !important; font-weight: 500 !important; display: inline-block; }
            img { filter: brightness(0%); }
            #content { position: relative; }
            #content img { position: absolute; top: 0; right: 0; z-index: 1; }
            #content div { position: absolute; top: 8px; right: 14px; color: #ffffff !important; z-index: 1; }
            .company-info { display: flex; margin-top: 25px; }
            /* The blade gets these from bootstrap-3.4.1.min.css, transcribed from that file */
            * { -webkit-box-sizing: border-box; -moz-box-sizing: border-box; box-sizing: border-box; }
            .row { margin-right: -15px; margin-left: -15px; }
            .row:before, .row:after { display: table; content: " "; }
            .row:after, .clearfix:after { clear: both; }
            .col-xs-3, .col-xs-4, .col-xs-5, .col-xs-8 { position: relative; min-height: 1px; padding-right: 15px; padding-left: 15px; float: left; }
            .col-xs-3 { width: 25%; }
            .col-xs-4 { width: 33.33333333%; }
            .col-xs-5 { width: 41.66666667%; }
            .col-xs-8 { width: 66.66666667%; }`

const ASSET_BASE = process.env["RECEIPT_ASSET_BASE"] ?? ""

/**
 * The printable receipt, plus its document title.
 *
 * `window.print()` is kept at the end of the body exactly as the blade has it: the tab opens, the
 * print dialog appears, and closing it leaves the page behind — which is the whole interaction
 * the Cetak button is for.
 */
export const renderPrintReceipt = (data: ReceiptData): { body: string; contentType: string } => {
	const { transaction, items, school } = data
	const total = items.reduce((sum, item) => sum + toNumber(item.pay), 0)
	// `{{ $registrant->fullname ?? 'Roja' }}` — `$registrant` belongs to the PSB views and is never
	// passed here, so legacy titles every printed receipt "… - Roja". Corrected to the santri.
	const title = `${school?.name ? school.name : "Roja"} - ${transaction.fullname ?? "Roja"}`

	const rows = items
		.map(
			(item, index) => `<tr>
                                <td>${index + 1}</td>
                                <td>${escapeHtml(item.name)}</td>
                                <td>Rp ${escapeHtml(numberFormat(toNumber(item.pay)))}</td>
                            </tr>`,
		)
		.join("\n                            ")

	const body = `<!doctype html>
<html>
    <head>
        <title>${escapeHtml(title)}</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,400;0,600;1,400;1,600&display=swap" rel="stylesheet">
        <style rel="stylesheet">
            ${STYLE}
        </style>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/paper-css/0.3.0/paper.css">
    </head>
    <body class="A5 landscape">
        <div id="content">
            ${ASSET_BASE ? `<img src="${escapeHtml(`${ASSET_BASE}/Watermark.png`)}" class="ribbon"/>` : ""}
            <div>${escapeHtml(transaction.transactionCode)}</div>
        </div>
        <div class="invoice-wrap">
            <div class="invoice-header">
                <div class="row clearfix">
                    <div class="col-xs-3">
                        <div class="company-info">
                            <h2 class="tbr_brand_heading">${escapeHtml(school?.name ?? "Roja")}</h2>
                        </div>
                    </div>
                    <div class="col-xs-4">
                        <p class="p-0 m-0">
                            ${escapeHtml(school?.name ?? "Roja")} <br>
                            Telepon : +62 ${escapeHtml(school?.phone)} <br>
                            ${escapeHtml(invoiceAddress(school))}
                        </p>
                    </div>
                    <div class="col-xs-5">
                        <table class="student-table mt-0 mb-25">
                            <tr>
                                <td class="text-weight-600 text-default">Nama</td>
                                <td class="text-default text-italic">${escapeHtml(transaction.fullname)}</td>
                            </tr>
                            <tr>
                                <td class="text-weight-600 text-default">NISP</td>
                                <td class="text-default text-italic">${escapeHtml(transaction.nis)}</td>
                            </tr>
                            <tr>
                                <td class="text-weight-600 text-default">Kelas</td>
                                <td class="text-default text-italic">${escapeHtml(transaction.grade)} ${escapeHtml(transaction.subGrade)}</td>
                            </tr>
                        </table>
                    </div>
                </div>
            </div>

            <div class="invoice-body">
                <p class="title text-weight-600">BUKTI PEMBAYARAN</p>
            </div>
            <div class="invoice-body">
                <div class="table-style">
                    <table class="cost-table" cellspacing="0">
                        <tbody>
                            <tr>
                                <td>No</td>
                                <td>Uraian Biaya</td>
                                <td>Biaya</td>
                            </tr>
                            ${rows}
                            <tr>
                                <td></td>
                                <td>Total Biaya</td>
                                <td>Rp ${escapeHtml(numberFormat(total))}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <br>
                <div>
                    <div class="row">
                        <div class="col-xs-4" >
                            <div class="text-center">
                                <p>Dibayar Tanggal</p>
                                ${escapeHtml(longDateId(transaction.paidAt))}
                            </div>
                        </div>
                        <div class="col-xs-8">
                            <div style="width: 186px; float: right; display: inline-flex;">
                                <div class="text-center">
                                    <p class="mb-0">Petugas</p>
                                    <br /><br />
                                    <p class="mb-0">( . . . . . . . . . . . . . . . . . . . . . .  ) </p>
                                </div>
                            </div>
                            <div style="width: 186px; float: right; display: inline-flex;">
                                <div class="text-center">
                                    <p class="mb-0">Penyetor</p>
                                    <br /><br />
                                    <p class="mb-0">( . . . . . . . . . . . . . . . . . . . . . .  ) </p>
                                </div>
                            </div>
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
