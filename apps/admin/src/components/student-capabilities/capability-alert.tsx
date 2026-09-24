import type { JSX } from "react"

import type { CapabilityAlertState } from "@roja/types"

import LegacyButton from "@/components/legacy/legacy-button"

import { ClipboardCheckIcon, WarningTriangleIcon } from "./capability-icons"

// `.alert` (bootstrap 4 margin-bottom 1rem; app.css 1322-1325: no border, 8px radius) + `.p-3`
const ALERT = "relative mb-[16px] rounded-[8px] border-0 p-[16px]"
// `.tbr_alert-danger` / `.tbr_alert-success` (app.css 1342-1355)
const DANGER = "bg-[rgba(var(--danger-rgb),0.1)] text-[var(--danger)]"
const SUCCESS = "bg-[rgba(var(--success-rgb),0.1)] text-[var(--success)]"

type CapabilityAlertProps = {
	alert: CapabilityAlertState
	creating: boolean
	onCreate: () => void
	onChange: () => void
}

/**
 * `student-capability.blade.php:41-99` — the three `@if` branches above the history table.
 *
 * The newest capability being `changed` matches none of them, so legacy renders **no banner**;
 * the contract carries that as `alert: null` and this renders nothing for it.
 */
const CapabilityAlert = ({ alert, creating, onCreate, onChange }: CapabilityAlertProps): JSX.Element | null => {
	if (alert === "no-capability") {
		return (
			<div className={`${ALERT} ${DANGER}`}>
				{/* `.row.no-gutters.align-items-center.justify-content-between` */}
				<div className="flex flex-wrap items-center justify-between">
					<div className="w-full min-[768px]:w-1/2">
						<div className="mb-[16px] flex items-center min-[768px]:mb-0">
							<WarningTriangleIcon />
							<span>Belum ada kesanggupan biaya santri baru</span>
						</div>
					</div>
					<div className="w-full min-[768px]:w-1/4">
						<LegacyButton variant="danger" loading={creating} onClick={onCreate} className="w-full">
							Buat kesanggupan
						</LegacyButton>
					</div>
				</div>
			</div>
		)
	}

	if (alert === "unagreed") {
		return (
			<div className={`${ALERT} ${DANGER}`}>
				<div className="flex items-center">
					<ClipboardCheckIcon color="#f8374b" />
					<span>Sudah dibuat kesanggupan tapi belum disepakati oleh kedua belah pihak.</span>
				</div>
			</div>
		)
	}

	if (alert === "agreed") {
		return (
			<div className={`${ALERT} ${SUCCESS}`}>
				<div className="flex flex-wrap items-center justify-between">
					<div className="w-full min-[768px]:w-7/12">
						<div className="mb-[16px] flex items-center min-[768px]:mb-0">
							<ClipboardCheckIcon color="#28af52" />
							<span>Sudah memiliki kesanggupan yang telah disepakati.</span>
						</div>
					</div>
					<div className="w-full min-[768px]:w-1/4">
						{/* `onclick="showModalHelp('#modalChange')"` */}
						<LegacyButton variant="success" onClick={onChange} className="w-full">
							Ubah kesepakatan
						</LegacyButton>
					</div>
				</div>
			</div>
		)
	}

	return null
}

export default CapabilityAlert
