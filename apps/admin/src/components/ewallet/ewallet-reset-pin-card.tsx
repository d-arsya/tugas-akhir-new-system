import { useEffect, useState, type JSX } from "react"

import type { EwalletSettingPage } from "@roja/types"

import LegacyButton from "@/components/legacy/legacy-button"
import LegacyCard from "@/components/legacy/legacy-card"
import LegacyInput from "@/components/legacy/legacy-input"
import { useSendEwalletResetEmail } from "@/hooks/use-ewallets"

import { useEwalletModals } from "./modals/ewallet-money-modals"

export const CARD_TITLE_CLASS = "m-0! mb-[10px]! text-[15.4px]! leading-[18px]! font-medium! tracking-normal!"

const two = (value: number): string => (value < 10 ? `0${value}` : String(value))

const ThrottleAlert = ({ retryAfter }: { retryAfter: number }): JSX.Element | null => {
	const [end] = useState(() => Date.now() + retryAfter * 1000)
	// Reads 00 until the first tick, one second after load
	const [left, setLeft] = useState<number | null>(null)

	useEffect(() => {
		const timer = window.setInterval(() => setLeft(end - Date.now()), 1000)
		return () => window.clearInterval(timer)
	}, [end])

	if (left !== null && left < 0) return null

	const minutes = left === null ? 0 : Math.floor((left % (1000 * 60 * 60)) / (1000 * 60))
	const seconds = left === null ? 0 : Math.floor((left % (1000 * 60)) / 1000)

	return (
		<div className="mx-[-15px] flex flex-wrap">
			<div className="w-full px-[15px] min-[992px]:w-1/2">
				<div id="throttle-alert" className="mb-[16px] rounded-[4px] bg-[rgba(var(--danger-rgb),0.1)] px-[20px] py-[12px] text-[var(--danger)]">
					<span>
						Anda sudah mengirim email 5 kali. <br />
						Silahkan tunggu setelah <span id="minutes">{two(minutes)}</span> menit <span id="seconds">{two(seconds)}</span> detik.
					</span>
				</div>
			</div>
		</div>
	)
}

const EwalletResetPinCard = ({ setting }: { setting: EwalletSettingPage }): JSX.Element => {
	const sendEmail = useSendEwalletResetEmail(setting.id)
	const { openResetPin } = useEwalletModals()
	const who = setting.ownerType === "santri" ? "santri" : "merchant"

	return (
		<LegacyCard className="mt-0">
			<h5 className={CARD_TITLE_CLASS}>Reset pin</h5>
			<p className="mt-0 mb-[20px] leading-[24px]">Bantu {who} untuk mereset pinnya.</p>

			{setting.resetEmailRetryAfter > 0 ? <ThrottleAlert retryAfter={setting.resetEmailRetryAfter} /> : null}

			{!setting.ownerBlocked ? (
				<form
					id="tbr_email_form"
					onSubmit={(event) => {
						event.preventDefault()
						sendEmail.mutate()
					}}
				>
					<div className="mx-[-15px] mb-[16px] flex flex-wrap">
						<div className="w-full px-[15px] min-[768px]:w-1/2">
							<LegacyInput type="email" id="email" value={setting.ownerEmail ?? ""} readOnly />
						</div>
						<div className="w-full px-[15px] min-[768px]:w-1/6">
							<LegacyButton variant="info" type="submit" loading={sendEmail.isPending}>
								Kirim
							</LegacyButton>
						</div>
					</div>
				</form>
			) : (
				<LegacyButton variant="info" className="mt-[24px]" onClick={openResetPin}>
					Reset Pin
				</LegacyButton>
			)}
		</LegacyCard>
	)
}

export default EwalletResetPinCard
