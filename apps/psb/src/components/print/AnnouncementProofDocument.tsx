import type { JSX } from "react"

export interface AnnouncementProofDocumentProps {
	type: string
	registrant: any
	school?: any
	announcement?: any
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
	return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`
}

export const AnnouncementProofDocument = ({
	type,
	registrant,
	school,
	announcement,
}: AnnouncementProofDocumentProps): JSX.Element => {
	const renderContent = () => {
		if (type === "accepted") {
			return (
				<>
					<h1 className="title-heading mt-[20px] mb-[25px]">BUKTI PENGUMUMAN SANTRI BARU</h1>
					<p className="mb-[20px]" style={{ color: "#777777" }}>Dengan ini menyatakan bahwa :</p>
					<div className="pl-[30px] mb-[25px]">
						<table className="w-full border-collapse">
							<tbody>
								<tr>
									<td className="py-[6px] px-[16px] align-top font-semibold min-w-[180px] text-[#777777]">No. Pendaftaran</td>
									<td className="py-[6px] px-[16px] align-top italic text-[#777777]">{registrant.registrantId}</td>
								</tr>
								<tr>
									<td className="py-[6px] px-[16px] align-top font-semibold min-w-[180px] text-[#777777]">Nama</td>
									<td className="py-[6px] px-[16px] align-top italic text-[#777777]">{registrant.fullname}</td>
								</tr>
								<tr>
									<td className="py-[6px] px-[16px] align-top font-semibold min-w-[180px] text-[#777777]">Keterangan</td>
									<td className="py-[6px] px-[16px] align-top italic text-[#777777]">
										{announcement?.successDesc ? (
											<div dangerouslySetInnerHTML={{ __html: announcement.successDesc }} />
										) : (
											<span>Selamat! Anda dinyatakan LULUS / DITERIMA sebagai calon santri baru.</span>
										)}
									</td>
								</tr>
								{announcement?.dateStart && (
									<tr>
										<td className="py-[6px] px-[16px] align-top font-semibold min-w-[180px] text-[#777777]">Tanggal Daftar Ulang</td>
										<td className="py-[6px] px-[16px] align-top italic text-[#777777]">
											{formatShortDate(announcement.dateStart)} sd. {formatShortDate(announcement.dateEnd)}
										</td>
									</tr>
								)}
								{announcement?.information && (
									<tr>
										<td className="py-[6px] px-[16px] align-top font-semibold min-w-[180px] text-[#777777]">Berkas Daftar Ulang</td>
										<td className="py-[6px] px-[16px] align-top italic text-[#777777]">
											<div dangerouslySetInnerHTML={{ __html: announcement.information }} />
										</td>
									</tr>
								)}
								{announcement?.additionalInformation && (
									<tr>
										<td className="py-[6px] px-[16px] align-top font-semibold min-w-[180px] text-[#777777]">Pengumuman Lainnya</td>
										<td className="py-[6px] px-[16px] align-top italic text-[#777777]">
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

					<div className="w-full flex justify-end mt-6">
						<div className="w-[280px] text-center text-[#777777]">
							<p className="m-0 font-semibold text-[13px]">Mengetahui Orang Tua atau Wali</p>
							<p className="m-0 text-xs">Tanggal &nbsp; . . . . / . . . . . . . . . . . . . . . / . . . . . .</p>
							<div className="h-[75px]" />
							<p className="m-0 text-xs">( . . . . . . . . . . . . . . . . . . . . . . . . . . . . . )</p>
							<p className="m-0 text-xs">Nama Orang Tua atau Wali</p>
						</div>
					</div>
				</>
			)
		}

		const isIndent = type === "indent-rejected"
		const defaultText = isIndent
			? "Mohon maaf, Anda tidak lulus seleksi penerimaan santri baru jalur indent."
			: "Mohon maaf, Anda dinyatakan belum lolos seleksi penerimaan santri baru Pondok Roja."

		return (
			<>
				<h1 className="title-heading mt-[20px] mb-[25px]">BUKTI PENGUMUMAN SANTRI BARU</h1>
				<p className="mb-[20px]" style={{ color: "#777777" }}>Dengan ini menyatakan bahwa :</p>
				<div className="pl-[30px] mb-[25px]">
					<table className="w-full border-collapse">
						<tbody>
							<tr>
								<td className="py-[6px] px-[16px] align-top font-semibold min-w-[180px] text-[#777777]">No. Pendaftaran</td>
								<td className="py-[6px] px-[16px] align-top italic text-[#777777]">{registrant.registrantId}</td>
							</tr>
							<tr>
								<td className="py-[6px] px-[16px] align-top font-semibold min-w-[180px] text-[#777777]">Nama</td>
								<td className="py-[6px] px-[16px] align-top italic text-[#777777]">{registrant.fullname}</td>
							</tr>
							<tr>
								<td className="py-[6px] px-[16px] align-top font-semibold min-w-[180px] text-[#777777]">Keterangan</td>
								<td className="py-[6px] px-[16px] align-top italic text-[#777777]">
									{announcement?.failedDesc ? (
										<div dangerouslySetInnerHTML={{ __html: announcement.failedDesc }} />
									) : (
										<span>{defaultText}</span>
									)}
								</td>
							</tr>
						</tbody>
					</table>
				</div>
				<p style={{ color: "#777777" }}>Tetap semangat dan jangan menyerah.</p>
			</>
		)
	}

	return (
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

			<div className="invoice-header pl-[100px] pb-[20px] mb-[16px] relative z-20">
				<div className="flex flex-row justify-between items-start gap-4">
					<div className="flex flex-col">
						{school?.logo ? (
							<img
								src={school.logo.startsWith("http") ? school.logo : `/storage/${school.logo}`}
								alt={school.name || "Logo"}
								className="h-10 mb-1 object-contain self-start -mt-2"
							/>
						) : (
							<h2 className="font-bold text-[24px] tracking-wide m-0 mb-1 style={{ color: '#E4007E' }}">ROJA</h2>
						)}
						<p className="p-0 m-0 font-semibold text-[14px] tracking-[1px] style={{ color: '#777777' }}">
							{school?.name || "TMQ (TARBIYYATU MUHAFFIZHATIL QUR'AN) PONDOK ROJA"}
						</p>
						<p className="p-0 m-0 text-xs style={{ color: '#ABB4BE' }}">
							Telepon : +62 {school?.phone || "81392104443"}
						</p>
					</div>
					<div className="text-right text-xs max-w-[320px] leading-[20px] style={{ color: '#ABB4BE' }}">
						<p className="p-0 m-0 whitespace-pre-line">
							{school?.fullAddress || "Brumbung RT 03/02 Kelurahan Dukuh\nKecamatan Sukoharjo, Kabupaten Sukoharjo\nProvinsi Jawa Tengah"}
						</p>
					</div>
				</div>
			</div>

			<div className="invoice-body w-full min-h-[500px] pl-[100px] pr-0 pb-[20px] relative z-20">
				{renderContent()}
			</div>

			<div className="invoice-footer text-center pl-[100px] border-t border-[#EEEEEE] pt-[20px] relative z-20">
				<p className="p-0 m-0 text-xs text-[#ABB4BE]">
					© Copyright 2026 TMQ (TARBIYYATU MUHAFFIZHATIL QUR'AN) PONDOK ROJA. All Rights Reserved.
				</p>
			</div>
		</div>
	)
}

export default AnnouncementProofDocument

