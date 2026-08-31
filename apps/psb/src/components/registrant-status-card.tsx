import type { JSX } from "react"
import type { RegistrantStatus } from "@roja/types"

type RegistrantStatusCardProps = {
	status: RegistrantStatus
	validationStatus?: "valid" | "invalid" | "fixed" | undefined
	validationNote?: string | undefined
}

const RegistrantStatusCard = ({
	status,
	validationStatus = "valid",
	validationNote,
}: RegistrantStatusCardProps): JSX.Element => {
	const getStatusConfig = (): { label: string; badgeClass: string; desc: string } => {
		switch (status) {
			case "approve":
				return {
					label: "DITERIMA",
					badgeClass: "roja_label-solid-success",
					desc: "Selamat! Pendaftaran Anda telah disetujui dan diterima sebagai santri baru Pondok Roja.",
				}
			case "failed":
				return {
					label: "DITOLAK",
					badgeClass: "roja_label-solid-danger",
					desc: "Mohon maaf, pendaftaran Anda belum memenuhi kriteria penerimaan.",
				}
			case "invalid":
				return {
					label: "DATA TIDAK VALID",
					badgeClass: "roja_label-solid-warning",
					desc: "Ada beberapa berkas atau data yang perlu diperbaiki. Silakan periksa catatan panitia di bawah.",
				}
			case "fixed":
				return {
					label: "TELAH DIPERBAIKI",
					badgeClass: "roja_label-solid-info",
					desc: "Perbaikan data Anda telah tersimpan. Mohon tunggu proses pemeriksaan ulang oleh panitia.",
				}
			case "indent_failed":
				return {
					label: "GAGAL TES INDENT",
					badgeClass: "roja_label-solid-danger",
					desc: "Hasil tes seleksi gelombang indent Anda dinyatakan tidak lolos.",
				}
			case "wait":
			default:
				return {
					label: "MENUNGGU VERIFIKASI",
					badgeClass: "roja_label-secondary",
					desc: "Berkas dan data pendaftaran Anda sedang dalam proses pemeriksaan dan verifikasi oleh tim panitia.",
				}
		}
	}

	const config = getStatusConfig()

	return (
		<div className="card-body bg-[var(--bg-secondary)] rounded-xl p-6 shadow-[0px_8px_30px_rgba(0,0,0,0.08)] border border-[var(--bg-form-border)] flex flex-col gap-4">
			<h4 className="roja_card_title text-base font-semibold text-[var(--heading-txt-inverse)] mb-0">
				Status Pendaftaran
			</h4>
			<div className="flex flex-col gap-3">
				<div className="flex items-center gap-3 flex-wrap">
					<span className={`roja_label ${config.badgeClass}`}>
						{config.label}
					</span>
					{validationStatus === "invalid" && status !== "invalid" && (
						<span className="roja_label roja_label-solid-danger">
							DATA PERLU DIPERBAIKI
						</span>
					)}
				</div>
				<p className="text-xs text-[var(--body-txt-inverse)] leading-relaxed m-0">
					{config.desc}
				</p>
				{validationNote && (status === "invalid" || validationStatus === "invalid") && (
					<div className="alert roja_alert-warning mt-2 p-3 text-xs border border-amber-300 rounded-lg">
						<strong>Catatan Panitia:</strong> {validationNote}
					</div>
				)}
			</div>
		</div>
	)
}

export default RegistrantStatusCard
