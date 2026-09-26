// OWNER: AK-A. The `<style>` block of `resources/views/print/{registrant,student,alumni}.blade.php` (16-186,
// transcribed verbatim; the alumni blade adds `.invoice-logo` and `.tbr_table_below`), the parts of
// `porto/vendor/bootstrap/css/bootstrap-3.4.1.min.css` the sheet relies on, and the two legacy SVGs the blades
// load through `asset()` — inlined as data URIs because this API does not serve the legacy public folder.

/** `public/assets/svg/etc/Invoice-Bg.svg`, byte for byte. */
const INVOICE_BG_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="1122" viewBox="0 0 100 1122">
  <g id="Group_6517" data-name="Group 6517" transform="translate(6069 16856)">
    <rect id="Rectangle_2835" data-name="Rectangle 2835" width="100" height="1122" transform="translate(-6069 -16856)" fill="#e4007e"/>
    <rect id="Rectangle_2836" data-name="Rectangle 2836" width="100" height="902" transform="translate(-6069 -16636)" fill="#fff" opacity="0.15"/>
    <rect id="Rectangle_2837" data-name="Rectangle 2837" width="100" height="682" transform="translate(-6069 -16416)" fill="#fff" opacity="0.2"/>
  </g>
</svg>`

/** `public/assets/svg/etc/No-Photo.svg`, byte for byte. */
const NO_PHOTO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="211" height="309" viewBox="0 0 211 309">
  <g id="Group_6516" data-name="Group 6516" transform="translate(-300 -160)">
    <rect id="_300_6" data-name="300_6" width="211" height="309" transform="translate(300 160)" fill="#8dc31e"/>
    <path id="Path_985" data-name="Path 985" d="M-54.189-12.6v7.65l-6.264-7.65h-2.412V0h2.88V-7.65L-53.7,0h2.394V-12.6ZM-38.619.216c3.96,0,6.894-2.754,6.894-6.516s-2.934-6.516-6.894-6.516c-3.978,0-6.894,2.772-6.894,6.516S-42.6.216-38.619.216Zm0-2.484A3.844,3.844,0,0,1-42.561-6.3a3.844,3.844,0,0,1,3.942-4.032A3.844,3.844,0,0,1-34.677-6.3,3.844,3.844,0,0,1-38.619-2.268ZM-11.781-12.6h-5.454V0h2.916V-3.474h2.538c3.366,0,5.472-1.746,5.472-4.554C-6.309-10.854-8.415-12.6-11.781-12.6Zm-.162,6.75h-2.376v-4.374h2.376c1.782,0,2.682.81,2.682,2.2C-9.261-6.66-10.161-5.85-11.943-5.85ZM8-12.6v4.968H2.277V-12.6H-.639V0H2.277V-5.166H8V0h2.916V-12.6ZM23.607.216C27.567.216,30.5-2.538,30.5-6.3s-2.934-6.516-6.894-6.516c-3.978,0-6.894,2.772-6.894,6.516S19.629.216,23.607.216Zm0-2.484A3.844,3.844,0,0,1,19.665-6.3a3.844,3.844,0,0,1,3.942-4.032A3.844,3.844,0,0,1,27.549-6.3,3.844,3.844,0,0,1,23.607-2.268ZM38.727,0h2.916V-10.224h4.032V-12.6H34.695v2.376h4.032ZM56.763.216c3.96,0,6.894-2.754,6.894-6.516s-2.934-6.516-6.894-6.516c-3.978,0-6.894,2.772-6.894,6.516S52.785.216,56.763.216Zm0-2.484A3.844,3.844,0,0,1,52.821-6.3a3.844,3.844,0,0,1,3.942-4.032A3.844,3.844,0,0,1,60.705-6.3,3.844,3.844,0,0,1,56.763-2.268ZM-57.006,30h3.06L-59.58,17.4h-2.88L-68.076,30h2.988l1.116-2.7h5.85Zm-6.03-4.914,2-4.824,2,4.824ZM-40.5,17.4l-3.888,9-3.834-9h-3.15L-45.936,30h2.88L-37.6,17.4ZM-23.958,30h3.06l-5.634-12.6h-2.88L-35.028,30h2.988l1.116-2.7h5.85Zm-6.03-4.914,2-4.824,2,4.824Zm14,4.914h2.916V17.4h-2.916Zm9.5,0H2.754V27.624H-3.564V17.4H-6.48Zm23.994,0h3.06L14.94,17.4H12.06L6.444,30H9.432l1.116-2.7H16.4Zm-6.03-4.914,2-4.824,2,4.824ZM34.74,23.448a3.029,3.029,0,0,0,1.674-2.772c0-1.962-1.62-3.276-4.77-3.276H25.488V30H32c3.312,0,5.04-1.26,5.04-3.438A3.112,3.112,0,0,0,34.74,23.448ZM31.284,19.6c1.422,0,2.2.486,2.2,1.476s-.774,1.494-2.2,1.494h-2.9V19.6Zm.5,8.208h-3.4V24.69h3.4c1.512,0,2.322.5,2.322,1.566C34.11,27.336,33.3,27.8,31.788,27.8ZM42.858,30h9.234V27.624H45.774V17.4H42.858Zm17.37-2.34V24.744h5.85V22.476h-5.85V19.74h6.624V17.4H57.33V30h9.756V27.66Z" transform="translate(406.076 305.816)" fill="#fff" opacity="0.5"/>
  </g>
</svg>
`

const dataUri = (svg: string): string => `data:image/svg+xml;base64,${Buffer.from(svg, "utf8").toString("base64")}`

export const INVOICE_BG_SRC = dataUri(INVOICE_BG_SVG)
export const NO_PHOTO_SRC = dataUri(NO_PHOTO_SVG)

/** The bootstrap 3.4.1 rules the sheet leans on (base elements, grid, print reset), from the minified file. */
const BOOTSTRAP = `html { font-family: sans-serif; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; font-size: 10px; }
            body { margin: 0; font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; font-size: 14px; line-height: 1.42857143; color: #333; background-color: #fff; }
            * { -webkit-box-sizing: border-box; -moz-box-sizing: border-box; box-sizing: border-box; }
            :after, :before { -webkit-box-sizing: border-box; -moz-box-sizing: border-box; box-sizing: border-box; }
            img { border: 0; vertical-align: middle; }
            table { border-collapse: collapse; border-spacing: 0; background-color: transparent; }
            td, th { padding: 0; }
            h1, h2 { font-family: inherit; font-weight: 500; line-height: 1.1; color: inherit; margin-top: 20px; margin-bottom: 10px; }
            h1 { font-size: 36px; }
            h2 { font-size: 30px; }
            p { margin: 0 0 10px; }
            ol, ul { margin-top: 0; margin-bottom: 10px; }
            .container { margin-right: auto; margin-left: auto; padding-left: 15px; padding-right: 15px; }
            .row { margin-right: -15px; margin-left: -15px; }
            .row:before, .row:after, .clearfix:before, .clearfix:after, .container:before, .container:after { display: table; content: " "; }
            .row:after, .clearfix:after, .container:after { clear: both; }
            .col-xs-6 { position: relative; min-height: 1px; padding-right: 15px; padding-left: 15px; float: left; width: 50%; }
            .text-right { text-align: right; }
            @media print {
                *, :after, :before { color: #000 !important; text-shadow: none !important; background: 0 0 !important; -webkit-box-shadow: none !important; box-shadow: none !important; }
                img, tr { page-break-inside: avoid; }
                img { max-width: 100% !important; }
                h2, p { orphans: 3; widows: 3; }
                h2 { page-break-after: avoid; }
            }`

/** The blade's own `<style>`; `alumni` adds the three rules only `print/alumni.blade.php` has. */
export const printStyle = (alumni: boolean): string => `${BOOTSTRAP}
            @page { size: auto; margin: 0mm 0mm 0mm 0mm; }
            @media print {
                .invoice-body { background-color: #FFFFFF !important; }
                .tbr_wrap_contents { background-color: #FFFFFF !important; }
                .tbr_label .tbr_label_block { background-color: #E4007E !important; }
                .tbr_label .tbr_label_bullet { background-color: #8DC31E !important; }${alumni ? "\n                .tbr_table_below { background-color: #EEEEEE !important; }" : ""}
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
            .invoice-watermark img      { width: 100px; height: 100%; min-height: auto; z-index: 1001; margin-left: -2px; }
            .invoice-header             { padding: 10px 5px 20px 100px; margin-bottom: 16px; }
            .invoice-header img         { margin-right: 20px; }
            .invoice-wrap               { max-width: 800px; background-color: #FFFFFF; padding: 40px 40px 80px 40px; position: relative; overflow: hidden; }${alumni ? "\n            .invoice-logo               { max-width: 134px; max-height: 54px; }" : ""}
            .title {
                font-size: 18px;
                text-transform: uppercase;
                letter-spacing: 4px;
                color: #444444 !important;
                font-weight: 600;
                text-align: left;
                margin-bottom: 5px;
                padding-bottom: 0;
            }
            table tr td {
                padding: 6px 16px;
                font-size: 13px !important;
                vertical-align: top !important;
                letter-spacing: .3px !important;
            }
            ul, ol {
                margin: 0 0 0 20px;
                padding: 0;
            }
            ul li,
            ol li {
                color: #777777 !important;
                font-family: 'Poppins', sans-serif !important;
                line-height: 21px !important;
                font-size: 13px !important;
                letter-spacing: .2px;
            }
            table tr td:first-child { min-width: 240px !important; }
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
            .mt-5  { margin-top: 5px !important; }
            .mt-10 { margin-top: 10px !important; }
            .mt-15 { margin-top: 15px !important; }
            .mt-20 { margin-top: 20px !important; }
            .mt-25 { margin-top: 25px !important; }
            .mt-30 { margin-top: 30px !important; }
            .mt-35 { margin-top: 35px !important; }
            .mt-40 { margin-top: 40px !important; }
            .mb-0  { margin-bottom: 0px !important; }
            .mb-5  { margin-bottom: 5px !important; }
            .mb-10 { margin-bottom: 10px !important; }
            .mb-15 { margin-bottom: 15px !important; }
            .mb-20 { margin-bottom: 20px !important; }
            .mb-25 { margin-bottom: 25px !important; }
            .mb-30 { margin-bottom: 30px !important; }
            .mb-35 { margin-bottom: 35px !important; }
            .mb-40 { margin-bottom: 40px !important; }

            /* START */
            .invoice-body {
                position: relative;
            }
            .tbr_person_wrap {
                position: absolute;
                top: 0;
                left: 0;
                width: 140px;
                height: auto;
                z-index: 1002;
            }
            .tbr_person_wrap img {
                width: 100%;
                height: auto;
                border-radius: 12px;
            }
            .tbr_wrap_contents {
                width: 100%;
                min-height: 300px;
                padding-left: 90px;
            }
            .tbr_wrap_title {
                position: relative;
            }
            .tbr_wrap_title .title {
                display: inline-block;
                margin-right: 10px;
            }
            .tbr_brand_heading,
            .tbr_wrap_title span {
                color: #E4007E !important;
                font-weight: 500 !important;
                display: inline-block;
            }
            .tbr_brand_heading {
                margin-top: -5px;
            }
            .tbr_label {
                position: relative;
                margin: 0 0 30px 0;
            }
            .tbr_label .tbr_label_bullet {
                width: 37px;
                height: 37px;
                border-radius: 50%;
                background-color: #8DC31E;
                color: #FFFFFF !important;
                position: absolute;
                top: 0;
                left: 0;
                font-weight: 700;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .tbr_label .tbr_label_block {
                position: relative;
                display: block;
                width: 100%;
                height: 37px;
                border-radius: 37px 0 0 37px;
                background-color: #E4007E;
                color: #FFFFFF !important;
                font-weight: 600;
                padding: 7px 24px;
                right: -50px;
            }
            .tbr_data {
                padding-left: 36px;
            }
            .tbr_data_desc {
                padding-left: 0;
                border-top: 2px solid #EEEEEE;
                padding: 30px 0;
                margin-left: 16px;
                margin-right: -40px;
                padding-right: 40px;
                color: #777777 !important;
            }${
							alumni
								? `
            .tbr_table_below {
                width: 100%;
                height: 2px;
                background-color: #EEEEEE;
                padding: 0;
                margin-left: 16px;
                margin-right: -40px;
            }`
								: ""
						}`
