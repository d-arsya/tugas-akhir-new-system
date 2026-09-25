import { useEffect, type JSX, type ReactNode } from "react"
import { createPortal } from "react-dom"
import { QRCodeSVG } from "qrcode.react"

import { useEwalletQrPrint, useEwalletQrPrintAll } from "@/hooks/use-ewallets"

// Legacy `ewallet/qrcode-print.blade.php` and `qrcode-print-all.blade.php`: two bare HTML pages
// (Bootstrap's reboot and grid, no admin chrome) that call `window.print()` as soon as they load.
//
// The port's routes live inside the admin shell, so each page draws itself in a full-screen white
// layer above it and, under `@media print`, hides the app root and lets the layer flow across as
// many pages as the codes need. Bootstrap's `body` defaults are re-stated on the layer.

const PRINT_CSS = `
.ewallet-print-layer{position:fixed;inset:0;z-index:99999;overflow:auto;background:#fff;color:#212529;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans",sans-serif;font-size:1rem;font-weight:400;line-height:1.5;text-align:left}
.ewallet-print-layer *,.ewallet-print-layer *::before,.ewallet-print-layer *::after{box-sizing:border-box}
.ewallet-print-layer p{margin-top:0;margin-bottom:1rem}
.ewallet-print-layer .container{width:100%;padding-right:15px;padding-left:15px;margin-right:auto;margin-left:auto}
@media (min-width:576px){.ewallet-print-layer .container{max-width:540px}}
@media (min-width:768px){.ewallet-print-layer .container{max-width:720px}}
@media (min-width:992px){.ewallet-print-layer .container{max-width:960px}}
@media (min-width:1200px){.ewallet-print-layer .container{max-width:1140px}}
@media print{
	#root{display:none!important}
	.ewallet-print-layer{position:static;overflow:visible}
}
`

// `@media print { @page { size: A4; margin-top: 2.5cm } }` — the print-all page only
const PRINT_ALL_PAGE_CSS = "@media print{@page{size:A4;margin-top:2.5cm}}"

type PrintLayerProps = { pageCss?: string; ready: boolean; children: ReactNode }

/**
 * The layer, its `<title>` ("Print QR Code") and the `window.print()` call — once, as soon as the
 * codes are on screen (`ready`), which is where legacy's inline script sat.
 */
const PrintLayer = ({ pageCss = "", ready, children }: PrintLayerProps): JSX.Element => {
	useEffect(() => {
		const previous = document.title
		document.title = "Print QR Code"
		return () => {
			document.title = previous
		}
	}, [])

	useEffect(() => {
		if (!ready) return undefined
		// Two frames: the codes must be painted before the print dialog snapshots the page
		let second = 0
		const first = window.requestAnimationFrame(() => {
			second = window.requestAnimationFrame(() => window.print())
		})
		return () => {
			window.cancelAnimationFrame(first)
			window.cancelAnimationFrame(second)
		}
	}, [ready])

	return createPortal(
		<div className="ewallet-print-layer">
			<style>{PRINT_CSS + pageCss}</style>
			{children}
		</div>,
		document.body,
	)
}

/** `qrcode-print.blade.php` — one 500px code centred, the caption under it. */
export const EwalletQrPrintSingle = ({ ewalletId }: { ewalletId: number }): JSX.Element => {
	const { data } = useEwalletQrPrint(ewalletId)

	return (
		<PrintLayer ready={data !== undefined}>
			{data ? (
				<div className="container">
					{/* `.d-flex.justify-content-center.my-5#tbr_qrcode` */}
					<div id="tbr_qrcode" style={{ display: "flex", justifyContent: "center", margin: "3rem 0" }}>
						<QRCodeSVG value={data.qrValue ?? ""} size={500} level="Q" />
					</div>
					<p style={{ marginTop: "1rem", marginBottom: 0, textAlign: "center" }}>
						{data.caption}
					</p>
				</div>
			) : null}
		</PrintLayer>
	)
}

/** `qrcode-print-all.blade.php` — every santri's NIS as a 250px code, name above the NIS, wrapped in a 990px column. */
export const EwalletQrPrintAll = (): JSX.Element => {
	const { data } = useEwalletQrPrintAll()

	return (
		<PrintLayer ready={data !== undefined} pageCss={PRINT_ALL_PAGE_CSS}>
			{data ? (
				<div style={{ display: "flex", justifyContent: "center", width: "100%", padding: "0 15px" }}>
					<div style={{ maxWidth: 990 }}>
						<div id="tbr_qrcode" style={{ display: "flex", flexWrap: "wrap", justifyContent: "flex-start", alignItems: "center" }}>
							{data.map((row, index) => (
								<div
									key={`${row.nis ?? ""}-${index}`}
									style={{ display: "flex", flexDirection: "column", justifyContent: "flex-start", alignItems: "center", marginBottom: "1cm", marginLeft: 40, marginRight: 40 }}
								>
									<QRCodeSVG value={row.qrValue ?? ""} size={250} level="Q" />
									<p style={{ marginTop: "1rem", marginBottom: 0 }}>{row.name ?? "-"}</p>
									<p style={{ marginBottom: 0, textAlign: "center" }}>{row.nis}</p>
								</div>
							))}
						</div>
					</div>
				</div>
			) : null}
		</PrintLayer>
	)
}
