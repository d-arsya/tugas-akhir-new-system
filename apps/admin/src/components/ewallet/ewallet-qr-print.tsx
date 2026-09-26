import { useEffect, type JSX, type ReactNode } from "react"
import { createPortal } from "react-dom"
import { QRCodeSVG } from "qrcode.react"

import { useEwalletQrPrint, useEwalletQrPrintAll } from "@/hooks/use-ewallets"

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

const PRINT_ALL_PAGE_CSS = "@media print{@page{size:A4;margin-top:2.5cm}}"

type PrintLayerProps = { pageCss?: string; ready: boolean; children: ReactNode }

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
		// Two frames so the codes are painted before the print dialog snapshots the page
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

export const EwalletQrPrintSingle = ({ ewalletId }: { ewalletId: number }): JSX.Element => {
	const { data } = useEwalletQrPrint(ewalletId)

	return (
		<PrintLayer ready={data !== undefined}>
			{data ? (
				<div className="container">
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
