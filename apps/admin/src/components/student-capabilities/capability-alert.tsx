import type { JSX } from "react"

import type { CapabilityAlertState } from "@roja/types"

import LegacyButton from "@/components/legacy/legacy-button"

import { ClipboardCheckIcon, WarningTriangleIcon } from "./capability-icons"

const ALERT = "relative mb-[16px] rounded-[8px] border-0 p-[16px]"
const DANGER = "bg-[rgba(var(--danger-rgb),0.1)] text-[var(--danger)]"
const SUCCESS = "bg-[rgba(var(--success-rgb),0.1)] text-[var(--success)]"

type CapabilityAlertProps = {
	alert: CapabilityAlertState
	creating: boolean
	onCreate: () => void
	onChange: () => void
}

const CapabilityAlert = ({ alert, creating, onCreate, onChange }: CapabilityAlertProps): JSX.Element | null => {
	if (alert === "no-capability") {
		return (
			<div className={`${ALERT} ${DANGER}`}>
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
