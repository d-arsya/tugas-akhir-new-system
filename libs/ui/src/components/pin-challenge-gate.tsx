import type { JSX } from "react"
import { useState } from "react"
import { KeyRound } from "lucide-react"
import { RojaCard } from "./roja-card"
import { Alert, AlertDescription } from "./ui/alert"
import PinInput from "./pin-input"

export interface PinChallengeGateProps {
	title?: string
	description?: string
	buttonText?: string
	submittingText?: string
	onSubmitPin: (pin: string) => Promise<void>
	className?: string
}

export const PinChallengeGate = ({
	title = "Masukkan PIN E-Wallet",
	description = "Memastikan bahwa benar dompet ini milik kamu.",
	buttonText = "Masuk ke Dompet Digital",
	submittingText = "Memeriksa PIN...",
	onSubmitPin,
	className = "",
}: PinChallengeGateProps): JSX.Element => {
	const [pinInputVal, setPinInputVal] = useState<string>("")
	const [pinError, setPinError] = useState<string>("")
	const [pinLoading, setPinLoading] = useState<boolean>(false)

	const submitPin = async (pinValue: string) => {
		if (pinValue.length < 6) {
			setPinError("Masukkan 6 digit PIN terlebih dahulu.")
			return
		}
		setPinError("")
		setPinLoading(true)
		try {
			await onSubmitPin(pinValue)
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : "PIN yang kamu masukkan salah."
			setPinError(msg)
			setPinInputVal("")
		} finally {
			setPinLoading(false)
		}
	}

	return (
		<div className="mx-auto w-full">
			<RojaCard className={`p-8 sm:p-12 text-center shadow-sm rounded-2xl border-slate-100 bg-white dark:bg-[#17283c] ${className}`}>
				<div className="flex flex-col items-center">
					<div className="w-12 h-12 rounded-2xl bg-pink-50 dark:bg-pink-950/40 flex items-center justify-center mb-6 shadow-inner">
						<KeyRound className="w-8 h-8 text-[#e4007e]" />
					</div>

					<h5 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
						{title}
					</h5>
					<p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md">
						{description}
					</p>

					{pinError && (
						<Alert variant="destructive" className="mt-4 text-xs py-2 max-w-sm">
							<AlertDescription>{pinError}</AlertDescription>
						</Alert>
					)}

					<div className="my-8">
						<PinInput
							value={pinInputVal}
							onChange={(val) => {
								setPinInputVal(val)
								if (val.length === 6) {
									setPinError("")
									submitPin(val)
								}
							}}
							disabled={pinLoading}
							error={!!pinError}
							length={6}
						/>
					</div>
				</div>
			</RojaCard>
		</div>
	)
}

export default PinChallengeGate
