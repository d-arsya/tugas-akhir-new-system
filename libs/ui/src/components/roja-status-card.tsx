import type { JSX } from "react"
import type { RegistrantStatus } from "@roja/types"

export interface StatusConfig {
	label: string
	badgeClass: string
	desc: string
}

export interface RojaStatusCardProps {
	status: RegistrantStatus | string
	title?: string
	validationStatus?: "valid" | "invalid" | "fixed" | undefined
	validationNote?: string | undefined
	statusConfigs?: Record<string, StatusConfig>
	className?: string
}

const defaultStatusConfigs: Record<string, StatusConfig> = {
	approve: {
		label: "DITERIMA",
		badgeClass: "roja_label-solid-success",
		desc: "Selamat! Pendaftaran Anda telah disetujui dan diterima sebagai santri baru Pondok Roja.",
	},
	failed: {
		label: "DITOLAK",
		badgeClass: "roja_label-solid-danger",
		desc: "Mohon maaf, pendaftaran Anda belum memenuhi kriteria penerimaan.",
	},
	invalid: {
		label: "DATA TIDAK VALID",
		badgeClass: "roja_label-solid-warning",
		desc: "Ada beberapa berkas atau data yang perlu diperbaiki. Silakan periksa catatan panitia di bawah.",
	},
	fixed: {
		label: "TELAH DIPERBAIKI",
		badgeClass: "roja_label-solid-info",
		desc: "Perbaikan data Anda telah tersimpan. Mohon tunggu proses pemeriksaan ulang oleh panitia.",
	},
	indent_failed: {
		label: "GAGAL TES INDENT",
		badgeClass: "roja_label-solid-danger",
		desc: "Hasil tes seleksi gelombang indent Anda dinyatakan tidak lolos.",
	},
	wait: {
		label: "MENUNGGU VERIFIKASI",
		badgeClass: "roja_label-secondary",
		desc: "Berkas dan data pendaftaran Anda sedang dalam proses pemeriksaan dan verifikasi oleh tim panitia.",
	},
}

export const RojaStatusCard = ({
	status,
	title = "Status Pendaftaran",
	validationStatus = "valid",
	validationNote,
	statusConfigs,
	className = "",
}: RojaStatusCardProps): JSX.Element => {
	const configs = { ...defaultStatusConfigs, ...statusConfigs }
	const config: StatusConfig = configs[status] || {
		label: String(status).toUpperCase(),
		badgeClass: "roja_label-secondary",
		desc: "Status Anda saat ini sedang dalam proses pembaruan.",
	}

	return (
		<div className={`card-body bg-[var(--bg-secondary)] rounded-xl p-6 shadow-[0px_8px_30px_rgba(0,0,0,0.08)] border border-[var(--bg-form-border)] flex flex-col gap-4 ${className}`}>
			<h4 className="roja_card_title text-base font-semibold text-[var(--heading-txt-inverse)] mb-0">
				{title}
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

export default RojaStatusCard
