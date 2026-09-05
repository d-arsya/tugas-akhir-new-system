import type { JSX } from "react"
import { useParams, createFileRoute } from "@tanstack/react-router"
import { psbApi } from "@/lib/api"
import { useQuery } from "@tanstack/react-query"
import { useEffect } from "react"
import { Button } from "@roja/ui"
import { Printer } from "lucide-react"

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

	const formatRegistrationDate = (dateStr?: string | Date | null): string => {
		if (!dateStr) return "-"
		const d = new Date(dateStr)
		if (isNaN(d.getTime())) return String(dateStr)
		const day = String(d.getDate()).padStart(2, "0")
		const months = [
			"Januari", "Februari", "Maret", "April", "Mei", "Juni",
			"Juli", "Agustus", "September", "Oktober", "November", "Desember"
		]
		const month = months[d.getMonth()]
		const year = d.getFullYear()
		const hours = String(d.getHours()).padStart(2, "0")
		const minutes = String(d.getMinutes()).padStart(2, "0")
		return `${day} ${month} ${year} jam ${hours}:${minutes}`
	}

	const formatShortDate = (dateStr?: string | Date | null): string => {
		if (!dateStr) return "-"
		const d = new Date(dateStr)
		if (isNaN(d.getTime())) return String(dateStr)
		const day = String(d.getDate()).padStart(2, "0")
		const months = [
			"Januari", "Februari", "Maret", "April", "Mei", "Juni",
			"Juli", "Agustus", "September", "Oktober", "November", "Desember"
		]
		const month = months[d.getMonth()]
		const year = d.getFullYear()
		return `${day} ${month} ${year}`
	}

	return (
		<div className="print-root min-h-screen bg-[#EEEEEE] flex flex-col items-center py-0 md:py-6">
			{/* Load Poppins Font directly for precise fidelity */}
			<link
				rel="stylesheet"
				href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,600&display=swap"
			/>

			{/* Exact Print Styles from Blade */}
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

			{/* Floating manual print button (hidden when printing) */}
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

			{/* Invoice Wrap Container */}
			<div
				className="invoice-wrap w-full max-w-[800px] bg-white min-h-[1056px] relative p-[40px_40px_80px_40px] shadow-md print:shadow-none overflow-hidden box-border invoice-text"
				style={{
					fontFamily: "'Poppins', sans-serif",
					color: "#777777",
					lineHeight: "21px",
					fontSize: "13px",
					letterSpacing: "0.3px",
				}}
			>
				{/* Pink Ribbon Watermark on Left Margin */}
				<div
					className="invoice-watermark absolute top-0 bottom-0 left-0 w-[100px] h-full min-h-full bg-[#E4007E] z-10 overflow-hidden"
					style={{ backgroundColor: "#E4007E" }}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="100"
						height="100%"
						viewBox="0 0 100 1122"
						preserveAspectRatio="none"
						className="w-[100px] h-full absolute top-0 left-0"
					>
						<g transform="translate(6069 16856)">
							<rect width="100" height="1122" transform="translate(-6069 -16856)" fill="#E4007E" />
							<rect width="100" height="902" transform="translate(-6069 -16636)" fill="#FFFFFF" opacity="0.15" />
							<rect width="100" height="682" transform="translate(-6069 -16416)" fill="#FFFFFF" opacity="0.2" />
						</g>
					</svg>
				</div>

				{/* Invoice Header (Kop Surat) */}
				<div className="invoice-header pl-[100px] pb-[20px] mb-[16px] relative z-20">
					<div className="flex flex-row justify-between items-start gap-4">
						{/* Left: Brand / School Logo */}
						<div className="flex flex-col">
							{school?.logo ? (
								<img
									src={school.logo.startsWith("http") ? school.logo : `/storage/${school.logo}`}
									alt={school.name || "Logo"}
									className="h-10 mb-1 object-contain self-start -mt-2"
								/>
							) : (
								<h2
									className="font-bold text-[24px] tracking-wide m-0 mb-1"
									style={{ color: "#E4007E", fontWeight: 700 }}
								>
									ROJA
								</h2>
							)}
							<p
								className="p-0 m-0 font-semibold text-[14px] tracking-[1px]"
								style={{ color: "#777777", fontWeight: 600, fontSize: "14px", letterSpacing: "1px" }}
							>
								{school?.name || "TMQ (TARBIYYATU MUHAFFIZHATIL QUR'AN) PONDOK ROJA"}
							</p>
							<p
								className="p-0 m-0 text-xs"
								style={{ color: "#ABB4BE", fontSize: "12px" }}
							>
								Telepon : +62 {school?.phone || "81392104443"}
							</p>
						</div>

						{/* Right: School Address */}
						<div
							className="text-right text-xs max-w-[320px] leading-[20px]"
							style={{ color: "#ABB4BE", fontSize: "12px", lineHeight: "19px" }}
						>
							<p className="p-0 m-0 whitespace-pre-line">
								{school?.fullAddress || "Brumbung RT 03/02 Kelurahan Dukuh\nKecamatan Sukoharjo, Kabupaten Sukoharjo\nProvinsi Jawa Tengah"}
							</p>
						</div>
					</div>
				</div>

				{/* Invoice Body */}
				<div className="invoice-body w-full min-h-[500px] pl-[100px] pr-0 pb-[20px] relative z-20">
					{/* Type: REGISTRATION */}
					{type === "registration" && (
						<>
							<h1 className="title-heading mt-[20px] mb-[25px]">
								BUKTI PENDAFTARAN SANTRI BARU
							</h1>
							<p className="mb-[20px]" style={{ color: "#777777" }}>
								Saya telah melakukan pendaftaran dengan bukti sebagai berikut :
							</p>
							<div className="pl-[30px] mb-[25px]">
								<table className="w-full border-collapse">
									<tbody>
										<tr>
											<td
												className="py-[6px] px-[16px] align-top"
												style={{ minWidth: "180px", fontWeight: 600, color: "#777777" }}
											>
												No. Pendaftaran
											</td>
											<td
												className="py-[6px] px-[16px] align-top"
												style={{ fontStyle: "italic", color: "#777777" }}
											>
												{registrant.registrantId}
											</td>
										</tr>
										<tr>
											<td
												className="py-[6px] px-[16px] align-top"
												style={{ minWidth: "180px", fontWeight: 600, color: "#777777" }}
											>
												Nama
											</td>
											<td
												className="py-[6px] px-[16px] align-top"
												style={{ fontStyle: "italic", color: "#777777" }}
											>
												{registrant.fullname}
											</td>
										</tr>
										<tr>
											<td
												className="py-[6px] px-[16px] align-top"
												style={{ minWidth: "180px", fontWeight: 600, color: "#777777" }}
											>
												Email
											</td>
											<td
												className="py-[6px] px-[16px] align-top"
												style={{ fontStyle: "italic", color: "#777777" }}
											>
												{registrant.email}
											</td>
										</tr>
										<tr>
											<td
												className="py-[6px] px-[16px] align-top"
												style={{ minWidth: "180px", fontWeight: 600, color: "#777777" }}
											>
												Nama Orang Tua
											</td>
											<td
												className="py-[6px] px-[16px] align-top"
												style={{ fontStyle: "italic", color: "#777777" }}
											>
												{registrant.fatherFullname || "-"}
											</td>
										</tr>
										<tr>
											<td
												className="py-[6px] px-[16px] align-top"
												style={{ minWidth: "180px", fontWeight: 600, color: "#777777" }}
											>
												Asal Sekolah
											</td>
											<td
												className="py-[6px] px-[16px] align-top"
												style={{ fontStyle: "italic", color: "#777777" }}
											>
												{registrant.schoolName || "-"}
											</td>
										</tr>
										<tr>
											<td
												className="py-[6px] px-[16px] align-top"
												style={{ minWidth: "180px", fontWeight: 600, color: "#777777" }}
											>
												Tanggal Mendaftar
											</td>
											<td
												className="py-[6px] px-[16px] align-top"
												style={{ fontStyle: "italic", color: "#777777" }}
											>
												{formatRegistrationDate(registrant.createdAt)}
											</td>
										</tr>
									</tbody>
								</table>
							</div>
							<p style={{ color: "#777777", lineHeight: "21px" }}>
								Ini adalah bukti pendaftaran yang sah, dan dapat diberikan kepada yang bersangkutan untuk dipergunakan sebagaimana mestinya.
							</p>
						</>
					)}

					{/* Type: ACCEPTED */}
					{type === "accepted" && (
						<>
							<h1 className="title-heading mt-[20px] mb-[25px]">
								BUKTI PENGUMUMAN SANTRI BARU
							</h1>
							<p className="mb-[20px]" style={{ color: "#777777" }}>
								Dengan ini menyatakan bahwa :
							</p>
							<div className="pl-[30px] mb-[25px]">
								<table className="w-full border-collapse">
									<tbody>
										<tr>
											<td
												className="py-[6px] px-[16px] align-top"
												style={{ minWidth: "180px", fontWeight: 600, color: "#777777" }}
											>
												No. Pendaftaran
											</td>
											<td
												className="py-[6px] px-[16px] align-top"
												style={{ fontStyle: "italic", color: "#777777" }}
											>
												{registrant.registrantId}
											</td>
										</tr>
										<tr>
											<td
												className="py-[6px] px-[16px] align-top"
												style={{ minWidth: "180px", fontWeight: 600, color: "#777777" }}
											>
												Nama
											</td>
											<td
												className="py-[6px] px-[16px] align-top"
												style={{ fontStyle: "italic", color: "#777777" }}
											>
												{registrant.fullname}
											</td>
										</tr>
										<tr>
											<td
												className="py-[6px] px-[16px] align-top"
												style={{ minWidth: "180px", fontWeight: 600, color: "#777777" }}
											>
												Keterangan
											</td>
											<td
												className="py-[6px] px-[16px] align-top"
												style={{ fontStyle: "italic", color: "#777777" }}
											>
												{announcement?.successDesc ? (
													<div dangerouslySetInnerHTML={{ __html: announcement.successDesc }} />
												) : (
													<span>Selamat! Anda dinyatakan LULUS / DITERIMA sebagai calon santri baru.</span>
												)}
											</td>
										</tr>
										{announcement?.dateStart && (
											<tr>
												<td
													className="py-[6px] px-[16px] align-top"
													style={{ minWidth: "180px", fontWeight: 600, color: "#777777" }}
												>
													Tanggal Daftar Ulang
												</td>
												<td
													className="py-[6px] px-[16px] align-top"
													style={{ fontStyle: "italic", color: "#777777" }}
												>
													{formatShortDate(announcement.dateStart)} sd. {formatShortDate(announcement.dateEnd)}
												</td>
											</tr>
										)}
										{announcement?.information && (
											<tr>
												<td
													className="py-[6px] px-[16px] align-top"
													style={{ minWidth: "180px", fontWeight: 600, color: "#777777" }}
												>
													Berkas Daftar Ulang
												</td>
												<td
													className="py-[6px] px-[16px] align-top"
													style={{ fontStyle: "italic", color: "#777777" }}
												>
													<div dangerouslySetInnerHTML={{ __html: announcement.information }} />
												</td>
											</tr>
										)}
										{announcement?.additionalInformation && (
											<tr>
												<td
													className="py-[6px] px-[16px] align-top"
													style={{ minWidth: "180px", fontWeight: 600, color: "#777777" }}
												>
													Pengumuman Lainnya
												</td>
												<td
													className="py-[6px] px-[16px] align-top"
													style={{ fontStyle: "italic", color: "#777777" }}
												>
													<div dangerouslySetInnerHTML={{ __html: announcement.additionalInformation }} />
												</td>
											</tr>
										)}
									</tbody>
								</table>
							</div>
							<p className="mb-[40px]" style={{ color: "#777777" }}>
								Ini adalah bukti pendaftaran yang sah, dan dapat diberikan kepada yang bersangkutan untuk dipergunakan sebagaimana mestinya.
							</p>

							{/* Guardian Signature Block */}
							<div className="w-full flex justify-end mt-6">
								<div className="w-[280px] text-center" style={{ color: "#777777" }}>
									<p className="m-0 font-semibold text-[13px]" style={{ fontWeight: 600 }}>
										Mengetahui Orang Tua atau Wali
									</p>
									<p className="m-0 text-xs">
										Tanggal &nbsp; . . . . / . . . . . . . . . . . . . . . / . . . . . .
									</p>
									<div className="h-[75px]" />
									<p className="m-0 text-xs">( . . . . . . . . . . . . . . . . . . . . . . . . . . . . . )</p>
									<p className="m-0 text-xs">Nama Orang Tua atau Wali</p>
								</div>
							</div>
						</>
					)}

					{/* Type: REJECTED */}
					{type === "rejected" && (
						<>
							<h1 className="title-heading mt-[20px] mb-[25px]">
								BUKTI PENGUMUMAN SANTRI BARU
							</h1>
							<p className="mb-[20px]" style={{ color: "#777777" }}>
								Dengan ini menyatakan bahwa :
							</p>
							<div className="pl-[30px] mb-[25px]">
								<table className="w-full border-collapse">
									<tbody>
										<tr>
											<td
												className="py-[6px] px-[16px] align-top"
												style={{ minWidth: "180px", fontWeight: 600, color: "#777777" }}
											>
												No. Pendaftaran
											</td>
											<td
												className="py-[6px] px-[16px] align-top"
												style={{ fontStyle: "italic", color: "#777777" }}
											>
												{registrant.registrantId}
											</td>
										</tr>
										<tr>
											<td
												className="py-[6px] px-[16px] align-top"
												style={{ minWidth: "180px", fontWeight: 600, color: "#777777" }}
											>
												Nama
											</td>
											<td
												className="py-[6px] px-[16px] align-top"
												style={{ fontStyle: "italic", color: "#777777" }}
											>
												{registrant.fullname}
											</td>
										</tr>
										<tr>
											<td
												className="py-[6px] px-[16px] align-top"
												style={{ minWidth: "180px", fontWeight: 600, color: "#777777" }}
											>
												Keterangan
											</td>
											<td
												className="py-[6px] px-[16px] align-top"
												style={{ fontStyle: "italic", color: "#777777" }}
											>
												{announcement?.failedDesc ? (
													<div dangerouslySetInnerHTML={{ __html: announcement.failedDesc }} />
												) : (
													<span>Mohon maaf, Anda dinyatakan belum lolos seleksi penerimaan santri baru Pondok Roja.</span>
												)}
											</td>
										</tr>
									</tbody>
								</table>
							</div>
							<p style={{ color: "#777777" }}>Tetap semangat dan jangan menyerah.</p>
						</>
					)}

					{/* Type: INDENT-REJECTED */}
					{type === "indent-rejected" && (
						<>
							<h1 className="title-heading mt-[20px] mb-[25px]">
								BUKTI PENGUMUMAN SANTRI BARU
							</h1>
							<p className="mb-[20px]" style={{ color: "#777777" }}>
								Dengan ini menyatakan bahwa :
							</p>
							<div className="pl-[30px] mb-[25px]">
								<table className="w-full border-collapse">
									<tbody>
										<tr>
											<td
												className="py-[6px] px-[16px] align-top"
												style={{ minWidth: "180px", fontWeight: 600, color: "#777777" }}
											>
												No. Pendaftaran
											</td>
											<td
												className="py-[6px] px-[16px] align-top"
												style={{ fontStyle: "italic", color: "#777777" }}
											>
												{registrant.registrantId}
											</td>
										</tr>
										<tr>
											<td
												className="py-[6px] px-[16px] align-top"
												style={{ minWidth: "180px", fontWeight: 600, color: "#777777" }}
											>
												Nama
											</td>
											<td
												className="py-[6px] px-[16px] align-top"
												style={{ fontStyle: "italic", color: "#777777" }}
											>
												{registrant.fullname}
											</td>
										</tr>
										<tr>
											<td
												className="py-[6px] px-[16px] align-top"
												style={{ minWidth: "180px", fontWeight: 600, color: "#777777" }}
											>
												Keterangan
											</td>
											<td
												className="py-[6px] px-[16px] align-top"
												style={{ fontStyle: "italic", color: "#777777" }}
											>
												{announcement?.failedDesc ? (
													<div dangerouslySetInnerHTML={{ __html: announcement.failedDesc }} />
												) : (
													<span>Mohon maaf, Anda tidak lulus seleksi penerimaan santri baru jalur indent.</span>
												)}
											</td>
										</tr>
									</tbody>
								</table>
							</div>
							<p style={{ color: "#777777" }}>Tetap semangat dan jangan menyerah.</p>
						</>
					)}
				</div>
			</div>
		</div>
	)
}

export const Route = createFileRoute("/print/$type/$registrantId")({
	component: PrintPage,
})

export default PrintPage
