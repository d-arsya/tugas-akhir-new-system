import type { JSX } from "react"
import { useParams, createFileRoute } from "@tanstack/react-router"
import { psbApi } from "@/lib/api"
import { useQuery } from "@tanstack/react-query"
import { useEffect } from "react"
import { Button } from "@roja/ui"
import { Printer } from "lucide-react"
import RegistrationProofDocument from "@/components/print/RegistrationProofDocument"
import AnnouncementProofDocument from "@/components/print/AnnouncementProofDocument"

const PrintPage = (): JSX.Element => {
	const { type = "registration", registrantId = "0" } = useParams({ strict: false }) as {
		type?: string
		registrantId?: string
	}

	const { data, isLoading } = useQuery({
		queryKey: ["printData", type, registrantId],
		queryFn: () => psbApi.getPrintProof(type, parseInt(registrantId || "0")),
		enabled: !!registrantId && !!type,
	})

	useEffect(() => {
		let timer: ReturnType<typeof setTimeout> | undefined
		if (data) {
			timer = setTimeout(() => {
				window.print()
			}, 1000)
		}
		return () => {
			if (timer) clearTimeout(timer)
		}
	}, [data])

	if (isLoading) {
		return <div className="p-8 text-center text-xs text-slate-500 font-sans">Memuat dokumen cetak...</div>
	}

	if (!data || !data.registrant) {
		return <div className="p-8 text-center text-xs text-red-500 font-sans">Data pendaftaran tidak ditemukan.</div>
	}

	const registrant = data.registrant
	const school = data.school
	const announcement = data.announcement

	return (
		<div className="print-root min-h-screen bg-[#EEEEEE] flex flex-col items-center py-0 md:py-6">
			{/* Load Poppins Font directly for precise fidelity */}
			<link
				rel="stylesheet"
				href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,600&display=swap"
			/>

			{/* Exact Print Styles */}
			<style>{`
				@page {
					size: A4 portrait;
					margin: 0mm !important;
				}
				@media print {
					html, body, .print-root {
						background-color: #FFFFFF !important;
						margin: 0 !important;
						padding: 0 !important;
						width: 100% !important;
						height: 100% !important;
						-webkit-print-color-adjust: exact !important;
						print-color-adjust: exact !important;
					}
					.print-hide, .no-print, button, [class*="devtools"], [id*="devtools"], [data-tanstack-router-devtools] {
						display: none !important;
					}
					.invoice-wrap {
						box-shadow: none !important;
						margin: 0 !important;
						padding: 40px 40px 80px 40px !important;
						width: 100% !important;
						max-width: 100% !important;
						min-height: 100vh !important;
						page-break-after: avoid !important;
						page-break-inside: avoid !important;
						-webkit-print-color-adjust: exact !important;
						print-color-adjust: exact !important;
					}
					.invoice-watermark {
						-webkit-print-color-adjust: exact !important;
						print-color-adjust: exact !important;
					}
				}
				.invoice-text {
					font-family: 'Poppins', sans-serif !important;
					color: #777777 !important;
					line-height: 21px !important;
					font-size: 13px !important;
					letter-spacing: 0.3px !important;
				}
				.title-heading {
					font-family: 'Poppins', sans-serif !important;
					font-size: 18px !important;
					text-transform: uppercase !important;
					letter-spacing: 4px !important;
					color: #E4007E !important;
					font-weight: 700 !important;
					text-align: center !important;
				}
			`}</style>

			{/* Floating manual print button */}
			<div className="w-full max-w-[800px] flex justify-end mb-4 print:hidden px-4 md:px-0">
				<Button
					type="button"
					onClick={() => window.print()}
					variant="roja-primary"
					className="gap-2 shadow text-xs"
				>
					<Printer className="w-4 h-4" />
					<span>Cetak Dokumen Ini</span>
				</Button>
			</div>

			{/* Document View Switcher */}
			{type === "registration" ? (
				<RegistrationProofDocument registrant={registrant} school={school} />
			) : (
				<AnnouncementProofDocument type={type} registrant={registrant} school={school} announcement={announcement} />
			)}
		</div>
	)
}

export const Route = createFileRoute("/print/$type/$registrantId")({
	component: PrintPage,
})

export default PrintPage
